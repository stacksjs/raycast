import { dts } from 'bun-plugin-dtsx'

// eslint-disable-next-line antfu/no-top-level-await
await Bun.build({
  entrypoints: ['src/index.tsx'],
  outdir: './dist',
  external: ['@raycast/api', '@raycast/utils', 'react', 'react-dom'],
  plugins: [dts()],
})
