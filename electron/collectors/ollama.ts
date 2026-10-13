import { result, fetchJson } from './utils'
import type { CollectorResult } from './types'

export async function collectOllama(): Promise<CollectorResult> {
  const id = 'ollama', label = 'Ollama (11434)'
  try {
    const j = await fetchJson('http://localhost:11434/api/tags', {}, 3000)
    const models = (j.models || []).map((m: any) => m.name)
    return result(id, label, 'up', { models, count: models.length })
  } catch (e: any) {
    return result(id, label, 'down', {}, e.message)
  }
}
