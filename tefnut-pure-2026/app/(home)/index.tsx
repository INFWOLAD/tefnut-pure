import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { logInfoStore } from '@/store/logInfo';
import SignInScreen from './firstLogin';

export default function Screen() {
  const logged: Boolean = logInfoStore((state) => state.logged);
  return <>{!logged && <SignInScreen />}</>;
}
