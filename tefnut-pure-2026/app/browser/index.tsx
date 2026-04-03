import { WebView } from 'react-native-webview'
import type { WebView as WebViewType } from 'react-native-webview'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import type { SearchBarCommands } from 'react-native-screens'
import { Stack } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

export function callbackResult(result: boolean | undefined) {
  console.log('Callback result:', result)
}

export default function BrowserSheet() {
  const searchBarRef = useRef<SearchBarCommands | null>(null)
  const [searchTextNull, setSearchTextNull] = useState(false)
  const webviewRef = useRef<WebViewType>(null)
  const [browserUrl, setBrowserUrl] = useState('')
  const [addedUrls, setAddedUrls] = useState<string[]>([])

  useEffect(() => {
    async function getDefaultUrl() {
      const storedUrl = await SecureStore.getItemAsync('browser_url')
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

  // 将url存入zustand
  function handleMagnet(url: string) {
    // 防止重复添加相同的磁力链接
    if (addedUrls.includes(url)) {
      return
    }
    setAddedUrls((prev) => [...prev, url])
    //TODO: 此处实际下载
  }

  return (
    <>
      <Stack.SearchBar
        ref={searchBarRef}
        onChangeText={(event) => {
          setSearchTextNull(event.nativeEvent.text.trim() === '')
        }}
        onSearchButtonPress={(event) => {
          setBrowserUrl(event.nativeEvent.text)
        }}
        onBlur={(event) => {
          if (searchTextNull) {
            searchBarRef.current?.setText(browserUrl)
          }
          console.log('SearchBar blur:')
        }}
        onCancelButtonPress={() => {
          searchBarRef.current?.setText(browserUrl)
        }}
      />
      <View className="mt-safe h-full w-full">
        <WebView
          ref={webviewRef}
          className="mt-safe"
          source={{ uri: browserUrl }}
          onNavigationStateChange={(navState) => {
            searchBarRef.current?.setText(navState.url)
            setBrowserUrl(navState.url) // 同步回浏览器实际访问地址
          }}
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
