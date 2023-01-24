import pm2 from 'pm2'
import Debugger from 'debug'
export { killDaemon } from 'pm2'
const debug = Debugger('spicedb:pm2-control')

function escapeShellArg(arg: string) {
  return `'${arg.replace(/'/g, '\'\\\'\'')}'`
}

export interface SpiceOptions {
  'grpc-preshared-key': string
  [x: string]: number | string | boolean
}

export async function start(options: SpiceOptions) {
  const args = Object.keys(options).map((key) => {
    return `--${key}=${escapeShellArg(options[key].toString())}`
  })

  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        reject(err)
      }

      const serviceConfig: pm2.StartOptions = {
        script: '/usr/local/bin/spicedb',
        args: ['serve'].concat(args),
        name: 'spicedb-serve',
        env: {
          DEBUG: 'spicedb:*',
        },
        autorestart: false,
        interpreter: 'none',
      }
      debug('serviceConfig', serviceConfig)

      pm2.start(serviceConfig, (err, proc) => {
        reject(err)
        resolve(proc)
      })
    })
  })
}

if (require.main === module) {
  start({
    'grpc-preshared-key': 'test',
  }).then((_proc) => {
    debug('started')
    setTimeout(() => {
      pm2.killDaemon((err) => {
        if (err) {
          console.error(err)
          process.exit(1)
        }
      })
    }, 5000)
  }).catch((err) => {
    console.error(err)
    process.exit(1)
  })
} else {
  // required as a module
}
