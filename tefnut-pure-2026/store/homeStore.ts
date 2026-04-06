import { create } from 'zustand'

type homeState = {
  appOnStage: boolean
  homeOnTab: boolean
  setAppOnStage: (appOnStage: boolean) => void
  setHomeOnTab: (homeOnTab: boolean) => void
}
export const homeStore = create<homeState>((set) => ({
  appOnStage: true,
  homeOnTab: false,
  setAppOnStage: (appOnStage) => set({ appOnStage }),
  setHomeOnTab: (homeOnTab) => set({ homeOnTab }),
}))
