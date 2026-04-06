import { create } from 'zustand'

type CommonState = {
  logged: boolean
  loggedUserInfo?: {
    username: string
    url: string
  }
  browserUrl: string
  setLogged: (logged: boolean) => void
  setLoggedUserInfo: (userInfo: CommonState['loggedUserInfo']) => void
  setBrowserUrl: (url: string) => void
}
export const commonStore = create<CommonState>((set) => ({
  logged: false,
  setLogged: (logged) => set({ logged }),
  setLoggedUserInfo: (userInfo) => set({ loggedUserInfo: userInfo }),
  browserUrl: '',
  setBrowserUrl: (url) => set({ browserUrl: url }),
}))
