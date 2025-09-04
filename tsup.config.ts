import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  treeshake: true,
  sourcemap: false,
  minify: true,
  clean: true,
  dts: true,
  splitting: false,
  format: ["cjs", "esm"],
  injectStyle: false,
  external: ["react", "react-dnd", "react-dnd-html5-backend", "dnd-core", "react-hook-form"],
});
