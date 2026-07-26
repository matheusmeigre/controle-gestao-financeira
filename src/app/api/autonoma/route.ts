import { createHandler } from '@autonoma-ai/server-web'
import type { FactoryContext, FactoryRegistry } from '@autonoma-ai/sdk'
import {
  autonomaFactories,
  deleteAutonomaUserData,
} from '@/lib/autonoma/factories'

export const runtime = 'nodejs'

interface TrackedCreation {
  model: string
  record: Record<string, unknown> & { id: string | number }
  context: FactoryContext
}

function createTrackedFactories(tracked: TrackedCreation[]) {
  const registry: FactoryRegistry = {}

  for (const [model, factory] of Object.entries(autonomaFactories)) {
    registry[model] = {
      ...factory,
      create: async (data, context) => {
        const record = await factory.create(data, context)
        tracked.push({ model, record, context })
        return record
      },
    }
  }

  return registry
}

function getUserIds(refs: Record<string, Record<string, unknown>[]>) {
  return (refs.User ?? [])
    .map((record) => record.id)
    .filter((id): id is string => typeof id === 'string')
}

async function rollbackFailedUp(tracked: TrackedCreation[]) {
  const errors: unknown[] = []

  for (const creation of [...tracked].reverse().filter(({ model }) => model !== 'User')) {
    const factory = autonomaFactories[creation.model as keyof typeof autonomaFactories]
    try {
      await factory.teardown?.(creation.record as never, creation.context)
    } catch (error) {
      errors.push(error)
    }
  }

  const users = tracked.filter(({ model }) => model === 'User')
  try {
    await deleteAutonomaUserData(users.map(({ record }) => String(record.id)))
  } catch (error) {
    errors.push(error)
  }

  for (const creation of users.reverse()) {
    try {
      await autonomaFactories.User.teardown?.(creation.record as never, creation.context)
    } catch (error) {
      errors.push(error)
    }
  }

  if (errors.length > 0) {
    console.error('[Autonoma] Failed to fully roll back an up request', errors)
  }
}

export async function POST(request: Request) {
  const enabled = process.env.AUTONOMA_ENABLED === 'true' || Boolean(process.env.AUTONOMA_PREVIEWKIT)
  if (!enabled) {
    return Response.json({ error: 'Not Found', code: 'NOT_FOUND' }, { status: 404 })
  }

  const sharedSecret = process.env.AUTONOMA_SHARED_SECRET
  const signingSecret = process.env.AUTONOMA_SIGNING_SECRET

  if (!sharedSecret || !signingSecret) {
    return Response.json(
      { error: 'Autonoma Environment Factory is not configured', code: 'AUTONOMA_NOT_CONFIGURED' },
      { status: 503 },
    )
  }

  if (sharedSecret === signingSecret) {
    return Response.json(
      { error: 'AUTONOMA_SHARED_SECRET and AUTONOMA_SIGNING_SECRET must differ', code: 'SAME_SECRETS' },
      { status: 500 },
    )
  }

  const tracked: TrackedCreation[] = []
  const handler = createHandler({
    scopeField: 'userId',
    sharedSecret,
    signingSecret,
    factories: createTrackedFactories(tracked),
    auth: async (user) => {
      if (!user || typeof user.email !== 'string' || typeof user.password !== 'string') {
        throw new Error('The scenario must create a User before authentication')
      }

      return {
        credentials: {
          email: user.email,
          password: user.password,
        },
      }
    },
    beforeDown: async ({ refs }) => {
      await deleteAutonomaUserData(getUserIds(refs))
    },
  })

  const response = await handler(request)
  if (!response.ok && tracked.length > 0) {
    await rollbackFailedUp(tracked)
  }

  return response
}
