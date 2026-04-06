import * as React from 'react'
import { commonStore } from '@/store/commonStore'
import SignInScreen from '@/components/home/loginForm'
import BtList from '@/components/home/btList'

export default function Screen() {
  const logged: boolean = commonStore((state) => state.logged)
  return (
    <>
      {!logged && <SignInScreen />}
      {logged && <BtList />}
    </>
  )
}
