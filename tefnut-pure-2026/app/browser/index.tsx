import { WebView } from 'react-native-webview'
import type { WebView as WebViewType } from 'react-native-webview'
import { use, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import type { SearchBarCommands } from 'react-native-screens'
import { Stack } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { request } from '@/utils/request'
import { commonStore } from '@/store/commonStore'
import * as Notifications from 'expo-notifications'
import { Skeleton } from '@/components/ui/skeleton'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false, // 不在通知中心显示
  }),
})

export default function BrowserSheet() {
  const searchBarRef = useRef<SearchBarCommands | null>(null)
  const webviewRef = useRef<WebViewType>(null)
  const [loading, setLoading] = useState(false)
  const [firstReady, setFirstReady] = useState(false)
  const [browserUrl, setBrowserUrl] = useState('')
  const browserUrlInStore = commonStore((state) => state.browserUrl)
  const setBrowserUrlInStore = commonStore((state) => state.setBrowserUrl)
  const [addedUrls, setAddedUrls] = useState<string[]>([])
  const loggedUserInfo = commonStore((state) => state.loggedUserInfo)

  useEffect(() => {
    async function getDefaultUrl() {
      const storedUrl = await SecureStore.getItemAsync('browser_url')
      setBrowserUrlInStore(storedUrl || 'https://www.bing.com')
      if (!storedUrl) {
        await SecureStore.setItemAsync('browser_url', 'https://www.bing.com')
        searchBarRef.current?.setText('https://www.bing.com')
        setBrowserUrl('https://www.bing.com')
      } else {
        searchBarRef.current?.setText(storedUrl)
        setBrowserUrl(storedUrl)
      }
    }
    getDefaultUrl()
  }, [])

  useEffect(() => {
    if (browserUrlInStore && browserUrlInStore !== browserUrl) {
      setBrowserUrl(browserUrlInStore)
      searchBarRef.current?.setText(browserUrlInStore)
      webviewRef.current?.reload()
    }
  }, [browserUrlInStore])

  // 将url存入zustand
  async function handleMagnet(url: string) {
    // 防止重复添加相同的磁力链接
    if (addedUrls.includes(url)) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: '重复任务',
          body: '任务已存在，无需重复添加',
        },
        trigger: null,
      })
      return
    }
    setAddedUrls((prev) => [...prev, url])
    const res = await addTask(url)
    if (res.success) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: '添加成功',
          body: '任务可在首页查看进度',
        },
        trigger: null,
      })
    } else {
      Notifications.scheduleNotificationAsync({
        content: {
          title: '添加失败',
          body: res.msg || '磁力链接添加失败',
        },
        trigger: null,
      })
    }
  }

  // 添加磁力
  async function addTask(magnet: string) {
    // 处理提交逻辑
    const formData = new FormData()
    formData.append('urls', magnet)
    console.log('Submitting magnet link:', magnet, formData)
    if (!loggedUserInfo?.url || !loggedUserInfo?.username) {
      console.error('缺少登录信息，无法提交磁力链接')
      return { success: false, msg: '缺少登录信息，无法提交磁力链接' }
    }
    if (!magnet) {
      console.error('磁力链接不能为空')
      return { success: false, msg: '磁力链接不能为空' }
    }
    // 从zustand中取login的url
    const response = await request({
      url: `${loggedUserInfo?.url}/api/v2/torrents/add`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data;',
      },
      data: formData,
    })
    console.log('Add torrent response:', response)
    if (response && response.includes('Ok.')) {
      console.log('磁力链接添加成功')
      return { success: true }
    } else {
      console.error('磁力链接添加失败')
      return { success: false, msg: '磁力链接添加失败' }
    }
  }

  return (
    <>
      <Stack.SearchBar
        ref={searchBarRef}
        onSearchButtonPress={(event) => {
          setBrowserUrl(event.nativeEvent.text)
          console.log('SearchBar search:', event.nativeEvent.text)
        }}
        onCancelButtonPress={() => {
          searchBarRef.current?.setText(browserUrl)
          webviewRef.current?.reload()
        }}
      />
      <View className="mt-safe h-full w-full">
        {/* 加载条 */}
        <View
          style={{ display: loading && firstReady ? 'flex' : 'none' }}
          className="h-1 w-full animate-pulse bg-blue-400"
        />
        <WebView
          ref={webviewRef}
          source={{ uri: browserUrl }}
          pullToRefreshEnabled={true}
          onLoadStart={() => {
            setLoading(true)
            console.log('WebView load start')
          }}
          onLoadEnd={(syntheticEvent) => {
            setLoading(false)
            setFirstReady(true)
            // update component to be aware of loading status
            const { nativeEvent } = syntheticEvent
            setBrowserUrl(nativeEvent.url)
            searchBarRef.current?.setText(nativeEvent.url)
            console.log('WebView load end')
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="h-full w-full items-center justify-center">
              <View className="gap-2">
                <Skeleton className="h-20 w-[300px]" />
                <Skeleton className="h-8 w-[280px]" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[230px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[200px]" />
              </View>
            </View>
          )}
          // 仅在磁力模式下推送磁力任务
          onMessage={(event) => {
            const href = event.nativeEvent.data
            console.log('捕获到磁力链接：', href)
            handleMagnet(href)
          }}
          // 只有ios支持左右滑动手势
          allowsBackForwardNavigationGestures={true}
          injectedJavaScript={`
          document.addEventListener('click', function(e) {
            const a = e.target.closest('a');
            if (a && a.href.startsWith('magnet:')) {
              e.preventDefault(); // 阻止 WebView 自己加载
              window.ReactNativeWebView.postMessage(a.href);
            }
          });
          document.addEventListener('copy', function (e) {
            const selection = window.getSelection()?.toString();
            if (selection && selection.startsWith('magnet:')) {
              window.ReactNativeWebView.postMessage(selection);
            }
          });
        `}
        />
      </View>
    </>
  )
}
