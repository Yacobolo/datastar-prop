import esbuild from 'esbuild'

const isProd = process.env.NODE_ENV === 'production'

// Main plugin build
const pluginConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/index.js',
  minify: isProd,
  sourcemap: true,
  target: 'es2021',
  // External dependencies - users should load datastar separately via import map
  external: ['datastar'],
}

// Demo components build (for the demo page)
const demoConfig = {
  entryPoints: ['demo/components/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'demo/dist/components.js',
  minify: isProd,
  sourcemap: true,
  target: 'es2021',
  // External - loaded via CDN importmap in index.html
  external: ['lit', 'lit/decorators.js', 'three', 'echarts'],
}

// Demo CSS build with modern features
const cssConfig = {
  entryPoints: ['demo/styles/main.css'],
  bundle: true,
  minify: isProd,
  outfile: 'demo/dist/styles.css',
  sourcemap: true,
  // Target modern browsers that support CSS nesting, @layer, etc.
  target: ['chrome120', 'firefox120', 'safari17'],
}

// Build all
async function build() {
  try {
    await esbuild.build(pluginConfig)
    console.log('Plugin build complete')
    
    await esbuild.build(demoConfig)
    console.log('Demo components build complete')
    
    await esbuild.build(cssConfig)
    console.log('Demo CSS build complete')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

build()
