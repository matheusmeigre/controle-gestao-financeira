import { auth } from '@clerk/nextjs/server'
import { problemJson } from './problem'

export async function requireApiUser(instance: string) {
  const { userId } = await auth()

  if (!userId) {
    return {
      response: problemJson({
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication is required to access this resource.',
        instance,
        code: 'unauthorized',
      }),
    }
  }

  return { userId }
}
