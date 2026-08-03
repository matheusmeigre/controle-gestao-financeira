import { mobilePlanningResponseSchema, resourceIdSchema, updateMobilePlanningSchema } from '@contracts'
import { deletePlanning, getPlanning, updatePlanning } from '@/application/api-v1/plannings'
import { requireApiUser } from '../../_lib/auth'
import { contractJson } from '../../_lib/contracts'
import { problemFromRequestError, problemJson } from '../../_lib/problem'

type RouteContext = {
  params: Promise<{ planningId: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { planningId } = await context.params
  const instance = `/api/v1/plannings/${planningId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const data = await getPlanning(authResult.userId, resourceIdSchema.parse(planningId))
    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Planning not found.', instance, code: 'planning_not_found' })
    }

    return contractJson(mobilePlanningResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { planningId } = await context.params
  const instance = `/api/v1/plannings/${planningId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = updateMobilePlanningSchema.parse(await request.json())
    const data = await updatePlanning(authResult.userId, resourceIdSchema.parse(planningId), body)
    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Planning not found.', instance, code: 'planning_not_found' })
    }

    return contractJson(mobilePlanningResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { planningId } = await context.params
  const instance = `/api/v1/plannings/${planningId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const deleted = await deletePlanning(authResult.userId, resourceIdSchema.parse(planningId))
    if (!deleted) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Planning not found.', instance, code: 'planning_not_found' })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
