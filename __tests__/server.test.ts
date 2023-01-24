import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SpiceDBServer } from '../src/server'

describe('SpiceDBServer', () => {
  it('can start and stop server', async () => {
    const server = SpiceDBServer({ 'grpc-preshared-key': 'test' })
    await server.start()
    await server.stop()
  })
})

describe('can kill processes', () => {
  let server: ReturnType<typeof SpiceDBServer>
  beforeEach(async () => {
    server = SpiceDBServer({ 'grpc-preshared-key': 'test' })
    await server.start()
  })
  afterEach(async () => {
    await server.stop()
  })
  it('can rapidly start and stop server', async () => {
    expect(true).toBe(true)
  })
  it('can rapidly start and stop server', async () => {
    expect(true).toBe(true)
  })
  it('can rapidly start and stop server', async () => {
    expect(true).toBe(true)
  })
  it('can rapidly start and stop server', async () => {
    expect(true).toBe(true)
  })
})
