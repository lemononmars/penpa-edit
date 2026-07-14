<script lang="ts">
    import { onMount } from "svelte";
    import { cspSupportedVariants, variations } from "./variationCatalog";
    import {
        automaticBlockerFor, bundledMarkConfig, cspApproachFor, cspConstraintFunctionFor,
        inputModesFor, markChoiceFor, penpaMarks, positions, solverTestCasesFor,
        type MarkConfig, type MarkPosition, type VariantMarkChoice
    } from "./variantMarks";

    export let page: "variants" | "marks" | "detail" = "variants";

    const isDev = import.meta.env.DEV;
    let query = "";
    let status = "all";
    let config: MarkConfig = {
        version: bundledMarkConfig.version,
        overrides: { ...bundledMarkConfig.overrides }
    };
    let saveState: "idle" | "saving" | "saved" | "error" = "idle";
    let saveMessage = "";
    const detailId = document.body.dataset.variantId || new URLSearchParams(window.location.search).get("id") || "classic";
    const detailVariation = variations.find((variation) => variation.value === detailId);

    $: normalizedQuery = query.trim().toLowerCase();
    $: filteredVariations = variations.filter((variation) => {
        const supported = cspSupportedVariants.has(variation.value);
        const matchesStatus = status === "all" || (status === "implemented" ? supported : !supported);
        const choice = markChoiceFor(variation, config);
        const mark = penpaMarks.find((item) => item.id === choice.mark);
        return matchesStatus && (!normalizedQuery || [
            variation.name, variation.value, variation.rule, mark?.name || "", choice.position
        ].some((value) => value.toLowerCase().includes(normalizedQuery)));
    });
    $: filteredMarks = penpaMarks.filter((mark) => !normalizedQuery || [
        mark.name, mark.family, mark.penpaMode, mark.description, ...mark.positions
    ].some((value) => value.toLowerCase().includes(normalizedQuery)));

    onMount(async () => {
        if (!isDev || page !== "variants") return;
        try {
            const response = await fetch("/__variant-marks");
            if (response.ok) config = await response.json();
        } catch {
            saveState = "error";
            saveMessage = "The dev mark configuration could not be loaded.";
        }
    });

    function markName(markId: string) {
        return penpaMarks.find((mark) => mark.id === markId)?.name || markId;
    }

    function positionName(positionId: MarkPosition) {
        return positions.find((position) => position.id === positionId)?.name || positionId;
    }

    function setChoice(variant: string, field: keyof VariantMarkChoice, value: string) {
        const variation = variations.find((item) => item.value === variant);
        if (!variation) return;
        const current = markChoiceFor(variation, config);
        const next = { ...current, [field]: value } as VariantMarkChoice;
        if (field === "position" && value === "multiple") next.mark = "multiple";
        if (field === "mark" && value === "multiple") next.position = "multiple";
        config = { ...config, overrides: { ...config.overrides, [variant]: next } };
        saveState = "idle";
    }

    function resetChoice(variant: string) {
        const overrides = { ...config.overrides };
        delete overrides[variant];
        config = { ...config, overrides };
        saveState = "idle";
    }

    async function saveConfig() {
        if (!isDev) return;
        saveState = "saving";
        saveMessage = "";
        try {
            const response = await fetch("/__variant-marks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            if (!response.ok) throw new Error(await response.text());
            saveState = "saved";
            saveMessage = `${Object.keys(config.overrides).length} explicit variant mappings saved.`;
        } catch (error) {
            saveState = "error";
            saveMessage = error instanceof Error ? error.message : "The mark configuration could not be saved.";
        }
    }
</script>

<svelte:head>
    <meta name="theme-color" content="#132a3a" />
</svelte:head>

<header class="site-header">
    <a class="brand" href="./">Penpa<span>+</span> reference</a>
    <nav aria-label="Reference pages">
        <a class:active={page === "variants" || page === "detail"} href="./variant-wiki.html">Variant wiki</a>
        <a class:active={page === "marks"} href="./marks.html">Marks & positions</a>
        <a href="./">Puzzle editor</a>
    </nav>
</header>

<main>
    {#if page === "detail"}
        {#if detailVariation}
            {@const choice = markChoiceFor(detailVariation, config)}
            <article class="variant-detail">
                <a class="back-link" href="./variant-wiki.html">← All variants</a>
                <p class="eyebrow">Variant reference</p>
                <h1>{detailVariation.name}</h1>
                <div class="detail-status">
                    <span class:implemented={detailVariation.cspSupported} class:backlog={!detailVariation.cspSupported} class="status">
                        {detailVariation.cspSupported ? "CSP implemented" : "CSP backlog"}
                    </span>
                    <span class="pill position">{positionName(choice.position)}</span>
                    <span class="pill">{markName(choice.mark)}</span>
                </div>
                <section>
                    <h2>Rules</h2>
                    {#each Object.entries(detailVariation.rules) as [size, rule]}
                        <div class="rule-card"><strong>{size}</strong><p>{rule}</p></div>
                    {/each}
                </section>
                <section>
                    <h2>Input modes</h2>
                    <ul>{#each inputModesFor(detailVariation) as mode}<li>{mode}</li>{/each}</ul>
                </section>
                <section>
                    <h2>CSP constraint function</h2>
                    <p>{cspApproachFor(detailVariation)}</p>
                    <pre><code>{cspConstraintFunctionFor(detailVariation)}</code></pre>
                    {#if !detailVariation.cspSupported}<p class="blocker">{automaticBlockerFor(detailVariation)}</p>{/if}
                </section>
                <section>
                    <h2>Solver regression tests</h2>
                    <p>The valid case must solve; the paired violation must be rejected.</p>
                    <pre><code>{solverTestCasesFor(detailVariation)}</code></pre>
                </section>
            </article>
        {:else}
            <section class="hero"><h1>Variant not found</h1><p><a href="./variant-wiki.html">Return to the variant wiki.</a></p></section>
        {/if}
    {:else if page === "variants"}
        <section class="hero">
            <p class="eyebrow">Sudoku systems reference</p>
            <h1>Variant wiki</h1>
            <p>Rules, clue placement, Penpa mark mapping, and CSP implementation notes for every variant in the catalog.</p>
            <div class="summary" aria-label="Catalog summary">
                <span><strong>{variations.length}</strong> variants</span>
                <span><strong>{variations.filter((item) => cspSupportedVariants.has(item.value)).length}</strong> CSP implemented</span>
                <span><strong>{variations.filter((item) => !cspSupportedVariants.has(item.value)).length}</strong> backlog</span>
            </div>
        </section>

        <section class="notes" aria-labelledby="implementation-heading">
            <div>
                <h2 id="implementation-heading">CSP implementation contract</h2>
                <p>“Implemented” means the variant is registered with the current solver. Backlog rows document the intended constraint shape, not a claim that solving is complete. Every implementation must validate partial boards and reject invalid givens before search.</p>
            </div>
            {#if isDev}
                <div class="dev-card">
                    <strong>Development editor</strong>
                    <span>Changes below write to <code>variations/_markConfig.json</code> and become the public mapping after the next build.</span>
                </div>
            {/if}
        </section>

        <section class="toolbar" aria-label="Variant table filters">
            <label>
                <span>Search variants</span>
                <input bind:value={query} type="search" placeholder="Name, rule, mark…" />
            </label>
            <label>
                <span>CSP status</span>
                <select bind:value={status}>
                    <option value="all">All statuses</option>
                    <option value="implemented">Implemented</option>
                    <option value="backlog">Backlog</option>
                </select>
            </label>
            <span class="result-count">{filteredVariations.length} shown</span>
            {#if isDev}
                <button class="save" on:click={saveConfig} disabled={saveState === "saving"}>
                    {saveState === "saving" ? "Saving…" : "Save mark table"}
                </button>
            {/if}
        </section>
        {#if saveMessage}<p class:error={saveState === "error"} class="save-message">{saveMessage}</p>{/if}

        <div class="table-wrap">
            <table class="variant-table">
                <thead>
                    <tr>
                        <th>Variant</th>
                        <th>Rule</th>
                        <th>Placement</th>
                        <th>Penpa mark</th>
                        <th>CSP</th>
                        <th>Implementation</th>
                        <th>Automatic blocker</th>
                        {#if isDev}<th><span class="sr-only">Reset mapping</span></th>{/if}
                    </tr>
                </thead>
                <tbody>
                    {#each filteredVariations as variation (variation.value)}
                        {@const choice = markChoiceFor(variation, config)}
                        {@const implemented = cspSupportedVariants.has(variation.value)}
                        <tr class:overridden={Boolean(config.overrides[variation.value])}>
                            <th scope="row"><a class="variant-link" href={`./variant.html?id=${encodeURIComponent(variation.value)}`}><strong>{variation.name}</strong></a><code>{variation.value}</code></th>
                            <td class="rule">{variation.rule}</td>
                            <td>
                                {#if isDev}
                                    <select aria-label={`Placement for ${variation.name}`} value={choice.position}
                                        on:change={(event) => setChoice(variation.value, "position", event.currentTarget.value)}>
                                        {#each positions as position}<option value={position.id}>{position.name}</option>{/each}
                                    </select>
                                {:else}<span class="pill position">{positionName(choice.position)}</span>{/if}
                            </td>
                            <td>
                                {#if isDev}
                                    <select aria-label={`Penpa mark for ${variation.name}`} value={choice.mark}
                                        on:change={(event) => setChoice(variation.value, "mark", event.currentTarget.value)}>
                                        {#each penpaMarks as mark}<option value={mark.id}>{mark.name}</option>{/each}
                                    </select>
                                {:else}{markName(choice.mark)}{/if}
                            </td>
                            <td><span class:implemented class:backlog={!implemented} class="status">{implemented ? "Implemented" : "Backlog"}</span></td>
                            <td class="approach">{cspApproachFor(variation)}</td>
                            <td class="approach">{implemented ? "—" : automaticBlockerFor(variation)}</td>
                            {#if isDev}
                                <td><button class="reset" disabled={!config.overrides[variation.value]} on:click={() => resetChoice(variation.value)}>Reset</button></td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <section class="hero marks-hero">
            <p class="eyebrow">Public Penpa reference</p>
            <h1>Marks & positions</h1>
            <p>The drawable primitives used by Sudoku variants, their Penpa tool names, and the clue positions they support.</p>
        </section>
        <section class="position-grid" aria-label="Placement definitions">
            {#each positions as position}
                <article><strong>{position.name}</strong><p>{position.description}</p></article>
            {/each}
        </section>
        <section class="toolbar marks-toolbar">
            <label>
                <span>Search marks</span>
                <input bind:value={query} type="search" placeholder="Circle, edge, special…" />
            </label>
            <span class="result-count">{filteredMarks.length} shown</span>
        </section>
        <div class="table-wrap">
            <table>
                <thead><tr><th>Mark</th><th>Family</th><th>Penpa tool</th><th>Supported positions</th><th>Use</th></tr></thead>
                <tbody>
                    {#each filteredMarks as mark (mark.id)}
                        <tr>
                            <th scope="row">{mark.name}</th>
                            <td>{mark.family}</td>
                            <td><code>{mark.penpaMode}</code></td>
                            <td><div class="pills">{#each mark.positions as position}<span class="pill position">{positionName(position)}</span>{/each}</div></td>
                            <td>{mark.description}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</main>

<footer>Generated from the repository variation catalog and shared mark configuration.</footer>

<style>
    :global(*) { box-sizing: border-box; }
    :global(html) { color: #1b2c38; background: #edf2f3; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    :global(body) { margin: 0; }
    :global(button), :global(input), :global(select) { font: inherit; }
    .site-header { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 64px; padding: 0 max(24px, calc((100vw - 1480px) / 2)); color: #eaf3f5; background: #132a3a; box-shadow: 0 1px 0 rgba(255,255,255,.08); }
    .brand { color: inherit; font-size: 15px; font-weight: 760; letter-spacing: .02em; text-decoration: none; }
    .brand span { color: #e5b858; }
    nav { display: flex; align-self: stretch; }
    nav a { display: grid; place-items: center; padding: 0 16px; color: #bcd0d8; border-bottom: 3px solid transparent; font-size: 13px; text-decoration: none; }
    nav a:hover, nav a.active { color: #fff; border-bottom-color: #e5b858; }
    main { width: min(1480px, calc(100% - 40px)); margin: 0 auto; padding: 44px 0 64px; }
    .hero { max-width: 900px; margin-bottom: 30px; }
    .eyebrow { margin: 0 0 8px; color: #b16c24; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    h1 { margin: 0; color: #102938; font-family: Georgia, "Times New Roman", serif; font-size: clamp(38px, 6vw, 68px); font-weight: 500; letter-spacing: -.035em; }
    .hero > p:last-of-type { max-width: 760px; margin: 14px 0 0; color: #526773; font-size: 18px; line-height: 1.55; }
    .summary { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
    .summary span { padding: 9px 13px; color: #4b616c; border: 1px solid #ccdadc; border-radius: 4px; background: rgba(255,255,255,.6); font-size: 12px; }
    .summary strong { margin-right: 4px; color: #183a4d; font-size: 15px; }
    .notes { display: grid; grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr); gap: 18px; margin: 0 0 20px; }
    .notes > div { padding: 18px 20px; border-left: 3px solid #268096; background: #fff; box-shadow: 0 8px 25px rgba(27,52,63,.05); }
    .notes h2 { margin: 0 0 6px; color: #183a4d; font-size: 15px; }
    .notes p, .dev-card span { margin: 0; color: #5a6e77; font-size: 13px; line-height: 1.55; }
    .dev-card { display: grid; align-content: center; gap: 5px; border-left-color: #d28a37 !important; }
    .toolbar { position: sticky; top: 64px; z-index: 15; display: flex; align-items: end; gap: 12px; padding: 13px 15px; border: 1px solid #cbd8da; background: rgba(247,250,250,.95); box-shadow: 0 5px 18px rgba(27,52,63,.08); backdrop-filter: blur(9px); }
    label { display: grid; gap: 5px; color: #536872; font-size: 11px; font-weight: 750; }
    input, select { min-height: 36px; padding: 7px 9px; color: #203642; border: 1px solid #b9cbcf; border-radius: 3px; background: #fff; }
    input { width: min(360px, 42vw); }
    input:focus, select:focus, button:focus-visible { border-color: #267f95; outline: 3px solid rgba(38,127,149,.15); }
    .result-count { margin: 0 auto 9px 0; color: #657982; font-size: 12px; }
    button { min-height: 36px; padding: 7px 11px; border: 1px solid #b8c8cb; border-radius: 3px; color: #244653; background: #fff; cursor: pointer; }
    button:disabled { cursor: default; opacity: .45; }
    .save { color: #fff; border-color: #206d80; background: #206d80; font-weight: 750; }
    .save-message { margin: 9px 0 0; color: #247251; font-size: 12px; }
    .save-message.error { color: #a7433f; }
    .table-wrap { width: 100%; overflow: auto; border: 1px solid #c7d4d6; border-top: 0; background: #fff; box-shadow: 0 12px 34px rgba(27,52,63,.08); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.45; }
    th, td { padding: 11px 12px; border-right: 1px solid #e0e7e8; border-bottom: 1px solid #dbe4e5; text-align: left; vertical-align: top; }
    thead th { position: sticky; top: 0; z-index: 2; color: #e9f3f5; background: #1d4658; font-size: 10px; letter-spacing: .07em; text-transform: uppercase; }
    tbody th { min-width: 165px; color: #173a4a; background: #f8fafa; }
    tbody tr:hover td, tbody tr:hover th { background-color: #f1f7f7; }
    tbody tr.overridden th:first-child { box-shadow: inset 3px 0 #d28a37; }
    td.rule { min-width: 320px; max-width: 520px; color: #465d68; }
    td.approach { min-width: 260px; color: #516871; }
    td select { width: 100%; min-width: 145px; font-size: 11px; }
    code { display: block; margin-top: 4px; color: #75878e; font-family: "SFMono-Regular", Consolas, monospace; font-size: 10px; font-weight: 500; }
    .status, .pill { display: inline-flex; align-items: center; width: max-content; padding: 3px 7px; border-radius: 999px; white-space: nowrap; font-size: 10px; font-weight: 750; }
    .status.implemented { color: #176245; background: #dff2e9; }
    .status.backlog { color: #8c4e1e; background: #f8e8d8; }
    .pill.position { color: #315967; background: #e3eff1; }
    .pills { display: flex; flex-wrap: wrap; gap: 4px; }
    .reset { min-height: 30px; padding: 4px 7px; font-size: 10px; }
    .variant-link { color: inherit; text-decoration-color: #9bb7bf; text-underline-offset: 3px; }
    .variant-detail { width: min(920px, 100%); }
    .variant-detail .back-link { display: inline-block; margin-bottom: 24px; color: #267f95; font-size: 13px; }
    .variant-detail h2 { margin: 0 0 12px; color: #183a4d; font-size: 18px; }
    .variant-detail > section { margin-top: 22px; padding: 22px; border: 1px solid #cfdbdd; background: #fff; box-shadow: 0 8px 25px rgba(27,52,63,.05); }
    .detail-status { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
    .rule-card { display: grid; grid-template-columns: 72px 1fr; gap: 14px; padding: 12px 0; border-top: 1px solid #e0e7e8; }
    .rule-card:first-of-type { border-top: 0; }
    .rule-card p, .variant-detail section > p { margin: 0; color: #526773; line-height: 1.6; }
    .variant-detail ul { margin: 0; padding-left: 20px; color: #526773; line-height: 1.8; }
    .variant-detail pre { margin: 14px 0 0; padding: 16px; overflow: auto; border-radius: 4px; color: #eaf3f5; background: #132a3a; }
    .variant-detail pre code { display: inline; margin: 0; color: inherit; font-size: 12px; line-height: 1.6; }
    .variant-detail .blocker { margin-top: 14px; padding: 12px; color: #8c4e1e; background: #fff4e9; }
    .position-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .position-grid article { padding: 16px; border: 1px solid #cfdbdd; background: rgba(255,255,255,.72); }
    .position-grid strong { color: #193f50; font-size: 13px; }
    .position-grid p { margin: 6px 0 0; color: #60747d; font-size: 12px; line-height: 1.45; }
    .marks-toolbar { position: static; }
    footer { padding: 24px; color: #708088; background: #dde7e8; text-align: center; font-size: 11px; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    @media (max-width: 900px) {
        .site-header { position: static; align-items: flex-start; padding: 16px 20px; }
        nav { flex-wrap: wrap; }
        nav a { min-height: 32px; padding: 0 9px; }
        main { width: min(100% - 24px, 1480px); padding-top: 30px; }
        .notes { grid-template-columns: 1fr; }
        .toolbar { top: 0; flex-wrap: wrap; align-items: end; }
        .result-count { margin-left: 0; }
        .position-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
        .site-header { display: grid; }
        .hero > p:last-of-type { font-size: 16px; }
        input { width: 100%; }
        .toolbar label:first-child { width: 100%; }
        .position-grid { grid-template-columns: 1fr; }
    }
</style>
