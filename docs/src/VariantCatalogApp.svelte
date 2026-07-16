<script lang="ts">
  import { onMount } from "svelte";
  import { variations } from "./variationCatalog";
  import {
    automaticBlockerFor,
    cspApproachFor,
    cspConstraintFunctionFor,
    inputModesFor,
    solverTestCasesFor,
  } from "./variantMarks";

  export let page: "variants" | "detail" = "variants";

  let query = "";
  let status = "all";
  let tag = "all";
  let darkTheme = false;

  onMount(() => {
    const cookies = document.cookie.split(";");
    const themeCookie = cookies.find((c) =>
      c.trim().startsWith("color_theme="),
    );
    if (themeCookie) {
      const val = themeCookie.split("=")[1];
      darkTheme = val === "1";
    }
    document.documentElement.classList.toggle("dark", darkTheme);
  });

  const detailId =
    document.body.dataset.variantId ||
    new URLSearchParams(window.location.search).get("id") ||
    "classic";
  const detailVariation = variations.find(
    (variation) => variation.value === detailId,
  );

  $: normalizedQuery = query.trim().toLowerCase();
  $: availableTags = [...new Set(variations.flatMap((variation) => variation.tags))]
    .sort((first, second) => first.localeCompare(second));
  $: filteredVariations = variations.filter((variation) => {
    const matchesStatus = status === "all" || variation.status === status;
    const matchesTag = tag === "all" || variation.tags.includes(tag);
    return (
      matchesStatus &&
      matchesTag &&
      (!normalizedQuery ||
        [variation.name, variation.value, variation.rule, ...variation.tags].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ))
    );
  });

  let newId = "";
  let newName = "";
  let newRule = "";
  let newTags = "";
  let newStatus: "available" | "planned" | "infeasible" | "hidden" = "planned";
  let newInputType: "no-input" | "line" | "region" | "outside" | "shape" = "shape";
  let isSaving = false;
  let saveMessage = "";
  let saveSuccess = false;

  async function handleAddVariant() {
    isSaving = true;
    saveMessage = "";
    try {
      const id = newId.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const response = await fetch("/api/add-variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: newName.trim(),
          rule: newRule.trim(),
          tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
          status: newStatus,
          inputType: newInputType
        })
      });
      if (response.ok) {
        const res = await response.json();
        saveSuccess = true;
        saveMessage = res.message || "Saved successfully!";
        newId = "";
        newName = "";
        newRule = "";
        newTags = "";
        newStatus = "planned";
        newInputType = "shape";
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const text = await response.text();
        saveSuccess = false;
        saveMessage = `Error: ${text}`;
      }
    } catch (err: any) {
      saveSuccess = false;
      saveMessage = `Error: ${err.message}`;
    } finally {
      isSaving = false;
    }
  }
</script>

<svelte:head>
  <meta name="theme-color" content="#132a3a" />
</svelte:head>

<header class="site-header">
  <a class="brand" href="./">Back to editor</a>
  <nav aria-label="Reference pages">
    <a
      class:active={page === "variants" || page === "detail"}
      href="./list">Variant wiki</a
    >
  </nav>
</header>

<main>
  {#if page === "detail"}
    {#if detailVariation}
      <article class="variant-detail">
        <a class="back-link" href="./list"
          >Back to list of variants</a
        >
        <h1>{detailVariation.name}</h1>
        <div class="detail-status">
          {#if detailVariation.status === "available"}
            <span class="status implemented">CSP implemented</span>
          {:else}
            <span
              class:backlog={detailVariation.status === "planned"}
              class:infeasible={detailVariation.status === "infeasible"}
              class="status"
            >
              {detailVariation.status === "infeasible" ? "Infeasible" : "CSP backlog"}
            </span>
          {/if}
        </div>
        <section>
          <h2>Rules</h2>
          {#each Object.entries(detailVariation.rules) as [size, rule]}
            <div class="rule-card">
              <strong>{size}</strong>
              <p>{rule}</p>
            </div>
          {/each}
        </section>
        <section>
          <h2>Input modes</h2>
          <ul>
            {#each inputModesFor(detailVariation) as mode}<li>{mode}</li>{/each}
          </ul>
        </section>
        <section>
          <h2>CSP constraint function</h2>
          <p>{cspApproachFor(detailVariation)}</p>
          <pre><code>{cspConstraintFunctionFor(detailVariation)}</code></pre>
          {#if detailVariation.status !== "available"}<p class="blocker">
              {automaticBlockerFor(detailVariation)}
            </p>{/if}
        </section>
        <section>
          <h2>Solver regression tests</h2>
          <p>
            The valid case must solve; the paired violation must be rejected.
          </p>
          <pre><code>{solverTestCasesFor(detailVariation)}</code></pre>
        </section>
      </article>
    {:else}
      <section class="hero">
        <h1>Variant not found</h1>
        <p><a href="./list">Return to the variant wiki.</a></p>
      </section>
    {/if}
  {:else}
    <section class="hero">
      <h1>Sudoku Variant Reference</h1>
      <p>
        Rules derived from <a
          href="https://logic-puzzles.ropeko.ch/php/db/search.php">ropeko</a
        >. Refer to the original website for example puzzles and more!.
      </p>
      <div class="summary" aria-label="Catalog summary">
        <span><strong>{variations.length}</strong> variants</span>
        <span
          ><strong
            >{variations.filter((item) => item.status === "available")
              .length}</strong
          > Solver available</span
        >
        <span
          ><strong
            >{variations.filter(
              (item) => item.status === "planned",
            ).length}</strong
          > Planned
        </span>
        <span
          ><strong
            >{variations.filter(
              (item) => item.status === "infeasible",
            ).length}</strong
          > Infeasible
        </span>
      </div>
    </section>

    <section class="toolbar" aria-label="Variant table filters">
      <label for="variant-search-input">
        <span>Search variants</span>
        <input
          id="variant-search-input"
          bind:value={query}
          type="search"
          placeholder="Name, rule, tag…"
        />
      </label>
      <label for="variant-csp-status-select">
        <span>Status</span>
        <select id="variant-csp-status-select" bind:value={status}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="planned">Planned</option>
          <option value="infeasible">Infeasible</option>
        </select>
      </label>
      <label for="variant-tag-select">
        <span>Tag</span>
        <select id="variant-tag-select" bind:value={tag}>
          <option value="all">All</option>
          {#each availableTags as availableTag}
            <option value={availableTag}>{availableTag}</option>
          {/each}
        </select>
      </label>
      <span class="result-count">{filteredVariations.length} shown</span>
    </section>

    <div class="table-wrap">
      <table class="variant-table">
        <thead>
          <tr>
            <th>Variant</th>
            <th>Rule</th>
            <th>Status</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredVariations as variation (variation.value)}
            <tr>
              <th scope="row"
                ><a
                  class="variant-link"
                  href={`./list?id=${encodeURIComponent(variation.value)}`}
                  ><strong>{variation.name}</strong></a
                ><code>{variation.value}</code></th
              >
              <td class="rule">{variation.rule}</td>
              <td>
                {#if variation.status === "available"}
                  <span class="status implemented">Available</span>
                {:else}
                  <span
                    class:backlog={variation.status === "planned"}
                    class:infeasible={variation.status === "infeasible"}
                    class="status"
                  >
                    {variation.status === "infeasible" ? "Infeasible" : "Planned"}
                  </span>
                {/if}
              </td>
              <td class="tags">
                {#each variation.tags as variantTag}
                  <button type="button" class="tag" on:click={() => (tag = variantTag)}>{variantTag}</button>
                {/each}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if import.meta.env.DEV}
    <section class="dev-form-card">
      <h2>Developer Options: Add New Variant</h2>
      <p class="dev-form-desc">This form is only visible in development mode. Submitting it adds the variant to <code>variant_metadata.json</code>.</p>
      <form on:submit|preventDefault={handleAddVariant}>
        <div class="form-row">
          <div class="form-group">
            <label for="new-variant-id">Variant ID (alphanumeric, lowercase)</label>
            <input
              id="new-variant-id"
              type="text"
              bind:value={newId}
              placeholder="e.g. bouncingxsums"
              required
            />
            {#if newId}
              <span class="preview-filename">Entry: <code>variant_metadata.json → {newId.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}</code></span>
            {/if}
          </div>
          <div class="form-group">
            <label for="new-variant-name">Display Name</label>
            <input
              id="new-variant-name"
              type="text"
              bind:value={newName}
              placeholder="e.g. Bouncing X-Sums"
              required
            />
          </div>
        </div>
        <div class="form-group">
          <label for="new-variant-rule">Rule Description (9x9)</label>
          <textarea
            id="new-variant-rule"
            bind:value={newRule}
            placeholder="Standard sudoku rules apply. Outside clues indicate..."
            rows="3"
            required
          ></textarea>
        </div>
        <div class="form-group">
          <label for="new-variant-tags">Tags (comma-separated)</label>
          <input
            id="new-variant-tags"
            type="text"
            bind:value={newTags}
            placeholder="outside, math, diagonal"
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="new-variant-status">Status</label>
            <select id="new-variant-status" bind:value={newStatus}>
              <option value="available">Available</option>
              <option value="planned">Planned</option>
              <option value="infeasible">Infeasible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div class="form-group">
            <label for="new-variant-input-type">Input type</label>
            <select id="new-variant-input-type" bind:value={newInputType}>
              <option value="no-input">No input</option>
              <option value="line">Line</option>
              <option value="region">Region</option>
              <option value="outside">Outside</option>
              <option value="shape">Shape</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" disabled={isSaving}>
            {#if isSaving}Saving...{:else}Save & Create JSON{/if}
          </button>
        </div>
        {#if saveMessage}
          <div class="save-status {saveSuccess ? 'success' : 'error'}">
            {saveMessage}
          </div>
        {/if}
      </form>
    </section>
  {/if}
</main>

<footer>Generated from the repository variation catalog.</footer>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(html) {
    color: #1b2c38;
    background: #edf2f3;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }
  :global(body) {
    margin: 0;
  }
  :global(button),
  :global(input),
  :global(select) {
    font: inherit;
  }
  .site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 64px;
    padding: 0 max(24px, calc((100vw - 1480px) / 2));
    color: #eaf3f5;
    background: #132a3a;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  .brand {
    color: inherit;
    font-size: 15px;
    font-weight: 760;
    letter-spacing: 0.02em;
    text-decoration: none;
  }
  .brand span {
    color: #e5b858;
  }
  nav {
    display: flex;
    align-self: stretch;
  }
  nav a {
    display: grid;
    place-items: center;
    padding: 0 16px;
    color: #bcd0d8;
    border-bottom: 3px solid transparent;
    font-size: 13px;
    text-decoration: none;
  }
  nav a:hover,
  nav a.active {
    color: #fff;
    border-bottom-color: #e5b858;
  }
  main {
    width: min(1480px, calc(100% - 40px));
    margin: 0 auto;
    padding: 44px 0 64px;
  }
  .hero {
    max-width: 900px;
    margin-bottom: 30px;
  }
  .eyebrow {
    margin: 0 0 8px;
    color: #b16c24;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  h1 {
    margin: 0;
    color: #102938;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(38px, 6vw, 68px);
    font-weight: 500;
    letter-spacing: -0.035em;
  }
  .hero > p:last-of-type {
    max-width: 760px;
    margin: 14px 0 0;
    color: #526773;
    font-size: 18px;
    line-height: 1.55;
  }
  .summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 24px;
  }
  .summary span {
    padding: 9px 13px;
    color: #4b616c;
    border: 1px solid #ccdadc;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.6);
    font-size: 12px;
  }
  .summary strong {
    margin-right: 4px;
    color: #183a4d;
    font-size: 15px;
  }
  .notes {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    margin: 0 0 20px;
  }
  .notes > div {
    padding: 18px 20px;
    border-left: 3px solid #268096;
    background: #fff;
    box-shadow: 0 8px 25px rgba(27, 52, 63, 0.05);
  }
  .notes h2 {
    margin: 0 0 6px;
    color: #183a4d;
    font-size: 15px;
  }
  .notes p {
    margin: 0;
    color: #5a6e77;
    font-size: 13px;
    line-height: 1.55;
  }
  .toolbar {
    position: sticky;
    top: 64px;
    z-index: 15;
    display: flex;
    align-items: end;
    gap: 12px;
    padding: 13px 15px;
    border: 1px solid #cbd8da;
    background: rgba(247, 250, 250, 0.95);
    box-shadow: 0 5px 18px rgba(27, 52, 63, 0.08);
    backdrop-filter: blur(9px);
  }
  label {
    display: grid;
    gap: 5px;
    color: #536872;
    font-size: 11px;
    font-weight: 750;
  }
  input,
  select {
    min-height: 36px;
    padding: 7px 9px;
    color: #203642;
    border: 1px solid #b9cbcf;
    border-radius: 3px;
    background: #fff;
  }
  input {
    width: min(360px, 42vw);
  }
  input:focus,
  select:focus {
    border-color: #267f95;
    outline: 3px solid rgba(38, 127, 149, 0.15);
  }
  .result-count {
    margin: 0 auto 9px 0;
    color: #657982;
    font-size: 12px;
  }
  .table-wrap {
    width: 100%;
    overflow: auto;
    border: 1px solid #c7d4d6;
    border-top: 0;
    background: #fff;
    box-shadow: 0 12px 34px rgba(27, 52, 63, 0.08);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    line-height: 1.45;
  }
  th,
  td {
    padding: 11px 12px;
    border-right: 1px solid #e0e7e8;
    border-bottom: 1px solid #dbe4e5;
    text-align: left;
    vertical-align: top;
  }
  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    color: #e9f3f5;
    background: #1d4658;
    font-size: 10px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  tbody th {
    min-width: 165px;
    color: #173a4a;
    background: #f8fafa;
  }
  tbody tr:hover td,
  tbody tr:hover th {
    background-color: #f1f7f7;
  }
  td.rule {
    min-width: 320px;
    max-width: 520px;
    color: #465d68;
  }
  td.tags {
    min-width: 150px;
  }
  .tag {
    margin: 0 4px 4px 0;
    padding: 3px 7px;
    border: 1px solid #b9cbcf;
    border-radius: 999px;
    color: #315968;
    background: #edf5f6;
    font-size: 10px;
    cursor: pointer;
  }
  .tag:hover {
    border-color: #267f95;
    background: #dceff2;
  }
  td.approach {
    min-width: 260px;
    color: #516871;
  }
  code {
    display: block;
    margin-top: 4px;
    color: #75878e;
    font-family: "SFMono-Regular", Consolas, monospace;
    font-size: 10px;
    font-weight: 500;
  }
  .status {
    display: inline-flex;
    align-items: center;
    width: max-content;
    padding: 3px 7px;
    border-radius: 999px;
    white-space: nowrap;
    font-size: 10px;
    font-weight: 750;
  }
  .status.implemented {
    color: #176245;
    background: #dff2e9;
  }
  .status.backlog {
    color: #8c4e1e;
    background: #f8e8d8;
  }
  .status.infeasible {
    color: #602d30;
    background: #fde8e9;
  }
  .variant-link {
    color: inherit;
    text-decoration-color: #9bb7bf;
    text-underline-offset: 3px;
  }
  .variant-detail {
    width: min(920px, 100%);
  }
  .variant-detail .back-link {
    display: inline-block;
    margin-bottom: 24px;
    color: #267f95;
    font-size: 13px;
  }
  .variant-detail h2 {
    margin: 0 0 12px;
    color: #183a4d;
    font-size: 18px;
  }
  .variant-detail > section {
    margin-top: 22px;
    padding: 22px;
    border: 1px solid #cfdbdd;
    background: #fff;
    box-shadow: 0 8px 25px rgba(27, 52, 63, 0.05);
  }
  .detail-status {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 18px;
  }
  .rule-card {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 14px;
    padding: 12px 0;
    border-top: 1px solid #e0e7e8;
  }
  .rule-card:first-of-type {
    border-top: 0;
  }
  .rule-card p,
  .variant-detail section > p {
    margin: 0;
    color: #526773;
    line-height: 1.6;
  }
  .variant-detail ul {
    margin: 0;
    padding-left: 20px;
    color: #526773;
    line-height: 1.8;
  }
  .variant-detail pre {
    margin: 14px 0 0;
    padding: 16px;
    overflow: auto;
    border-radius: 4px;
    color: #eaf3f5;
    background: #132a3a;
  }
  .variant-detail pre code {
    display: inline;
    margin: 0;
    color: inherit;
    font-size: 12px;
    line-height: 1.6;
  }
  .variant-detail .blocker {
    margin-top: 14px;
    padding: 12px;
    color: #8c4e1e;
    background: #fff4e9;
  }
  footer {
    padding: 24px;
    color: #708088;
    background: #dde7e8;
    text-align: center;
    font-size: 11px;
  }
  @media (max-width: 900px) {
    .site-header {
      position: static;
      align-items: flex-start;
      padding: 16px 20px;
    }
    nav {
      flex-wrap: wrap;
    }
    nav a {
      min-height: 32px;
      padding: 0 9px;
    }
    main {
      width: min(100% - 24px, 1480px);
      padding-top: 30px;
    }
    .toolbar {
      top: 0;
      flex-wrap: wrap;
      align-items: end;
    }
    .result-count {
      margin-left: 0;
    }
  }
  @media (max-width: 560px) {
    .site-header {
      display: grid;
    }
    .hero > p:last-of-type {
      font-size: 16px;
    }
    input {
      width: 100%;
    }
    .toolbar label:first-child {
      width: 100%;
    }
  }

  /* Dark Mode styles matching homepage */
  :global(html.dark) {
    color: #dde6ed !important;
    background: #17202a !important;
  }
  :global(html.dark) .site-header {
    background: #111a24 !important;
    border-bottom: 1px solid #1c2836 !important;
  }
  :global(html.dark) h1 {
    color: #eef4f8 !important;
  }
  :global(html.dark) .hero > p:last-of-type {
    color: #aebdca !important;
  }
  :global(html.dark) .summary span {
    color: #dde6ed !important;
    border-color: #40505f !important;
    background: #263340 !important;
  }
  :global(html.dark) .summary strong {
    color: #e5b858 !important;
  }
  :global(html.dark) .notes > div {
    border-left-color: #176fae !important;
    background: #263340 !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
  }
  :global(html.dark) .notes h2 {
    color: #dde6ed !important;
  }
  :global(html.dark) .notes p {
    color: #aebdca !important;
  }
  :global(html.dark) .toolbar {
    border-color: #40505f !important;
    background: rgba(38, 51, 64, 0.95) !important;
    box-shadow: 0 5px 18px rgba(0, 0, 0, 0.25) !important;
  }
  :global(html.dark) label {
    color: #aebdca !important;
  }
  :global(html.dark) input,
  :global(html.dark) select {
    color: #d5dfe7 !important;
    border-color: #465563 !important;
    background: #1f2b35 !important;
  }
  :global(html.dark) input:focus,
  :global(html.dark) select:focus {
    border-color: #176fae !important;
    outline: 3px solid rgba(23, 111, 174, 0.15) !important;
  }
  :global(html.dark) .result-count {
    color: #8c9ba5 !important;
  }
  :global(html.dark) .table-wrap {
    border-color: #40505f !important;
    background: #263340 !important;
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.3) !important;
  }
  :global(html.dark) th,
  :global(html.dark) td {
    border-right-color: #40505f !important;
    border-bottom-color: #3b4b5a !important;
  }
  :global(html.dark) thead th {
    color: #eef4f8 !important;
    background: #1b2630 !important;
  }
  :global(html.dark) tbody th {
    color: #dde6ed !important;
    background: #232f3b !important;
  }
  :global(html.dark) tbody tr:hover td,
  :global(html.dark) tbody tr:hover th {
    background-color: #2b3a4a !important;
  }
  :global(html.dark) td.rule {
    color: #dde6ed !important;
  }
  :global(html.dark) td.approach {
    color: #aebdca !important;
  }
  :global(html.dark) code {
    color: #8c9ba5 !important;
  }
  :global(html.dark) .variant-link {
    color: #2b8bc7 !important;
  }
  :global(html.dark) .variant-detail h2 {
    color: #dde6ed !important;
  }
  :global(html.dark) .variant-detail > section {
    border-color: #40505f !important;
    background: #263340 !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
  }
  :global(html.dark) .rule-card {
    border-top-color: #40505f !important;
  }
  :global(html.dark) .rule-card p,
  :global(html.dark) .variant-detail section > p {
    color: #dde6ed !important;
  }
  :global(html.dark) .variant-detail ul {
    color: #dde6ed !important;
  }
  :global(html.dark) .variant-detail pre {
    background: #111a24 !important;
  }
  :global(html.dark) .variant-detail .blocker {
    color: #ffb4b4 !important;
    background: #542f35 !important;
  }
  :global(html.dark) footer {
    color: #8c9ba5 !important;
    background: #1b2630 !important;
  }
  :global(html.dark) .back-link {
    color: #2b8bc7 !important;
  }
  .dev-form-card {
    margin-top: 40px;
    padding: 24px;
    border: 1px solid #cbd8da;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 246, 248, 0.9));
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
  }
  :global(html.dark) .dev-form-card {
    border-color: #40505f;
    background: linear-gradient(135deg, rgba(38, 51, 64, 0.9), rgba(28, 38, 48, 0.9));
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
  .dev-form-card h2 {
    margin: 0 0 8px;
    color: #102938;
    font-size: 20px;
    font-family: Georgia, serif;
  }
  :global(html.dark) .dev-form-card h2 {
    color: #eef4f8;
  }
  .dev-form-desc {
    margin: 0 0 20px;
    color: #526773;
    font-size: 13px;
  }
  :global(html.dark) .dev-form-desc {
    color: #aebdca;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  .form-group label {
    color: #3b4d58;
    font-size: 12px;
    font-weight: 600;
  }
  :global(html.dark) .form-group label {
    color: #d5dfe7;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 10px 12px;
    border: 1px solid #cbd8da;
    border-radius: 4px;
    font-size: 14px;
  }
  :global(html.dark) .form-group input,
  :global(html.dark) .form-group select,
  :global(html.dark) .form-group textarea {
    border-color: #465563;
    background: #1f2b35;
    color: #d5dfe7;
  }
  .preview-filename {
    font-size: 11px;
    color: #267f95;
    margin-top: 4px;
  }
  :global(html.dark) .preview-filename {
    color: #e5b858;
  }
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }
  .form-actions button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background: #267f95;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }
  .form-actions button:hover:not(:disabled) {
    background: #1d6375;
    transform: translateY(-1px);
  }
  .form-actions button:active:not(:disabled) {
    transform: translateY(0);
  }
  .form-actions button:disabled {
    background: #b9cbcf;
    cursor: not-allowed;
  }
  :global(html.dark) .form-actions button {
    background: #e5b858;
    color: #17202a;
  }
  :global(html.dark) .form-actions button:hover:not(:disabled) {
    background: #cca043;
  }
  .save-status {
    margin-top: 16px;
    padding: 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
  }
  .save-status.success {
    background: #dff2e9;
    color: #176245;
  }
  .save-status.error {
    background: #fde8e9;
    color: #602d30;
  }
</style>
