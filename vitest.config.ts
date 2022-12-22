import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    silent: false,
    reporters: ['verbose'],
    coverage: {
      reportsDirectory: '__coverage__',
      reporter: ['json', 'html', 'lcov'],
    },
  },
})
