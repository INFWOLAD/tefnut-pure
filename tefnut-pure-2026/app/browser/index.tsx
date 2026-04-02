import { WebView } from 'react-native-webview'
import type { WebView as WebViewType } from 'react-native-webview'
import { useEffect, useRef, useState } from 'react'

interface BrowserSheetProps {
  catchMagnet: boolean // 抓取磁力推送到btStore
  defaultUrl: string // 浏览器默认打开地址
}

export function callbackResult(result: boolean | undefined) {
  console.log('Callback result:', result)
}

export default function BrowserSheet({
  catchMagnet = false,
  defaultUrl = 'https://www.bing.com',
}: BrowserSheetProps) {
  const webviewRef = useRef<WebViewType>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [url, setUrl] = useState(defaultUrl)
  const [browserUrl, setBrowserUrl] = useState(defaultUrl)
  const [addedUrls, setAddedUrls] = useState<string[]>([])

  // input框回车后，浏览器url被更新，将浏览器url和输入框url解耦
  function handleUrl() {
    setBrowserUrl(url)
  }

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
    <WebView
      ref={webviewRef}
      style={{ height: 900 }}
      source={{ uri: browserUrl }}
      onNavigationStateChange={(navState) => {
        setCanGoBack(navState.canGoBack)
        setBrowserUrl(navState.url) // 同步回浏览器实际访问地址
        setUrl(navState.url) // 同步回input展示地址
      }}
      // 仅在磁力模式下推送磁力任务
      onMessage={(event) => {
        const href = event.nativeEvent.data
        console.log('捕获到磁力链接：', href)
        catchMagnet && handleMagnet(href)
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
  )
}
