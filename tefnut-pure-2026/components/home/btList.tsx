import { AppState, View } from 'react-native'
import { use, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useBtList } from '@/hooks/useBtList'
import { homeStore } from '@/store/homeStore'
import { commonStore } from '@/store/commonStore'

export default function BtList() {
  const appState = useRef(AppState.currentState)
  const loopEnabled = homeStore((state) => state.loopEnabled)
  const setLoopEnabled = homeStore((state) => state.setLoopEnabled)
  const setLogged = commonStore((state) => state.setLogged)
  const { btList, success, errCount } = useBtList()

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current === 'active' && nextState !== 'active') {
        console.log('进入后台')
        setLoopEnabled(false)
      }

      if (appState.current !== 'active' && nextState === 'active') {
        console.log('回到前台')
        setLoopEnabled(true)
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

  return (
    <>
      <View className="m-safe flex-1 items-center">
        {success ? (
          btList.map((bt) => (
            <View key={bt.hash} className="mb-4 w-full rounded bg-muted">
              <View className="flex-row items-center justify-between px-4 py-2">
                <Text>{bt.name}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text>正在获取数据...{loopEnabled ? '开启' : '关闭'}</Text>
        )}
      </View>
    </>
  )
}
