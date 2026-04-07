import { request } from '@/utils/request'
import { commonStore } from '@/store/commonStore'
import { homeStore } from '@/store/homeStore'
import { useState, useEffect, useRef } from 'react'
export function useBtList() {
  const url = commonStore((state) => state.loggedUserInfo?.url)
  const homeOnTab = homeStore((state) => state.homeOnTab)
  const appOnStage = homeStore((state) => state.appOnStage)
  const [btList, setBtList] = useState<any[]>([])
  const [btTotalInfo, setBtTotalInfo] = useState<any>({})
  const [success, setSuccess] = useState(false)
  const [errCount, setErrCount] = useState(0)
  const [manualRefresh, setManualRefresh] = useState(0)

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
          url: `${url}/api/v2/sync/maindata`,
          method: 'POST',
          withOutLog: true,
        })
        const btlistTmp = Object.values(response.torrents || {})
        if (!mountedRef.current) return
        setBtList(btlistTmp)
        setBtTotalInfo(response.server_state || {})
        setSuccess(true)
        setErrCount(0)
        console.log('Fetched torrents, time:', new Date().toLocaleTimeString())
      } catch (error) {
        if (!mountedRef.current) return
        console.log('Error fetching torrents:', error)
        setBtTotalInfo({ connection_status: `retrying...(${errCount})` })
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
  }, [homeOnTab, appOnStage, url, manualRefresh])

  useEffect(() => {
    return () => {
      mountedRef.current = false
      clearNextFetch()
    }
  }, [])

  function refetchBtList() {
    setTimeout(() => {
      setManualRefresh((prev) => prev + 1)
    }, 1000)
  }

  return { btList, btTotalInfo, success, errCount, refetchBtList }
}
