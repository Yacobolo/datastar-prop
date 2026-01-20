import esbuild from 'esbuild'

// Simple build without any datastar bundling
// This plugin expects datastar to be loaded externally via import map
const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/index.js',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
  target: 'es2021',
  // External dependencies - users should load datastar separately via import map
  external: ['datastar'],
}

// Build
esbuild.build(config).then(() => {
  console.log('Build complete')
}).catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})
