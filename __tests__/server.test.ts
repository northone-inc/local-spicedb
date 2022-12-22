import { describe, it } from 'vitest'
import { SpiceDBServer } from '../src/server'

describe('SpiceDBServer', () => {
  it('can start and stop server', async () => {
    const server = SpiceDBServer({ 'grpc-preshared-key': 'test' })
    await server.start()
    server.stop()
  })
})
