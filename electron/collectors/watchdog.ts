import { exec } from 'child_process'
import { result } from './utils'
import type { CollectorResult } from './types'

// 用 PowerShell 取任务计划信息(输出 JSON,字段名跨语言稳定,避开 schtasks 中文标签问题)
export async function collectWatchdog(): Promise<CollectorResult> {
  const id = 'watchdog', label = 'AutoGuard Watchdog'
  const ps =
    'powershell -NoProfile -Command "' +
    "$ErrorActionPreference='SilentlyContinue';" +
    "$t=Get-ScheduledTask -TaskName 'AutoGuard-Watchdog';" +
    '$i=$t|Get-ScheduledTaskInfo;' +
    '[PSCustomObject]@{State=$t.State;LastRunTime=$i.LastRunTime;LastTaskResult=$i.LastTaskResult;NextRunTime=$i.NextRunTime}|ConvertTo-Json' +
    '"'
  return new Promise((resolve) => {
    exec(ps, { encoding: 'utf8', timeout: 10000, windowsHide: true }, (err, stdout) => {
      if (err && !stdout) {
        resolve(result(id, label, 'down', {}, err?.message))
        return
      }
      try {
        const j = JSON.parse(stdout.trim())
        // LastTaskResult: 0=成功, 267011(0x41303)=尚未运行, null=无记录 —— 这些都算正常
        const code = j.LastTaskResult
        const ok = code === 0 || code === null || code === 267011
        resolve(result(id, label, ok ? 'up' : 'warn', j))
      } catch (e: any) {
        resolve(result(id, label, 'warn', { raw: stdout }, e.message))
      }
    })
  })
}
