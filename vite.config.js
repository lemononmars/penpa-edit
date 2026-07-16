import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";



function variantDetailPages() {
  const removed = new Set(["hex", "parquet", "tightfit", "ninedragons", "battleship", "odd", "even",
    "kropkipairs", "sudokurve", "inclusion", "multidiagonal", "search6", "substitution", "alphabet", "halfsquares"]);
  const aliases = {
    antidiagonal: "anti diagonal", antiknight: "anti knight", battenburg: "battenburg",
    littlekiller: "little killer", nonconsecutive: "non consecutive", oddeven: "odd even"
  };
  const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/sudoku$/i, "");
  const scrapedVariants = JSON.parse(readFileSync(resolve(process.cwd(), "sudoku_variants.json"), "utf8"));
  const scrapedIds = scrapedVariants.map((item) => normalize(item.title));

  const fileIds = Array.from(new Set(readdirSync(resolve(process.cwd(), "variations"))
    .filter((name) => name.endsWith(".json") && !name.startsWith("_"))
    .map((name) => JSON.parse(readFileSync(resolve(process.cwd(), "variations", name), "utf8")).id)
    .filter((id) => id && !removed.has(id))
    .map((id) => aliases[id] || id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase())));
  const ids = Array.from(new Set([...fileIds, ...scrapedIds]));
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
  plugins: [variantDetailPages(), svelte({ preprocess: vitePreprocess() })],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "docs/index.html"),
        "variant-wiki": resolve(process.cwd(), "docs/variant-wiki.html"),
        variant: resolve(process.cwd(), "docs/variant.html")
      }
    }
  },
});
