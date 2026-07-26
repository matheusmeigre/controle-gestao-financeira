import path from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    test: {
      environment: 'node',
      include: ['tests/autonoma/dry-run.ts'],
      fileParallelism: false,
      maxWorkers: 1,
      testTimeout: 120_000,
      hookTimeout: 120_000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
