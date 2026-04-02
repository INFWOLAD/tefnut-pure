// 首次登录
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Loader2 } from 'lucide-react-native'
import * as React from 'react'
import { type TextInput, View } from 'react-native'
import { request } from '@/utils/request'
import * as SecureStore from 'expo-secure-store'
import { logInfoStore } from '@/store/logInfo'

export function FirstSignInForm() {
  const passwordInputRef = React.useRef<TextInput>(null)
  const userNameInputRef = React.useRef<TextInput>(null)
  const ipInputRef = React.useRef<TextInput>(null)
  const [passwordValue, setPasswordValue] = React.useState('')
  const [userNameValue, setUserNameValue] = React.useState('')
  const [ipValue, setIpValue] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [timeoutCount, setTimeoutCount] = React.useState(5)
  const setLogged = logInfoStore((state) => state.setLogged)

  React.useEffect(() => {
    async function checkLocalLogin() {
      const storedUsername = await SecureStore.getItemAsync('bt_username')
      const storedPassword = await SecureStore.getItemAsync('bt_password')
      const storedUrl = await SecureStore.getItemAsync('bt_url')
      console.log('本地存储的登录信息', { storedUsername, storedPassword, storedUrl })

      if (storedUsername && storedPassword && storedUrl) {
        setIpValue(storedUrl)
        setUserNameValue(storedUsername)
        setPasswordValue(storedPassword)
      }
    }
    checkLocalLogin()
  }, [])

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  function onUserNameSubmitEditing() {
    passwordInputRef.current?.focus()
  }
  function onIpSubmitEditing() {
    userNameInputRef.current?.focus()
  }

  async function onSubmit() {
    setLoading(true)
    const loadingTime = setInterval(() => {
      setTimeoutCount((count) => {
        if (count <= 1) {
          setLoading(false)
          clearInterval(loadingTime)
          return 5
        }
        return count - 1
      })
    }, 1000)
    try {
      await request({
        url: `${ipValue}/api/v2/auth/login`,
        data: `username=${encodeURIComponent(userNameValue)}&password=${encodeURIComponent(passwordValue)}`,
        headers: {
          Referer: 'http://localhost:8080/',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        specialErr: { keywords: 'Fails.', msg: '请重新输入登录信息' },
      })
      // 无报错存入信息
      await SecureStore.setItemAsync('bt_username', userNameValue)
      await SecureStore.setItemAsync('bt_password', passwordValue)
      await SecureStore.setItemAsync('bt_url', ipValue)
      await delay(1000)
      setLogged(true)
    } catch (error) {
      console.log(error)
    } finally {
      // loading状态更新，外部实时获取
      clearInterval(loadingTime)
      setLoading(false)
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-left text-xl">登录QBittorrent</CardTitle>
          <CardDescription className="text-left">
            首次使用tefnut需先于QBittorent建立连接
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="IP">IP</Label>
              <Input
                ref={ipInputRef}
                id="ip"
                placeholder="http://xxx.xxx.xxx.xxx:xxxx"
                onChangeText={(text) => {
                  setIpValue(text)
                }}
                value={ipValue}
                keyboardType="url"
                autoComplete="url"
                autoCapitalize="none"
                onSubmitEditing={onIpSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
                autoCorrect={false}
                spellCheck={false}
                editable={!loading}
              />
            </View>
            <View className="gap-1.5">
              <Label htmlFor="IP">UserName</Label>
              <Input
                ref={userNameInputRef}
                id="userName"
                placeholder="user"
                onChangeText={(text) => {
                  setUserNameValue(text)
                }}
                value={userNameValue}
                keyboardType="default"
                autoComplete="name"
                autoCapitalize="none"
                onSubmitEditing={onUserNameSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
                autoCorrect={false}
                spellCheck={false}
                editable={!loading}
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                onChangeText={(text) => {
                  setPasswordValue(text)
                }}
                value={passwordValue}
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                editable={!loading}
              />
            </View>
            {loading ? (
              <Button disabled>
                <View className="pointer-events-none animate-spin">
                  <Icon as={Loader2} className="text-primary-foreground" />
                </View>
                <Text>登录中...({timeoutCount}s)</Text>
              </Button>
            ) : (
              <Button className="w-full" onPress={onSubmit}>
                <Text>登录</Text>
              </Button>
            )}
          </View>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">tefnut</Text>
            <Separator className="flex-1" />
          </View>
        </CardContent>
      </Card>
    </View>
  )
}
