import { createMobilePlanningSchema, mobilePlanningResponseSchema, mobilePlanningsListResponseSchema } from '@contracts'
import { createPlanning, listPlannings } from '@/application/api-v1/plannings'
import { requireApiUser } from '../_lib/auth'
import { contractJson } from '../_lib/contracts'
import { problemFromRequestError } from '../_lib/problem'

export async function GET() {
  const instance = '/api/v1/plannings'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const data = await listPlannings(authResult.userId)
    return contractJson(mobilePlanningsListResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function POST(request: Request) {
  const instance = '/api/v1/plannings'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = createMobilePlanningSchema.parse(await request.json())
    const data = await createPlanning(authResult.userId, body)
    return contractJson(mobilePlanningResponseSchema, { data }, { status: 201 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
