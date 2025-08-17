
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/client/embla-init.ts', 'src/client/editor.ts', 'src/client/atcoder.ts'],
  format: ['esm'],
  target: 'es2022',
  outDir: 'public/js',
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: false, // デバッグしやすく。必要なら true に
  // ★ ここが肝：これらは external にしない（= バンドルに含める）
  noExternal: ['embla-carousel', 'markdown-it', 'chart.js'],
})
