import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const markConfigPath = resolve(process.cwd(), "variations/_markConfig.json");

function variantMarkEditor() {
  return {
    name: "variant-mark-editor",
    configureServer(server) {
      server.middlewares.use("/__variant-marks", (request, response, next) => {
        if (request.method === "GET") {
          response.setHeader("Content-Type", "application/json");
          response.end(readFileSync(markConfigPath, "utf8"));
          return;
        }
        if (request.method !== "PUT") return next();
        let body = "";
        request.on("data", (chunk) => { body += chunk; });
        request.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed?.version !== 1 || !parsed.overrides || Array.isArray(parsed.overrides)) {
              throw new Error("Expected a version 1 mark configuration.");
            }
            writeFileSync(markConfigPath, JSON.stringify(parsed, null, 2) + "\n", "utf8");
            response.statusCode = 204;
            response.end();
          } catch (error) {
            response.statusCode = 400;
            response.end(error instanceof Error ? error.message : "Invalid mark configuration.");
          }
        });
      });
    }
  };
}

function variantDetailPages() {
  const removed = new Set(["hex", "parquet", "tightfit", "ninedragons", "battleship", "odd", "even",
    "kropkipairs", "sudokurve", "inclusion", "multidiagonal", "search6", "substitution", "alphabet", "halfsquares"]);
  const aliases = {
    antidiagonal: "anti diagonal", antiknight: "anti knight", battenburg: "battenburg",
    littlekiller: "little killer", nonconsecutive: "non consecutive", oddeven: "odd even"
  };
  const ids = Array.from(new Set(readdirSync(resolve(process.cwd(), "variations"))
    .filter((name) => name.endsWith(".json") && !name.startsWith("_"))
    .map((name) => JSON.parse(readFileSync(resolve(process.cwd(), "variations", name), "utf8")).id)
    .filter((id) => id && !removed.has(id))
    .map((id) => aliases[id] || id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase())));
  return {
    name: "variant-detail-pages",
    writeBundle(options) {
      const outputDirectory = options.dir || resolve(process.cwd(), "dist");
      const template = readFileSync(resolve(outputDirectory, "variant.html"), "utf8");
      const pageDirectory = resolve(outputDirectory, "variant-pages");
      mkdirSync(pageDirectory, { recursive: true });
      ids.forEach((id) => {
        const source = template
          .replace("<head>", "<head><base href=\"../\">")
          .replace('data-catalog-page="detail"', `data-catalog-page="detail" data-variant-id="${id}"`);
        writeFileSync(resolve(pageDirectory, `${id}.html`), source, "utf8");
      });
    }
  };
}

export default defineConfig({
  root: "docs",
  plugins: [variantMarkEditor(), variantDetailPages(), svelte({ preprocess: vitePreprocess() })],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "docs/index.html"),
        "variant-wiki": resolve(process.cwd(), "docs/variant-wiki.html"),
        variant: resolve(process.cwd(), "docs/variant.html"),
        marks: resolve(process.cwd(), "docs/marks.html")
      }
    }
  },
});
