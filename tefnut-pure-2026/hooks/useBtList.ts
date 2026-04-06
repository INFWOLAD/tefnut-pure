import { request } from '@/utils/request'
import { commonStore } from '@/store/commonStore'
import { homeStore } from '@/store/homeStore'
import { useState, useEffect, useRef } from 'react'
export function useBtList() {
  const url = commonStore((state) => state.loggedUserInfo?.url)
  const homeOnTab = homeStore((state) => state.homeOnTab)
  const appOnStage = homeStore((state) => state.appOnStage)
  const [btList, setBtList] = useState<any[]>([])
  const [success, setSuccess] = useState(false)
  const [errCount, setErrCount] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef(false)
  const mountedRef = useRef(true)
  const loopEnabledRef = useRef(homeOnTab && appOnStage)

  function clearNextFetch() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    loopEnabledRef.current = homeOnTab && appOnStage
  }, [homeOnTab, appOnStage])

  useEffect(() => {
    if (!homeOnTab || !appOnStage || !url) {
      clearNextFetch()
      setBtList([])
      setSuccess(false)
      return
    }

    async function fetch() {
      if (!mountedRef.current || !loopEnabledRef.current || inFlightRef.current) return

      // 只允许一个请求在路上，防止并发重入
      inFlightRef.current = true
      try {
        const response = await request({
          url: `${url}/api/v2/torrents/info`,
          method: 'POST',
          withOutLog: true,
        })
        if (!mountedRef.current) return
        setBtList(Array.isArray(response) ? response : [])
        setSuccess(true)
        setErrCount(0)
        console.log('Fetched torrents, time:', new Date().toLocaleTimeString())
      } catch (error) {
        if (!mountedRef.current) return
        console.log('Error fetching torrents:', error)
        setBtList([])
        setSuccess(false)
        setErrCount((prev) => prev + 1)
      } finally {
        inFlightRef.current = false
        clearNextFetch()
        if (!mountedRef.current || !loopEnabledRef.current) return
        timerRef.current = setTimeout(() => {
          void fetch()
        }, 5000)
      }
    }

    void fetch()

    return () => {
      clearNextFetch()
    }
  }, [homeOnTab, appOnStage, url])

  useEffect(() => {
    return () => {
      mountedRef.current = false
      clearNextFetch()
    }
  }, [])

  return { btList, success, errCount }
}
