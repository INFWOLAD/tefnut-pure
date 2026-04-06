import { AppState, View, ScrollView } from 'react-native'
import { use, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useBtList } from '@/hooks/useBtList'
import { homeStore } from '@/store/homeStore'
import { commonStore } from '@/store/commonStore'

export default function BtList() {
  const appState = useRef(AppState.currentState)
  const setAppOnStage = homeStore((state) => state.setAppOnStage)
  const setLogged = commonStore((state) => state.setLogged)
  const { btList, success, errCount } = useBtList()

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

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1  justify-center p-4 "
      keyboardDismissMode="interactive">
      <View className="m-safe w-full max-w-sm">
        {btList.map((bt) => (
          <View key={bt.hash} className="mb-4 w-full rounded-[32px] bg-border px-5">
            <View className="flex-row items-center justify-between px-4 py-2">
              <Text className="flex-1" numberOfLines={1} ellipsizeMode="tail">
                {bt.name}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
