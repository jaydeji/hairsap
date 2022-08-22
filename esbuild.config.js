const { yamlPlugin } = require('esbuild-plugin-yaml')

require('esbuild').build({
  entryPoints: ['./src'],
  bundle: true,
  minify: true,
  platform: 'node',
  sourcemap: true,
  external: ['./node_modules/*'],
  plugins: [yamlPlugin()],
  outfile: 'out.js',
})
