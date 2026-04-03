import { Stack } from 'expo-router'

export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: false,
        headerLargeTitleShadowVisible: false,
        headerBlurEffect: undefined,
        headerStyle: {
          backgroundColor: 'transparent',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: '',
          headerTitle: () => undefined,
        }}
      />
    </Stack>
  )
}
