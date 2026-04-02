import { FirstSignInForm } from '@/components/first-sign-form';
import { ScrollView, View } from 'react-native';
import { logInfoStore } from '@/store/logInfo';

export default function SignInScreen() {
  const logged: Boolean = logInfoStore((state) => state.logged);
  const setLogged = logInfoStore((state) => state.setLogged);

  function handleSignIn() {
    setLogged(true);
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <FirstSignInForm onSubmit={handleSignIn} />
      </View>
    </ScrollView>
  );
}
