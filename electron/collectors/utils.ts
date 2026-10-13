import net from 'net'
import type { CollectorResult, Status } from './types'

// 构造一条采集结果,自动盖时间戳
export function result(
  id: string,
  label: string,
  status: Status,
  data?: unknown,
  error?: string,
): CollectorResult {
  return { id, label, status, data, error, checkedAt: Date.now() }
}

// 带超时的 GET JSON
export async function fetchJson(url: string, opts: RequestInit = {}, timeoutMs = 5000): Promise<any> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

// 带超时的 GET 文本
export async function fetchText(url: string, opts: RequestInit = {}, timeoutMs = 5000): Promise<string> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(t)
  }
}

// 带超时的 POST JSON
export async function postJson(url: string, body: any, opts: RequestInit = {}, timeoutMs = 10000): Promise<any> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...opts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string> | undefined) },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

// TCP 端口探活(不读数据,连上即算活)
export function tcpProbe(host: string, port: number, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = net.connect({ host, port })
    const t = setTimeout(() => { sock.destroy(); resolve(false) }, timeoutMs)
    sock.on('connect', () => { clearTimeout(t); sock.destroy(); resolve(true) })
    sock.on('error', () => { clearTimeout(t); resolve(false) })
  })
}
