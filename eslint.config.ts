import antfu from '@antfu/eslint-config'

const config = antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
  },

  typescript: true,
  jsonc: true,
  yaml: true,
  ignores: [
    'fixtures/**',
  ],
})

export default config
