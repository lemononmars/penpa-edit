import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const metadataPath = resolve(process.cwd(), "variant_metadata.json");

function readMetadata() {
  return JSON.parse(readFileSync(metadataPath, "utf8"));
}

function variantDetailPages() {
  const metadata = readMetadata();
  const ids = Array.from(new Set(metadata.variants
    .filter((variant) => variant.status !== "hidden")
    .map((variant) => metadata.aliases[variant.id] || variant.id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase())
    .filter(Boolean)));
  return {
    name: "variant-detail-pages",
    writeBundle(options) {
      const outputDirectory = options.dir || resolve(process.cwd(), "dist");
      const template = readFileSync(resolve(outputDirectory, "variant.html"), "utf8");
      const pageDirectory = resolve(outputDirectory, "list");
      mkdirSync(pageDirectory, { recursive: true });
      ids.forEach((id) => {
        const source = template
          .replace("<head>", "<head><base href=\"../../\">")
          .replace('data-catalog-page="detail"', `data-catalog-page="detail" data-variant-id="${id}"`);
        const idDirectory = resolve(pageDirectory, id);
        mkdirSync(idDirectory, { recursive: true });
        writeFileSync(resolve(idDirectory, "index.html"), source, "utf8");
      });
    }
  };
}

export default defineConfig({
  root: "docs",
  plugins: [variantDetailPages(), devApiPlugin(), svelte({ preprocess: vitePreprocess() })],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "docs/index.html"),
        list: resolve(process.cwd(), "docs/list.html")
      }
    }
  }
});
