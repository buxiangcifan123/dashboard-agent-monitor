import Database from 'better-sqlite3'
import path from 'path'
import os from 'os'
import { result, tcpProbe } from './utils'
import type { CollectorResult } from './types'

const DB_PATH = path.join(os.homedir(), '.n8n', 'database.sqlite')

export async function collectN8n(): Promise<CollectorResult> {
  const id = 'n8n', label = 'n8n (5678)'
  const tcpUp = await tcpProbe('127.0.0.1', 5678)

  let workflows: any[] = []
  let recentExec: any[] = []
  let errorWorkflows: { name: string; count: number; latest: string }[] = []
  let dbError: string | undefined

  try {
    const db = new Database(DB_PATH, { readonly: true })
    workflows = db.prepare('SELECT id, name, active FROM workflow_entity').all() as any[]
    recentExec = db.prepare(
      'SELECT id, workflowId, status, "startedAt", "stoppedAt" FROM execution_entity ORDER BY "startedAt" DESC LIMIT 20',
    ).all() as any[]
    const stats = db.prepare(
      'SELECT "workflowName", name, count, "latestEvent" FROM workflow_statistics',
    ).all() as any[]
    errorWorkflows = stats
      .filter((s: any) => s.name === 'production_error' && s.count > 0)
      .map((s: any) => ({ name: s.workflowName, count: s.count, latest: s.latestEvent }))
    db.close()
  } catch (e: any) {
    dbError = e.message
  }

  const status = !tcpUp ? 'down' : (errorWorkflows.length > 0 ? 'warn' : 'up')
  return result(id, label, status, { tcpUp, workflows, recentExecutions: recentExec, errorWorkflows, dbError })
}
