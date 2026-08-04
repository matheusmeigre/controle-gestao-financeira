import { createMobilePlanningContributionSchema, mobilePlanningResponseSchema, resourceIdSchema } from '@contracts'
import { contributeToPlanning } from '@/application/api-v1/plannings'
import { requireApiUser } from '../../../_lib/auth'
import { contractJson } from '../../../_lib/contracts'
import { problemFromRequestError, problemJson } from '../../../_lib/problem'

type RouteContext = {
  params: Promise<{ planningId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const { planningId } = await context.params
  const instance = `/api/v1/plannings/${planningId}/contributions`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = createMobilePlanningContributionSchema.parse(await request.json())
    const data = await contributeToPlanning(authResult.userId, resourceIdSchema.parse(planningId), body)
    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Planning not found.', instance, code: 'planning_not_found' })
    }

    return contractJson(mobilePlanningResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
