import { defineConfig } from "tsup";
import path from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  bundle: true,
  dts: false,
  noExternal: [/^(?!@modelcontextprotocol)/],
  esbuildOptions(options) {
    options.alias = {
      "@engine": path.resolve(__dirname, "../../src/lib/engine"),
    };
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
});
