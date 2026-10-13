import { create } from 'zustand'
import type { MonitorSnapshot, TunnelStatus } from '../types'

interface MonitorState {
  snapshot: MonitorSnapshot | null
  loading: boolean
  error: string | null
  tunnelStatus: TunnelStatus | null
  lastUpdated: number | null
  setSnapshot: (s: MonitorSnapshot) => void
  setTunnel: (s: TunnelStatus) => void
  refresh: () => Promise<void>
}

export const useMonitorStore = create<MonitorState>((set) => ({
  snapshot: null,
  loading: false,
  error: null,
  tunnelStatus: null,
  lastUpdated: null,
  setSnapshot: (s) => set({ snapshot: s, lastUpdated: Date.now(), loading: false, error: null }),
  setTunnel: (s) => set({ tunnelStatus: s }),
  refresh: async () => {
    set({ loading: true })
    try {
      const snap = await window.dashAPI.refresh()
      set({ snapshot: snap, lastUpdated: Date.now(), loading: false, error: null })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },
}))
