import { useColorScheme } from 'nativewind'
import * as React from 'react'
import { logInfoStore } from '@/store/logInfo'
import SignInScreen from '@/components/home/loginForm'

export default function Screen() {
  const logged: boolean = logInfoStore((state) => state.logged)
  return <>{!logged && <SignInScreen />}</>
}
