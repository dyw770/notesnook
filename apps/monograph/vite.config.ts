/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";
import wasm from "vite-plugin-wasm";
import { ThemeDark } from "@notesnook/theme";
import type { Plugin, ResolvedConfig } from "vite";
import { writeFile } from "fs/promises";
import path from "path";
import * as pkg from "./package.json";

const DEDUPE = [
  "react",
  "react-dom",
  "@mdi/js",
  "@mdi/react",
  "@emotion/react",
  "zustand",
  "@theme-ui/core",
  "@theme-ui/components"
];
const DEFAULT_THEME_KEY =
  process.env.NODE_ENV === "development"
    ? "DEFAULT_THEME"
    : "globalThis.DEFAULT_THEME";
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    writePlugin({
      "package.json": JSON.stringify({
        name: pkg.name,
        version: pkg.version,
        type: "module",
        scripts: { start: pkg.scripts.start },
        dependencies: {
          "@remix-run/serve": pkg.devDependencies["@remix-run/serve"]
        }
      })
    }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      }
    }),
    tsconfigPaths(),
    arraybuffer(),
    wasm()
  ],
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  },
  ssr: {
    ...(process.env.NODE_ENV === "development" ? {} : { noExternal: true }),
    target: "node"
  },
  build: {
    target: isSsrBuild ? "node20" : undefined,
    rollupOptions: {
      external: ["svg2png-wasm/svg2png_wasm_bg.wasm"]
    }
  },
  define: {
    [DEFAULT_THEME_KEY]: JSON.stringify(ThemeDark)
  },
  resolve: {
    dedupe: DEDUPE
  }
}));

function writePlugin(files: Record<string, string>): Plugin {
  let config: ResolvedConfig;
  let output = false;

  return {
    name: "vite-plugin-static-copy:build",
    apply: "build",
    configResolved(_config) {
      config = _config;
    },
    buildEnd() {
      output = false;
    },
    async writeBundle() {
      if (output) return;
      for (const file in files) {
        const content = files[file];
        await writeFile(path.join(config.build.outDir, "..", file), content);
      }
    }
  };
}
