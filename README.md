# Local SpiceDB

> **Warning**
> This project is still experimental, not for production use - FEATURES MAY CHANGE WITHOUT WARNING

Local SpiceDB instance for testing

- [Local SpiceDB](#local-spicedb)
  - [Features](#features)
  - [Install](#install)
  - [Usage](#usage)
  - [Attributions](#attributions)

## Features

- Interacts with `spicedb` in your local `$PATH`
- provides start and start server functionality
- users in-memory to easily throw-away for integration testing

## Install

```bash
brew bundle # installs spicedb locally
npm install -D local-spicedb
```

## Usage

```typescript
import { describe, it } from 'vitest'
import { SpiceDBServer } from 'local-spicedb'

describe('My SpiceDB Application', () => {
  it('can start and stop server', async () => {
    const server = SpiceDBServer({ 'grpc-preshared-key': 'test' })
    await server.start()
    // ...
    // 1. make requests to spicedb server, default port using pre-shared key above
    // 2....
    // 3. great profit
    // ...
    server.stop() # sends SIGINT to running process
  })
})

```

## Attributions

- [shelljs](https://www.npmjs.com/package/shelljs)
- [spicedb](https://github.com/authzed/spicedb) by [AuthZed](https://authzed.com/)
