import { beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers, resetTodos } from './mocks/handlers'

export const server = setupServer(...handlers); 

const isE2E = process.env.E2E_TEST === 'true';

if (!isE2E) {
  const server = setupServer(...handlers)

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterAll(() => server.close())
  afterEach(() => {
    server.resetHandlers()
    resetTodos()
  })
}
