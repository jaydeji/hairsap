import { defineConfig } from 'tsup';
import yamlPlugin_ from 'esbuild-plugin-yaml';

const { yamlPlugin } = yamlPlugin_;

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  esbuildPlugins: [yamlPlugin({})],
});
