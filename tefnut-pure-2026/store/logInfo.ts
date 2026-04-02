import { create } from 'zustand';

type LogInfoState = {
  logged: Boolean;
  setLogged: (logged: Boolean) => void;
};
export const logInfoStore = create<LogInfoState>((set) => ({
  logged: false,
  setLogged: (logged) => set({ logged }),
}));
