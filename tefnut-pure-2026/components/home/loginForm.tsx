import { SignInForm } from '@/components/login-form'
import { ScrollView, View } from 'react-native'

export default function SignInScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center px-4 "
      keyboardDismissMode="interactive">
      <View className="m-safe w-full">
        <SignInForm />
      </View>
    </ScrollView>
  )
}
