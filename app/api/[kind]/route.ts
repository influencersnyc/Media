import { handleSubmission } from '../../../lib/submissions'
export const runtime = 'nodejs'
export const maxDuration = 45
export async function POST(request: Request, context: { params: Promise<{ kind: string }> }) {
  return handleSubmission(request, (await context.params).kind)
}
