import { NativeTabs } from 'expo-router/unstable-native-tabs'
import React from 'react'
import { useColorScheme } from 'react-native'

import { THEME } from '@/lib/theme'

export default function AppTabs() {
  const scheme = useColorScheme()
  const colors = THEME[scheme === 'dark' ? 'dark' : 'light']
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.primary}
      labelStyle={{ selected: { color: colors.foreground } }}>
      <NativeTabs.Trigger name="home/index">
        <NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" renderingMode="template" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="browser/index">
        <NativeTabs.Trigger.Label>浏览器</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gear" renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gear" renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
