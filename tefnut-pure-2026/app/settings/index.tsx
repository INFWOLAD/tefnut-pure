import { Pressable, ScrollView, View, Switch, Alert } from 'react-native'
import { Text } from '@/components/ui/text'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/ui/icon'
import {
  LogOut,
  Link,
  User,
  CalendarSync,
  Info,
  Code2,
  ChevronRight,
  Trash2,
  Cookie,
  Link2,
} from 'lucide-react-native'
import { commonStore } from '@/store/commonStore'
import * as SecureStore from 'expo-secure-store'
import * as React from 'react'
import { request } from '@/utils/request'
import * as Application from 'expo-application'
import { Linking } from 'react-native'

export default function SettingsScreen() {
  const loggedUserInfo = commonStore((state) => state.loggedUserInfo)
  const setLoggedUserInfo = commonStore((state) => state.setLoggedUserInfo)
  const logged: boolean = commonStore((state) => state.logged)
  const setLogged = commonStore((state) => state.setLogged)
  const browserUrl = commonStore((state) => state.browserUrl)
  const setBrowserUrl = commonStore((state) => state.setBrowserUrl)
  const [autoLogin, setAutoLogin] = React.useState(false)
  const appVersion = `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`

  React.useEffect(() => {
    async function fetchAutoLogin() {
      const storedAutoLogin = await SecureStore.getItemAsync('bt_auto_login')
      setAutoLogin(storedAutoLogin === 'true')
    }
    fetchAutoLogin()
  }, [])

  async function handleSetBrowserUrl() {
    const storedBrowserUrl = await SecureStore.getItemAsync('browser_url')
    const defaultValue = browserUrl || storedBrowserUrl || 'https://www.bing.com'

    Alert.prompt(
      '默认网址',
      'e.g., https://www.bing.com',
      async (value) => {
        const nextBrowserUrl = value ? value?.trim() : 'https://www.bing.com'
        await SecureStore.setItemAsync('browser_url', nextBrowserUrl)
        setBrowserUrl(nextBrowserUrl)
      },
      'plain-text',
      defaultValue
    )
  }

  async function handleLogout() {
    try {
      await request({
        url: `${loggedUserInfo?.url}/api/v2/auth/logout`,
        data: ``,
        headers: {
          Referer: 'http://localhost:8080/',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      })
      await SecureStore.setItemAsync('bt_auto_login', 'false')
      setAutoLogin(false)
      setLoggedUserInfo({ username: '', url: '' })
      setLogged(false)
    } catch (error) {
      console.log(error)
    } finally {
    }
  }
  async function handleReset() {
    Alert.alert('确认重置', '重置会清除安全存储中保存的自动登录信息', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await handleLogout()
          await SecureStore.deleteItemAsync('bt_password')
          await SecureStore.deleteItemAsync('bt_url')
          await SecureStore.deleteItemAsync('bt_username')
          await SecureStore.deleteItemAsync('browser_url')
          Alert.alert('重置成功', '部分信息会在重启app后完全清空')
        },
      },
    ])
  }

  async function handleClearCookie() {
    try {
      const { default: NitroCookies } = await import('react-native-nitro-cookies')
      await NitroCookies.clearAll()
      setLogged(false) // 同步关闭登录状态，防止cookie被清空后继续请求导致错误
      Alert.alert('清空成功', '浏览器Cookie已清空')
    } catch (error) {
      console.log(error)
      Alert.alert('清空异常', '当前环境不支持清空Cookie')
    }
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1  justify-center p-4 "
      keyboardDismissMode="interactive">
      <View className="ml-auto mr-4 flex-row items-center gap-1">
        <Text className="mb-4 text-4xl font-bold text-muted-foreground">Tefnut</Text>
        <Separator orientation="vertical" className="bg-ring/40" />
        <Text className="mt-8 text-sm text-muted-foreground/80">Pure</Text>
      </View>
      <Text className="mb-2 ml-5 font-bold text-muted-foreground">账户</Text>
      <View className="mb-4 w-full rounded-[32px] bg-border px-5">
        <View className="flex-row items-center gap-3 py-3">
          <Icon as={Link} size={20} />
          <Text className="text-lg">登录IP</Text>
          <Text className="ml-auto text-muted-foreground">{loggedUserInfo?.url || '未知'}</Text>
        </View>
        <Separator className="ml-8 w-auto bg-ring/40" />
        <View className="flex-row items-center gap-3 py-3">
          <Icon as={User} size={20} />
          <Text className="text-lg">登录账户</Text>
          <Text className="ml-auto text-muted-foreground">
            {loggedUserInfo?.username || '未知'}
          </Text>
        </View>
        <Separator className="ml-8 w-auto bg-ring/40" />
        <View className="flex-row items-center gap-3 py-3">
          <Icon as={CalendarSync} size={20} />
          <Text className="text-lg">自动登录</Text>
          <Switch
            className="ml-auto"
            value={autoLogin}
            onValueChange={async (checked) => {
              await SecureStore.setItemAsync('bt_auto_login', checked.toString())
              setAutoLogin(checked)
            }}
          />
        </View>
        {logged && (
          <>
            <Separator className="ml-8 w-auto bg-ring/40" />
            <Pressable
              className="flex-row items-center gap-3 py-3"
              onPress={() => {
                Alert.alert('确认退出', '退出登录会同步关闭自动登录,重新登录后可再次开启', [
                  { text: '取消', style: 'cancel' },
                  {
                    text: '确定',
                    style: 'destructive',
                    onPress: handleLogout,
                  },
                ])
              }}>
              <Icon as={LogOut} size={20} />
              <Text className="text-lg">退出登录</Text>
              <Icon as={ChevronRight} size={24} className="ml-auto text-muted-foreground" />
            </Pressable>
          </>
        )}
      </View>
      <Text className="mb-2 ml-5 font-bold text-muted-foreground">浏览器</Text>
      <View className="mb-4 w-full rounded-[32px] bg-border px-5">
        <Pressable className="flex-row items-center gap-3 py-3" onPress={handleSetBrowserUrl}>
          <Icon as={Link2} size={20} />
          <Text className="text-lg">设置默认网址</Text>
          <Icon as={ChevronRight} size={24} className="ml-auto text-muted-foreground" />
        </Pressable>
        <Separator className="ml-8 w-auto bg-ring/40" />
        <Pressable
          className="flex-row items-center gap-3 py-3"
          onPress={() => {
            Alert.alert('清空Cookie', '清空浏览器Cookie后会同步清空QBittorent登录Cookie', [
              { text: '取消', style: 'cancel' },
              {
                text: '确定',
                style: 'destructive',
                onPress: handleClearCookie,
              },
            ])
          }}>
          <Icon as={Cookie} size={20} />
          <Text className="text-lg">清空Cookie</Text>
          <Icon as={ChevronRight} size={24} className="ml-auto text-muted-foreground" />
        </Pressable>
      </View>
      <Text className="my-2 ml-5 font-bold text-muted-foreground">系统</Text>
      <View className="mb-4 w-full rounded-[32px] bg-border px-5">
        <View className="flex-row items-center gap-3 py-3">
          <Icon as={Info} size={20} />
          <Text className="text-lg">版本信息</Text>
          <Text className="ml-auto text-muted-foreground">{appVersion}</Text>
        </View>
        <Separator className="ml-8 w-auto bg-ring/40" />
        <Pressable
          className="flex-row items-center gap-3 py-3"
          onPress={() => Linking.openURL('https://github.com/INFWOLAD/tefnut-pure')}>
          <Icon as={Code2} size={20} />
          <Text className="text-lg">查看源码</Text>
          <Icon as={ChevronRight} size={24} className="ml-auto text-muted-foreground" />
        </Pressable>
        <Separator className="ml-8 w-auto bg-ring/40" />
        <Pressable className="flex-row items-center gap-3 py-3" onPress={handleReset}>
          <Icon as={Trash2} size={20} />
          <Text className="text-lg">重置设置</Text>
          <Icon as={ChevronRight} size={24} className="ml-auto text-muted-foreground" />
        </Pressable>
      </View>
    </ScrollView>
  )
}
