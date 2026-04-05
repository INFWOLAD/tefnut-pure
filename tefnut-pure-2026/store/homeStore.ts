import { create } from 'zustand'

type homeState = {
  loopEnabled: boolean
  setLoopEnabled: (loopEnabled: boolean) => void
}
export const homeStore = create<homeState>((set) => ({
  loopEnabled: true,
  setLoopEnabled: (loopEnabled) => set({ loopEnabled }),
}))
