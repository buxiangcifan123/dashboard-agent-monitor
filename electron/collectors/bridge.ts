import { result, fetchText, tcpProbe } from './utils'
import type { CollectorResult } from './types'

export async function collectBridge(): Promise<CollectorResult> {
  const id = 'bridge', label = 'Bridge (8765)'
  try {
    const txt = await fetchText('http://127.0.0.1:8765/health', {}, 3000)
    const up = txt.trim() === 'OK'
    return result(id, label, up ? 'up' : 'warn', { response: txt.trim() })
  } catch (e: any) {
    // HTTP 不通再退到 TCP 探活,端口在但 /health 不响应算 warn
    const tcpUp = await tcpProbe('127.0.0.1', 8765)
    return result(id, label, tcpUp ? 'warn' : 'down', { tcpUp }, e.message)
  }
}
