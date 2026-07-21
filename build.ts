import process from 'node:process'
import { dts } from 'bun-plugin-dtsx'

async function buildExtension(): Promise<void> {
  await Bun.build({
    entrypoints: ['src/index.tsx'],
    outdir: './dist',
    external: ['@raycast/api', '@raycast/utils', 'react', 'react-dom'],
    plugins: [dts()],
  })
}

buildExtension().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
