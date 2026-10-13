import { result, postJson } from './utils'
import { ECS_HOST, ECS_PORTS, adminHeaders, isTunnelReady } from './ecs-config'
import type { CollectorResult } from './types'

interface TaskRun { name: string; time: string; ok: boolean; raw: string }

const TASK_NAMES = ['每日 AI HOT', '每日论文', 'content_farm', '每周周报', 'weekly_report', '每日 content_farm']

// POST :9090/exec tail scheduler.log → 解析每个任务最近一次 ✅/❌;cat weekly_report_last_run.txt
export async function collectEcsTasks(): Promise<CollectorResult> {
  const id = 'ecsTasks', label = 'ECS 定时任务'
  if (!isTunnelReady()) return result(id, label, 'unknown', { reason: 'tunnel down' })
  try {
    const logRes = await postJson(
      `http://${ECS_HOST}:${ECS_PORTS.admin}/exec`,
      { cmd: 'tail -n 60 /app/logs/scheduler.log' },
      { headers: adminHeaders() },
      10000,
    )
    const logText: string = logRes?.stdout || ''
    const lines = logText.split('\n').filter(Boolean)
    const runs: TaskRun[] = []
    for (const line of lines) {
      const tm = line.match(/\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/)?.[0]
      if (!tm) continue
      const isOk = line.includes('✅')
      const isFail = line.includes('❌')
      if (!isOk && !isFail) continue
      let name = 'unknown'
      for (const tn of TASK_NAMES) if (line.includes(tn)) { name = tn; break }
      runs.push({ name, time: tm, ok: isOk, raw: line.replace(/^\[|\]$/g, '').trim() })
    }
    // 每个任务取最后一条(后覆盖前)
    const byTask = new Map<string, TaskRun>()
    for (const r of runs) byTask.set(r.name, r)
    const recent = [...byTask.values()]

    const wkRes = await postJson(
      `http://${ECS_HOST}:${ECS_PORTS.admin}/exec`,
      { cmd: 'cat /app/logs/weekly_report_last_run.txt' },
      { headers: adminHeaders() },
      8000,
    )
    const weeklyLastRun = (wkRes?.stdout || '').trim()

    const anyFail = recent.some((r) => !r.ok)
    const status = recent.length === 0 ? 'unknown' : (anyFail ? 'warn' : 'up')
    return result(id, label, status, { recent, weeklyLastRun, logTail: lines.slice(-15) })
  } catch (e: any) {
    return result(id, label, 'warn', {}, e.message)
  }
}
