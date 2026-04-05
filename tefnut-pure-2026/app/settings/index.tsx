import { Pressable, ScrollView, View, Switch, Alert } from 'react-native'
import { Text } from '@/components/ui/text'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/ui/icon'
import { LogOut, Link, User, CalendarSync } from 'lucide-react-native'
import { commonStore } from '@/store/commonStore'
import * as SecureStore from 'expo-secure-store'
import * as React from 'react'
import { request } from '@/utils/request'

export default function SettingsScreen() {
  const loggedUserInfo = commonStore((state) => state.loggedUserInfo)
  const setLoggedUserInfo = commonStore((state) => state.setLoggedUserInfo)
  const setLogged = commonStore((state) => state.setLogged)
  const [autoLogin, setAutoLogin] = React.useState(false)

  React.useEffect(() => {
    async function fetchAutoLogin() {
      const storedAutoLogin = await SecureStore.getItemAsync('bt_auto_login')
      setAutoLogin(storedAutoLogin === 'true')
    }
    fetchAutoLogin()
  }, [])

  async function handleLogout() {
    Alert.alert('确认退出', '退出登录会同步关闭自动登录,重新登录后可再次开启', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
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
        },
      },
    ])
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1  justify-center p-4 "
      keyboardDismissMode="interactive">
      <Text className="mb-2 ml-5 font-bold text-muted-foreground">账户</Text>
      <View className="w-full rounded-[32px] bg-border px-5">
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
        <Separator className="ml-8 w-auto bg-ring/40" />
        <Pressable className="flex-row items-center gap-3 py-3" onPress={handleLogout}>
          <Icon as={LogOut} size={20} />
          <Text className="text-lg">退出登录</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
