import { create } from 'zustand'

type CommonState = {
  logged: boolean
  loggedUserInfo?: {
    username: string
    url: string
  }
  setLogged: (logged: boolean) => void
  setLoggedUserInfo: (userInfo: CommonState['loggedUserInfo']) => void
}
export const commonStore = create<CommonState>((set) => ({
  logged: false,
  setLogged: (logged) => set({ logged }),
  setLoggedUserInfo: (userInfo) => set({ loggedUserInfo: userInfo }),
}))
