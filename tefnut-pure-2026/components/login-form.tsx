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
import { commonStore } from '@/store/commonStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-react-native'
import { Skeleton } from '@/components/ui/skeleton'

export function SignInForm() {
  const [noLoginInfo, setNologinInfo] = React.useState(false)

  const [passwordValue, setPasswordValue] = React.useState('')
  const [userNameValue, setUserNameValue] = React.useState('')
  const [ipValue, setIpValue] = React.useState('')

  const [loading, setLoading] = React.useState(false)

  const [timeoutCount, setTimeoutCount] = React.useState(5)

  const [errorMsg, setErrorMsg] = React.useState('')

  const setLogged = commonStore((state) => state.setLogged)
  const setLoggedUserInfo = commonStore((state) => state.setLoggedUserInfo)

  React.useEffect(() => {
    async function checkLocalLogin() {
      const storedUsername = await SecureStore.getItemAsync('bt_username')
      const storedPassword = await SecureStore.getItemAsync('bt_password')
      const storedUrl = await SecureStore.getItemAsync('bt_url')
      const storedAutoLogin = await SecureStore.getItemAsync('bt_auto_login')
      console.log('本地存储的登录信息', {
        storedUsername,
        storedPassword,
        storedUrl,
        storedAutoLogin,
      })

      if (storedUsername && storedPassword && storedUrl) {
        setIpValue(storedUrl)
        setUserNameValue(storedUsername)
        setPasswordValue(storedPassword)
        storedAutoLogin === 'true'
          ? submitAcutal(storedUrl, storedUsername, storedPassword)
          : setNologinInfo(true)
      } else {
        setNologinInfo(true)
      }
    }
    checkLocalLogin()
  }, [])

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
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
    const result = await submitAcutal(ipValue, userNameValue, passwordValue)
    if (!result.status) {
      setErrorMsg(result.msg)
    }
    clearInterval(loadingTime)
    setLoading(false)
  }

  async function submitAcutal(ip: string, username: string, password: string) {
    try {
      await request({
        url: `${ip}/api/v2/auth/login`,
        data: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        headers: {
          Referer: 'http://localhost:8080/',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        specialErr: { keywords: 'Fails.', msg: '请重新输入登录信息' },
      })
      // 无报错存入信息
      await SecureStore.setItemAsync('bt_username', username)
      await SecureStore.setItemAsync('bt_password', password)
      await SecureStore.setItemAsync('bt_url', ip)
      setLoggedUserInfo({ username, url: ip })
      await delay(1000)
      setLogged(true)
      return { status: true, msg: '' }
    } catch (error) {
      console.log(error)
      setErrorMsg('自动登录失败，请检查登录信息后手动登录')
      setNologinInfo(true)
      return { status: false, msg: String(error) }
    } finally {
    }
  }

  return (
    <>
      <View className="px-4" style={{ height: 100 }}>
        <Alert
          variant="destructive"
          style={{ display: errorMsg ? 'flex' : 'none' }}
          icon={AlertCircleIcon}>
          <AlertTitle>登录失败</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      </View>
      <View className="gap-6">
        <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
          <CardHeader>
            <CardTitle className="text-left text-xl">登录QBittorrent</CardTitle>
            <CardDescription className="text-left">
              tefnut依托于本地QBittorent部署，使用前请先确保存在QBittorent相关环境
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <View className="gap-6" style={{ display: noLoginInfo ? 'flex' : 'none' }}>
              <View className="gap-1.5">
                <Label htmlFor="IP">IP</Label>
                <Input
                  id="ip"
                  placeholder="http://xxx.xxx.xxx.xxx:xxxx"
                  onChangeText={(text) => {
                    setErrorMsg('')
                    setIpValue(text)
                  }}
                  value={ipValue}
                  keyboardType="url"
                  autoComplete="url"
                  autoCapitalize="none"
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
                  id="userName"
                  placeholder="user"
                  onChangeText={(text) => {
                    setErrorMsg('')
                    setUserNameValue(text)
                  }}
                  value={userNameValue}
                  keyboardType="default"
                  autoComplete="name"
                  autoCapitalize="none"
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
                  id="password"
                  secureTextEntry
                  onChangeText={(text) => {
                    setErrorMsg('')
                    setPasswordValue(text)
                  }}
                  value={passwordValue}
                  returnKeyType="send"
                  onSubmitEditing={onSubmit}
                  editable={!loading}
                />
              </View>
              <Button disabled={loading} className="w-full" onPress={onSubmit}>
                <View
                  className="pointer-events-none animate-spin"
                  style={{ display: loading ? 'flex' : 'none' }}>
                  <Icon as={Loader2} className="text-primary-foreground" />
                </View>
                <Text>{loading ? `登录中...(${timeoutCount}s)` : '登录'}</Text>
              </Button>
            </View>
            <View style={{ display: noLoginInfo ? 'none' : 'flex' }} className="gap-1.5">
              <View className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <View className="gap-2">
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-4 w-[220px]" />
                </View>
              </View>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Text className="mt-8 text-sm text-muted-foreground">已检测到本地登录信息</Text>
              <Text className="mb-8 text-sm text-muted-foreground">
                正在使用本地信息登录，请稍候...
              </Text>
            </View>
            <View className="flex-row items-center">
              <Separator className="flex-1" />
              <Text className="px-4 text-sm text-muted-foreground">tefnut</Text>
              <Separator className="flex-1" />
            </View>
          </CardContent>
        </Card>
      </View>
    </>
  )
}
