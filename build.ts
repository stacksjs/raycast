import { dts } from 'bun-plugin-dtsx'

// eslint-disable-next-line antfu/no-top-level-await
await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  plugins: [dts()],
})
