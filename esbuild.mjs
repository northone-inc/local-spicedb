/* eslint-disable no-console */
import { existsSync, rmSync } from 'node:fs'
import { build } from 'esbuild'
import { dtsPlugin } from 'esbuild-plugin-d.ts'

const outdir = 'dist'

// allow some flags pass through to esbuild
const watch = process.argv.includes('--watch')

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  logLevel: 'info',
  platform: 'node',
  outdir,
  watch,
  // external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    // custom inline plugin to empty outdir before build
    {
      name: 'esbuild:empty-outdir',
      setup(build) {
        const options = build.initialOptions
        build.onStart(async () => {
          if (existsSync(outdir)) {
            if (['verbose', 'debug', 'info'].includes(options.logLevel)) {
              console.log('Emptying outdir', `'${outdir}'..`)
            }
            rmSync(outdir, { recursive: true })
          }
        })
      },
    },
    dtsPlugin(),
  ],
}).catch(() => process.exit(1))
