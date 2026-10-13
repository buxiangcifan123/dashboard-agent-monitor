import Database from 'better-sqlite3'
import os from 'os'
import path from 'path'
import { result } from './utils'
import type { CollectorResult } from './types'

const DB_PATH = process.env.FAISS_INDEX_DB || path.join(os.homedir(), '.ai-faiss-index', 'vector_store.db')

// 本地向量库已从 ChromaDB HTTP 迁移到 FAISS+SQLite(见 shared-context/vector_store.py)
// 直接只读查 SQLite 拿各集合条数,零网络开销
export async function collectVectorLocal(): Promise<CollectorResult> {
  const id = 'vectorLocal', label = '本地向量库 (FAISS)'
  try {
    const db = new Database(DB_PATH, { readonly: true })
    let cols: any[] = []
    try {
      cols = db.prepare('SELECT id, name FROM collections').all() as any[]
    } catch {
      cols = []
    }
    const counts: { name: string; count: number }[] = []
    for (const c of cols) {
      try {
        const r = db.prepare('SELECT COUNT(*) AS n FROM documents WHERE collection_id = ?').get(c.id) as any
        counts.push({ name: c.name, count: r.n })
      } catch {
        counts.push({ name: c.name, count: -1 })
      }
    }
    db.close()
    counts.sort((a, b) => b.count - a.count)
    return result(id, label, counts.length ? 'up' : 'warn', { counts, path: DB_PATH })
  } catch (e: any) {
    return result(id, label, 'down', { path: DB_PATH }, e.message)
  }
}
