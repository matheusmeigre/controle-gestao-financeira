import '@testing-library/jest-dom'

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'test_user_123' },
    isLoaded: true,
  }),
  auth: () => ({
    userId: 'test_user_123',
  }),
  clerkClient: () => ({
    users: {
      getUser: () => Promise.resolve({ id: 'test_user_123' }),
    },
  }),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'test_user_123' }),
}))
