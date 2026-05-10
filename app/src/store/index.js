import { create } from 'zustand';

export const useAppStore = create((set) => ({
  lotStatus: [],
  setLotStatus: (data) => set({ lotStatus: data }),

  selectedGarage: null,
  setSelectedGarage: (garage) => set({ selectedGarage: garage }),

  floors: [],
  setFloors: (floors) => set({ floors }),

  selectedFloor: 0,
  setSelectedFloor: (idx) => set({ selectedFloor: idx }),

  alerts: {},
  toggleAlert: (garageId) =>
    set((state) => ({
      alerts: { ...state.alerts, [garageId]: !state.alerts[garageId] },
    })),

  myPermit: null,
  setMyPermit: (permit) => set({ myPermit: permit }),
}));
