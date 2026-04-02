import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Link, Stack } from 'expo-router'
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native'
import { useColorScheme } from 'nativewind'
import * as React from 'react'
import { Image, type ImageStyle, View, ScrollView } from 'react-native'
import { FirstSignInForm } from '@/components/first-sign-form'

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
}

const SCREEN_OPTIONS = {
  title: 'React Native Reusables',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
}

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
}

export default function Screen() {
  const { colorScheme } = useColorScheme()

  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
        keyboardDismissMode="interactive"></ScrollView>
    </>
  )
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
}

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme()

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  )
}
