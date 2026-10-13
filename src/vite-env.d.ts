/// <reference types="vite/client" />

import type { MonitorSnapshot, TunnelStatus } from './types'

interface DashAPI {
  refresh: () => Promise<MonitorSnapshot>
  getTunnelStatus: () => Promise<TunnelStatus>
  onTunnelChange: (cb: (s: TunnelStatus) => void) => () => void
  reconnect: () => Promise<void>
  setInterval: (sec: number) => Promise<void>
  getInterval: () => Promise<number>
}

declare global {
  interface Window {
    dashAPI: DashAPI
  }
}

export {}
