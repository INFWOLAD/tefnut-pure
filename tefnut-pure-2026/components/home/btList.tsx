import { AppState, View, ScrollView, Pressable, Alert } from 'react-native'
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
  ArrowUp,
  Link,
  Pause,
  Play,
  SaveAll,
  Trash2,
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
  const { btList, btTotalInfo, success, errCount, refetchBtList } = useBtList()

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
      console.log('连续5次请求失败，停止轮询')
      setLogged(false)
    }
  }, [errCount])

  async function pauseBt(hash: string) {
    try {
      const res = await request({
        url: `${url}/api/v2/torrents/pause`,
        data: `hashes=${hash}`,
        method: 'POST',
        withOutLog: false,
      })
      console.log('暂停/继续任务响应:', res)
      refetchBtList()
    } catch (error) {
      console.error('暂停任务失败:', error)
    }
  }
  async function resumeBt(hash: string) {
    try {
      const res = await request({
        url: `${url}/api/v2/torrents/resume`,
        data: `hashes=${hash}`,
        method: 'POST',
        withOutLog: false,
      })
      console.log('暂停/继续任务响应:', res)
      refetchBtList()
    } catch (error) {
      console.error('继续任务失败:', error)
    }
  }
  async function deleteBt(hash: string) {
    try {
      const res = await request({
        url: `${url}/api/v2/torrents/delete`,
        data: `hashes=${hash}&deleteFiles=true`,
        method: 'POST',
        withOutLog: false,
      })
      console.log('删除任务响应:', res)
      refetchBtList()
    } catch (error) {
      console.error('删除任务失败:', error)
    }
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 m-safe justify-center px-4 "
      keyboardDismissMode="interactive">
      <View className="mb-4 w-full flex-row items-center justify-center gap-4">
        <View className="flex-row items-center gap-2">
          <Icon as={Link} size={16} />
          <Text className="text-[12px] text-muted-foreground">
            {btTotalInfo?.connection_status}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Icon as={SaveAll} size={16} />
          <Text className="text-[12px] text-muted-foreground">{btList?.length || 0}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Icon as={ArrowDownCircle} size={12} />
          <Text className="text-[12px] text-muted-foreground">
            {((btTotalInfo?.dl_info_speed || 0) / 1024 / 1024)?.toFixed(2)} MB/s
          </Text>
        </View>
      </View>
      {btList && btList.length > 0 && (
        <View className="w-full max-w-sm">
          {btList.map((bt) => (
            <View
              key={bt.infohash_v2 || bt.infohash_v1}
              className="bo mb-4 w-full rounded-[28px] bg-muted p-4">
              <Text className="text-[12px] text-muted-foreground">
                {new Date(bt.added_on * 1000).toLocaleString()}
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
                      className="mr-1 h-[14px] px-1 py-0">
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
                <View className="ml-auto mr-2 flex-row justify-center gap-2">
                  {bt.state === 'downloading' && (
                    <Pressable
                      className="h-[30px] w-[30px] items-center justify-center rounded-lg border border-primary/50"
                      onPress={() => pauseBt(bt.infohash_v2 || bt.infohash_v1)}>
                      <Icon as={Pause} className="text-primary/70" size={20} />
                    </Pressable>
                  )}
                  {bt.state === 'pausedDL' && (
                    <Pressable
                      className="h-[30px] w-[30px] items-center justify-center rounded-lg border border-primary/50"
                      onPress={() => resumeBt(bt.infohash_v2 || bt.infohash_v1)}>
                      <Icon as={Play} className="text-primary/70" size={20} />
                    </Pressable>
                  )}
                  <Pressable
                    className="h-[30px] w-[30px] items-center justify-center rounded-lg border border-destructive/50"
                    onPress={() => {
                      Alert.alert('确认删除', '删除将同步删除本地文件', [
                        { text: '取消', style: 'cancel' },
                        {
                          text: '删除',
                          style: 'destructive',
                          onPress: () => deleteBt(bt.infohash_v2 || bt.infohash_v1),
                        },
                      ])
                    }}>
                    <Icon as={Trash2} className="text-destructive/70" size={20} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      {!btList || btList.length === 0 ? (
        <View className="m-safe w-full max-w-sm items-center justify-center gap-4 rounded-[28px] p-4">
          <Text className="text-sm text-muted-foreground">暂无磁力链接任务</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}
