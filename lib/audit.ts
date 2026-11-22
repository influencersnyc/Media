import { createServiceClient } from './supabase/server'

// Writes an audit record for an administrative change. Call after every
// successful admin mutation; failures here must not mask the mutation's
// result, so errors are logged and swallowed.
export async function logAudit(actorId: string | null, action: string, entityType: string, entityId?: string) {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.rpc('log_audit', {
      actor: actorId, action, entity_type: entityType, entity_id: entityId ?? null,
    })
    if (error) console.error('Audit write failed', { action, entityType })
  } catch {
    console.error('Audit write failed', { action, entityType })
  }
}
