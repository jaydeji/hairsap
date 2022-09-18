import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: true,
  minify: ['production', 'staging'].includes(process.env.NODE_ENV as string),
})
