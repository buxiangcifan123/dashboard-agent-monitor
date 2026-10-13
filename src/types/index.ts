// 采集结果标准形状:主进程采集器产出,渲染进程消费
export type Status = 'up' | 'down' | 'warn' | 'unknown'

export interface CollectorResult {
  id: string
  label: string
  status: Status
  data?: unknown
  error?: string
  checkedAt: number
}

export interface TunnelStatus {
  state: 'disconnected' | 'connecting' | 'connected' | 'error'
  message?: string
  since: number
}

export interface Alert {
  level: 'error' | 'warn'
  source: string
  message: string
}

export interface MonitorSnapshot {
  local: CollectorResult[]
  ecs: CollectorResult[]
  alerts: Alert[]
  collectedAt: number
}
