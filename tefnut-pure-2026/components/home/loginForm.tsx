import { FirstSignInForm } from '@/components/first-sign-form'
import { ScrollView, View } from 'react-native'
import { logInfoStore } from '@/store/logInfo'
import { request } from '@/utils/request'

export default function SignInScreen() {
  const logged: boolean = logInfoStore((state) => state.logged)
  const setLogged = logInfoStore((state) => state.setLogged)

  async function handleSignIn() {
    setLogged(true)
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <FirstSignInForm />
      </View>
    </ScrollView>
  )
}
