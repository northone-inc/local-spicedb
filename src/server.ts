import type { ChildProcess } from 'child_process'
import shell from 'shelljs'
import Debugger from 'debug'
import fkill from 'fkill'
import { processExists } from 'process-exists'

const debug = Debugger('local-spicedb:server')
function escapeShellArg(arg: string) {
  return `'${arg.replace(/'/g, '\'\\\'\'')}'`
}

/**
 * Check `spicedb serve --help` for all options
 */
export interface SpiceArguments {
  'grpc-preshared-key': string
  [x: string]: number | string | boolean
}

export interface SpiceOptions {
  /**
   * The path to the spicedb binary
   * @default `shelljs.which(spicedb)`
   */
  bin: string

  /**
   * Enable spicedb server logs pipe to stdout
   */
  serverLogs: boolean
}

export const SpiceDBServer = (spiceArgs: SpiceArguments, options: SpiceOptions) => {
  let ps: ChildProcess | undefined
  options = {
    ...{
      // defaults
      bin: shell.which('spicedb') || 'spicedb',
    },
    // user options
    ...options,
  }
  if (!options.bin) {
    throw new Error('spicedb binary not found')
  }
  // set defaults
  process.on('SIGINT', () => {
    debug('Caught interrupt signal, killing spicedb...')
    if (ps) {
      ps.kill('SIGINT')
      debug('spicedb killed.')
    }
  })

  return {
    start: async () => {
      if (ps && ps.pid) {
        ps.kill('SIGINT')
      } else if (await processExists('spicedb')) {
        await fkill('spicedb', { silent: true })
      }

      return new Promise((resolve, reject) => {
        debug('Starting spicedb...')
        const args = Object.keys(spiceArgs).map((key) => {
          return `--${key}=${escapeShellArg(spiceArgs[key].toString())}`
        })

        debug('spicedb', 'serve', ...args)

        ps = shell.exec([options.bin, 'serve', ...args].join(' '), {
          async: true,
          silent: true,
          fatal: true,
        })

        interface StructuredLogLine {
          level: string
          addr: string
          service: string
          insecure: boolean
          time: string
          message: string
        }

        interface ServerMessage {
          addr: string
          service: string
          insecure: boolean
          time: Date
          message: string
        }

        let metricsServer: ServerMessage
        let dashboardServer: ServerMessage
        let grpcServer: ServerMessage

        if (ps && ps.stderr) {
          ps.stderr.on('data', (data) => {
            // const log = JSON.parse(data.toString())
            const logs = data.toString().split('\n')
              .map((row: string) => row.trim())
              .filter((row: string) => row.length > 0)
              .map((row: string) => {
                try {
                  return JSON.parse(row)
                } catch (err) {
                  if (`${err}`.includes('spicedb: not found')) {
                    throw new Error('spicedb not found. Please install it.')
                    // spicedb not found
                  } else {
                    throw new Error(`Failed to parse JSON Line: ${err}: ${row}`)
                  }
                }
              })

            logs.forEach((log: StructuredLogLine) => {
              if (options.serverLogs) {
                debug(log)
              }
              if (log.service === 'metrics' && log.message.includes('server started serving')) {
                metricsServer = {
                  addr: log.addr,
                  service: log.service,
                  insecure: log.insecure,
                  time: new Date(log.time),
                  message: log.message,
                }
              }
              if (log.service === 'dashboard' && log.message.includes('server started serving')) {
                dashboardServer = {
                  addr: log.addr,
                  service: log.service,
                  insecure: log.insecure,
                  time: new Date(log.time),
                  message: log.message,
                }
              }
              if (log.service === 'grpc' && log.message.includes('server started serving')) {
                grpcServer = {
                  addr: log.addr,
                  service: log.service,
                  insecure: log.insecure,
                  time: new Date(log.time),
                  message: log.message,
                }
              }
              if (metricsServer && dashboardServer && grpcServer) {
                resolve({
                  metricsServer,
                  dashboardServer,
                  grpcServer,
                })
              }
            })
          })
        } else {
          reject(new Error('Spicedb process not started, ps.stderr is null'))
        }
      })
    },
    stop: async () => {
      if (ps && ps.pid) {
        ps.kill('SIGINT')
      } else if (await processExists('spicedb')) {
        await fkill('spicedb', { silent: true })
      } else {
        throw new Error('Spicedb process not started')
      }
    },
    ps,
  }
}

export default SpiceDBServer
