import { create } from 'zustand';

type LogInfoState = {
  logged: boolean;
  setLogged: (logged: boolean) => void;
};
export const logInfoStore = create<LogInfoState>((set) => ({
  logged: false,
  setLogged: (logged) => set({ logged }),
}));
