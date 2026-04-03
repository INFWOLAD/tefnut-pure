import { SignInForm } from '@/components/login-form'
import { ScrollView, View } from 'react-native'

export default function SignInScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 "
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <SignInForm />
      </View>
    </ScrollView>
  )
}
