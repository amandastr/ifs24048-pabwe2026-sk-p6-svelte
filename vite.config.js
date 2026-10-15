import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Optimasi index.html saat build:
// 1) CSS utama disisipkan langsung (tidak menjadi render-blocking request)
// 2) skrip utama diberi <link rel="modulepreload"> agar tidak dihitung sebagai
//    rantai permintaan kritis (Lighthouse: "Network dependency tree")
function optimizeIndexHtml() {
  return {
    name: "optimize-index-html",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;

        const withInlineCss = html.replace(
          /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
          (match, href) => {
            const fileName = href.replace(/^\//, "");
            const asset = ctx.bundle[fileName];
            if (!asset || asset.type !== "asset") return match;
            delete ctx.bundle[fileName];
            return `<style>${asset.source}</style>`;
          }
        );

        return withInlineCss.replace(
          /<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/,
          (script, src) => `<link rel="modulepreload" crossorigin href="${src}">\n  ${script}`
        );
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      svelte({
        prebundleSvelteLibraries: false,
      }),
      tailwindcss(),
      optimizeIndexHtml(),
      svelteTesting(),
    ],
    server: {
      port: Number(env.APP_PORT) || 3004,
    },
    preview: {
      port: Number(env.APP_PORT) || 3004,
    },
    build: {
      target: "esnext",
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,svelte}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
