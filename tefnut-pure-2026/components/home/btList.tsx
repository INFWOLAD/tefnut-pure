import { AppState, View, ScrollView, Pressable, Alert, type AlertButton } from 'react-native'
import { use, useEffect, useRef } from 'react'
import { Progress } from '@/components//ui/progress'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { useBtList } from '@/hooks/useBtList'
import { homeStore } from '@/store/homeStore'
import { commonStore } from '@/store/commonStore'
import { Icon } from '@/components/ui/icon'
import {
  ArrowDown,
  ArrowDownCircle,
  ArrowRightCircle,
  ArrowUp,
  ArrowUpCircle,
  FileScan,
  Link,
} from 'lucide-react-native'
import { request } from '@/utils/request'

const stateMap: { [key: string]: string } = {
  error: '错误',
  pausedUP: '上传已暂停',
  pausedDL: '下载已暂停',
  queuedUP: '排队上传',
  queuedDL: '排队下载',
  checkingUP: '检查上传',
  checkingDL: '检查下载',
  downloading: '下载中',
  stalledDL: '下载停滞',
  checkingResumeData: '检查恢复数据',
  moving: '移动中',
  uploading: '上传中',
  stalledUP: '上传停滞',
  unknown: '未知状态',
}

export default function BtList() {
  const appState = useRef(AppState.currentState)
  const url = commonStore((state) => state.loggedUserInfo?.url)
  const setAppOnStage = homeStore((state) => state.setAppOnStage)
  const setLogged = commonStore((state) => state.setLogged)
  const { btList, btTotalInfo, errCount, refetchBtList } = useBtList()

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current === 'active' && nextState !== 'active') {
        console.log('进入后台')
        setAppOnStage(false)
      }

      if (appState.current !== 'active' && nextState === 'active') {
        console.log('回到前台')
        setAppOnStage(true)
      }
      appState.current = nextState
    })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    if (errCount >= 5) {
      console.log('连续5次请求失败, 停止轮询')
      setLogged(false)
    }
  }, [errCount])

  async function handleBtAction(hash: string, action: string, Ext?: string) {
    try {
      const res = await request({
        url: `${url}/api/v2/torrents/${action}`,
        data: `hashes=${hash}${Ext ? Ext : ''}`,
        method: 'POST',
        withOutLog: false,
      })
      refetchBtList()
    } catch (error) {
      console.error('操作失败:', error)
    }
  }

  function actionListBtn(btState: string, hash: string): AlertButton[] {
    const actionButtons: AlertButton[] = [{ text: '取消', style: 'cancel' }]

    if (btState === 'downloading') {
      actionButtons.push({
        text: '暂停下载',
        onPress: () => handleBtAction(hash, 'pause'),
      })
    } else if (btState === 'pausedDL') {
      actionButtons.push({
        text: '继续下载',
        onPress: () => handleBtAction(hash, 'resume'),
      })
    }
    const otherActions: AlertButton[] = [
      {
        text: '重新检查',
        onPress: () => handleBtAction(hash, 'recheck'),
      },
      {
        text: '重新播报',
        onPress: () => handleBtAction(hash, 'reannounce'),
      },
      {
        text: '删除任务',
        style: 'destructive',
        onPress: () => {
          Alert.alert('确认删除', '删除将同步删除本地文件', [
            { text: '取消', style: 'cancel' },
            {
              text: '删除',
              style: 'destructive',
              onPress: () => handleBtAction(hash, 'delete', '&deleteFiles=true'),
            },
          ])
        },
      },
    ]
    actionButtons.push(...otherActions)
    return actionButtons
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 m-safe justify-center px-4"
      keyboardDismissMode="interactive">
      <View className="mb-4 w-full flex-row items-center justify-around gap-4">
        <View className="flex-row items-center gap-2">
          <Icon as={Link} size={12} />
          <Text className="text-[12px] text-muted-foreground">
            {btTotalInfo?.connection_status
              ? btTotalInfo?.connection_status.toUpperCase()
              : 'UNKNOWN'}{' '}
            [{btList?.length || 0}]
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Icon as={ArrowDownCircle} size={12} />
          <Text className="text-[12px] text-muted-foreground">
            {((btTotalInfo?.dl_info_speed || 0) / 1024 / 1024)?.toFixed(2)} MB/s
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Icon as={ArrowUpCircle} size={12} />
          <Text className="text-[12px] text-muted-foreground">
            {((btTotalInfo?.up_info_speed || 0) / 1024 / 1024)?.toFixed(2)} MB/s
          </Text>
        </View>
      </View>
      {btList && btList.length > 0 && (
        <View className="mb-safe w-full max-w-sm">
          {btList.map((bt) => (
            <Pressable
              key={bt.infohash_v2 || bt.infohash_v1}
              className="bo mb-4 w-full rounded-[28px] bg-muted p-4"
              onPress={() => {
                Alert.alert(
                  '当前种子',
                  `${bt.name}`,
                  actionListBtn(bt.state, bt.infohash_v2 || bt.infohash_v1)
                )
              }}>
              <Text className="text-[12px] text-muted-foreground">
                {`${new Date(bt.added_on * 1000).toLocaleString()} - ${bt.num_seeds} seeds`}
              </Text>
              <Text className="flex-1 flex-row text-[16px]" numberOfLines={1} ellipsizeMode="tail">
                {bt.name}
              </Text>
              <View className="flex-row items-center gap-2">
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[12px] text-muted-foreground">
                      ETA: {bt.dlspeed > 0 ? `${(bt.eta / 60 / 60).toFixed(2)}hrs` : '--'}
                    </Text>
                    <Text className="text-[12px] text-muted-foreground">
                      ACT: {(bt.time_active / 60 / 60).toFixed(2)} hrs
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[12px] text-muted-foreground">
                      T: {(bt.size / 1024 / 1024 / 1024).toFixed(2)} GB
                    </Text>
                    <Progress value={bt.progress * 100} className="w-1/2" />
                  </View>
                  <View className="flex-row items-center">
                    <Badge
                      variant={
                        bt.state === 'downloading'
                          ? 'secondary'
                          : bt.state === 'pausedDL'
                            ? 'default'
                            : 'outline'
                      }
                      className={`mr-1 h-[14px] px-1 py-0 ${bt.state === 'downloading' ? 'bg-green-500/20 text-green-500' : ''}`}>
                      <Text className="text-[10px]">{stateMap[bt.state] || bt.state}</Text>
                    </Badge>
                    <View
                      className="mx-1 flex-row items-center"
                      style={{ display: bt.upspeed > 0 ? 'flex' : 'none' }}>
                      <Icon as={ArrowUp} size={12} />
                      <Text className="text-[12px] text-muted-foreground">
                        {(bt.upspeed / 1024 / 1024).toFixed(2)} MB/s
                      </Text>
                    </View>
                    <View
                      className="mx-1 flex-row items-center"
                      style={{ display: bt.dlspeed > 0 ? 'flex' : 'none' }}>
                      <Icon as={ArrowDown} size={12} />
                      <Text className="text-[12px] text-muted-foreground">
                        {(bt.dlspeed / 1024 / 1024).toFixed(2)} MB/s
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="ml-auto flex-row justify-center gap-4">
                  <Icon as={ArrowRightCircle} size={20} className="text-primary/70" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {!btList || btList.length === 0 ? (
        <View className="w-full items-center justify-center gap-4 pt-60">
          <Icon as={FileScan} size={48} className="text-muted-foreground/70" />
          <Text className="text-sm text-muted-foreground">暂无磁力链接任务</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}
