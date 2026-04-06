import { NativeTabs } from 'expo-router/unstable-native-tabs'
import React from 'react'
import { useColorScheme } from 'react-native'
import { THEME } from '@/lib/theme'
import { homeStore } from '@/store/homeStore'

export default function AppTabs() {
  const scheme = useColorScheme()
  const colors = THEME[scheme === 'dark' ? 'dark' : 'light']
  const setHomeOnTab = homeStore((state) => state.setHomeOnTab)
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.primary}
      labelStyle={{ selected: { color: colors.foreground } }}>
      <NativeTabs.Trigger
        name="home"
        listeners={{
          focus: () => {
            console.log('Home tab focused')
            setHomeOnTab(true)
          },
          blur: () => {
            console.log('Home tab blurred')
            setHomeOnTab(false)
          },
        }}>
        <NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="browser" role="search">
        <NativeTabs.Trigger.Label>浏览器</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'safari', selected: 'safari.fill' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'environments', selected: 'environments.fill' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
