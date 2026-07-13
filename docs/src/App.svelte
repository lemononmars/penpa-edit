<script lang="ts">
    import { onMount } from "svelte";
    import { guideFor } from "./variantRules";

    type VariantOption = { value: string; label: string; group: string };

    let boardHost: HTMLElement;
    let variantHost: HTMLElement;
    let logHost: HTMLElement;
    let legacyControlsHost: HTMLElement;
    let legacyPanelHost: HTMLElement;
    let variants: VariantOption[] = [];
    let selectedVariant = "classic";
    let layer = "problem";
    let autoEnabled = false;
    let initialized = false;
    let zoom = 1;
    let variantMenuOpen = false;
    let studioModal: "confirm-grid" | "confirm-generate" | "screenshot" | "info" | null = null;
    let actionMenu: "new-grid" | "generate" | "transform" | "clone" | null = null;
    let newGridSize: 6 | 9 = 9;
    let hoveredVariant: string | null = null;
    let noteMode = "1";
    let variantSearch = "";
    let screenshotType: "png" | "jpg" | "svg" = "png";
    let screenshotBorder = false;
    let screenshotName = "Classic";
    let darkTheme = false;
    let generatorVariants: string[] = ["classic"];
    let generatorNegative = { kropki: false, xv: false, battenburg: false };
    let generatorSource: "new" | "existing" = "new";
    let toolTitle = "Sudoku input";
    let toolDescription = "Click a cell, then type a digit. Use Tab to cycle through available input tools.";
    let ruleTitle = "Classic Sudoku";
    let ruleDescription = "Place each digit exactly once in every row, column, and box.";

    const variantIcons: Record<string, string> = {
        classic: "9",
        "odd even": "◐",
        diagonal: "╳",
        "anti diagonal": "⨯",
        "anti king": "♔",
        "anti knight": "♞",
        "non consecutive": "↮",
        arrow: "➜",
        thermo: "♨",
        killer: "Σ",
        kropki: "●",
        palindrome: "↔",
        xv: "Ⅹ",
        battenburg: "▦",
        skyscraper: "▥",
        sandwich: "☰"
    };

    function legacyClick(id: string) {
        document.getElementById(id)?.click();
        queueMicrotask(syncState);
    }

    function legacyPress(id: string) {
        document.getElementById(id)?.dispatchEvent(new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            button: 0
        }));
        queueMicrotask(syncState);
    }

    function chooseLayer(nextLayer: "problem" | "solution" | "modes") {
        layer = nextLayer;
        variantMenuOpen = false;
        legacyPress(nextLayer === "solution" ? "pu_a_label" : "pu_q_label");
        if (nextLayer === "modes") queueMicrotask(moveLegacyControls);
    }

    function chooseNoteMode(mode: "1" | "2" | "3") {
        noteMode = mode;
        (window as any).pu?.submode_check?.(`sub_sudoku${mode}`);
        queueMicrotask(syncState);
    }

    function visibleVariants() {
        const query = variantSearch.trim().toLowerCase();
        return query ? variants.filter((variant) => variant.label.toLowerCase().includes(query) ||
            variant.value.toLowerCase().includes(query)) : variants;
    }

    function ensureOutsideSpace() {
        const pu = (window as any).pu;
        if (!pu?.space || !pu.grid_is_square?.()) return;
        const operations = ["resize_top", "resize_bottom", "resize_left", "resize_right"];
        operations.forEach((operation, index) => {
            if (Number(pu.space[index] || 0) < 1) pu[operation]?.(1, "white");
        });
        window.requestAnimationFrame(fitBoard);
    }

    function chooseVariant(value: string) {
        selectedVariant = value;
        variantMenuOpen = false;
        const select = document.getElementById("constraints_settings_opt") as HTMLSelectElement | null;
        if (!select) return;
        select.value = selectedVariant;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        variantSearch = "";
        if (select.value === selectedVariant &&
            ["little killer", "sandwich", "skyscraper"].includes(selectedVariant)) ensureOutsideSpace();
    }

    function updateToolDescription() {
        const active = variantHost?.querySelector<HTMLButtonElement>(".sudoku-variant-mode.active, .sudoku-variant-label.active");
        const variant = active?.dataset.variant || (window as any).pu?.activeSudokuVariant || "classic";
        const mode = active?.dataset.mode || "sudoku";
        const submode = active?.dataset.submode || "1";
        const guide = guideFor(variant);
        ruleTitle = guide.title;
        ruleDescription = guide.rule;
        toolTitle = mode === "number" && variant === "killer" ? "Killer sum" : guide.title + " tool";
        toolDescription = mode === "number" && variant === "killer"
            ? "Select a cage, then enter its total in the cage's upper-left corner."
            : submode === "11" && variant === "killer"
                ? "Enter the total in the upper-left corner of the selected cage."
                : guide.usage;
    }

    function previewRule(variant: string | null) {
        hoveredVariant = variant;
    }

    function requestNewGrid(size: 6 | 9) {
        newGridSize = size;
        actionMenu = null;
        studioModal = "confirm-grid";
    }

    function createGrid() {
        const gridType = document.getElementById("gridtype") as HTMLSelectElement | null;
        const rows = document.getElementById("nb_size2") as HTMLInputElement | null;
        const columns = document.getElementById("nb_size1") as HTMLInputElement | null;
        if (!gridType || !rows || !columns) return;
        gridType.value = "sudoku";
        gridType.dispatchEvent(new Event("change", { bubbles: true }));
        rows.value = String(newGridSize);
        columns.value = String(newGridSize);
        // Native Penpa selects the Sudoku box layout through these hidden size
        // switches. The numeric fields alone are ignored for a new Sudoku grid.
        ["nb_sudoku5", "nb_sudoku6", "nb_sudoku8"].forEach((id) => {
            const option = document.getElementById(id) as HTMLInputElement | null;
            if (option) option.checked = id === "nb_sudoku5" && newGridSize === 6;
        });
        (window as any).SudokuTools?.resetForNewGrid?.();
        (window as any).create_newboard?.();
        (window as any).SudokuTools?.renderVariantTools?.();
        actionMenu = null;
        studioModal = null;
        window.requestAnimationFrame(fitBoard);
    }

    function requestGenerator(source: "new" | "existing") {
        generatorSource = source;
        const pu = (window as any).pu;
        generatorVariants = Array.isArray(pu?.activeSudokuVariants)
            ? [...pu.activeSudokuVariants]
            : [pu?.activeSudokuVariant || "classic"];
        if (!generatorVariants.includes("classic")) generatorVariants.unshift("classic");
        generatorNegative = {
            kropki: pu?.kropkiNegativeConstraint === true,
            xv: pu?.xvNegativeConstraint === true,
            battenburg: pu?.battenburgNegativeConstraint === true
        };
        const outside = Number(pu?.space?.[0] || 0) + Number(pu?.space?.[1] || 0);
        const size = Number(pu?.ny || 9) - outside;
        newGridSize = size === 6 ? 6 : 9;
        actionMenu = null;
        studioModal = "confirm-generate";
    }

    function confirmGenerator() {
        const size = newGridSize;
        const variantsToGenerate = [...generatorVariants];
        const negative = { ...generatorNegative };
        const supported = new Set(["classic", "diagonal", "anti diagonal", "anti king", "anti knight",
            "non consecutive", "odd even", "kropki", "xv", "battenburg"]);
        const unsupported = variantsToGenerate.filter((variant) => !supported.has(variant));
        if (generatorSource !== "existing" && (unsupported.length || negative.kropki || negative.xv || negative.battenburg ||
            (size === 6 && variantsToGenerate.includes("anti diagonal")))) {
            studioModal = null;
            const reason = unsupported.length
                ? `Generation is not implemented for: ${unsupported.join(", ")}.`
                : negative.kropki || negative.xv || negative.battenburg
                    ? "Symmetric generation with a negative edge/corner rule is not implemented yet."
                    : "Anti-diagonal generation currently requires a 9 × 9 grid.";
            (window as any).Swal?.fire?.({ icon: "warning", title: "Cannot generate this combination", text: reason });
            return;
        }
        studioModal = null;
        const sourcePuzzle = generatorSource === "existing" ? {
            board: (window as any).SudokuSolver?.readBoard?.((window as any).pu, false),
            constraints: (window as any).SudokuSolver?.readConstraints?.((window as any).pu),
            preserveExisting: true
        } : null;
        window.setTimeout(() => (window as any).SudokuTools?.generatePuzzle?.(
            size, variantsToGenerate, negative, sourcePuzzle
        ), 0);
    }

    function transform(id: string) {
        actionMenu = null;
        legacyPress(id);
        window.requestAnimationFrame(fitBoard);
    }

    function duplicateUrl(forPenpa: boolean) {
        const pu = (window as any).pu;
        if (!pu?.maketext_duplicate) return;
        const generated = pu.maketext_duplicate() as string;
        const hash = generated.includes("#") ? generated.slice(generated.indexOf("#")) : "";
        const target = forPenpa
            ? `https://swaroopg92.github.io/penpa-edit/${hash}`
            : `${window.location.origin}${window.location.pathname}${hash}`;
        actionMenu = null;
        window.open(target, "_blank", "noopener");
    }

    function toggleActionMenu(menu: "new-grid" | "generate" | "transform" | "clone") {
        actionMenu = actionMenu === menu ? null : menu;
    }

    function activeVariantFilename() {
        const pu = (window as any).pu;
        const active = Array.isArray(pu?.activeSudokuVariants)
            ? pu.activeSudokuVariants.filter((variant: string) => variant !== "classic")
            : [];
        return active.length ? active.map((variant: string) => variant.toLowerCase().replace(/\s+/g, "_")).join("_") : "Classic";
    }

    function openScreenshot() {
        screenshotType = "png";
        screenshotBorder = false;
        screenshotName = activeVariantFilename();
        studioModal = "screenshot";
    }

    function prepareScreenshot() {
        const typeIds = { png: "nb_type1", jpg: "nb_type2", svg: "nb_type3" };
        (document.getElementById(typeIds[screenshotType]) as HTMLInputElement | null)?.click();
        const border = document.getElementById(screenshotBorder ? "nb_margin1" : "nb_margin2") as HTMLInputElement | null;
        if (border) border.checked = true;
        const title = document.getElementById("nb_title2") as HTMLInputElement | null;
        const rules = document.getElementById("nb_rules2") as HTMLInputElement | null;
        if (title) title.checked = true;
        if (rules) rules.checked = true;
        const filename = document.getElementById("saveimagename") as HTMLInputElement | null;
        if (filename) filename.value = screenshotName || activeVariantFilename();
    }

    function exportScreenshot(openInWindow: boolean) {
        prepareScreenshot();
        if (openInWindow) (window as any).saveimage_window?.();
        else (window as any).saveimage_download?.();
        studioModal = null;
    }

    function toggleTheme() {
        darkTheme = !darkTheme;
    }

    function moveLegacyControls() {
        if (!legacyControlsHost) return;
        ["legacy_mode_controls", "submode_button", "stylemode_button"].forEach((id) => {
            const node = document.getElementById(id);
            if (!node) return;
            node.classList.remove("is_hidden");
            legacyControlsHost.appendChild(node);
        });
        const panel = document.getElementById("float-key");
        if (panel && legacyPanelHost) legacyPanelHost.appendChild(panel);
    }

    function closeModalFromBackdrop(event: MouseEvent) {
        if (event.target === event.currentTarget) studioModal = null;
    }

    function variantIcon(variant: string) {
        return variantIcons[variant] || "◇";
    }

    function applyZoom() {
        const board = document.getElementById("puzzle-container");
        if (board) board.style.transform = `scale(${zoom})`;
    }

    function fitBoard() {
        const board = document.getElementById("puzzle-container");
        if (!board || !boardHost) return;
        const width = board.offsetWidth;
        const height = board.offsetHeight;
        if (!width || !height) return;
        zoom = Math.max(.55, Math.min(2.4,
            (boardHost.clientWidth - 28) / width,
            (boardHost.clientHeight - 28) / height));
        applyZoom();
    }

    function changeZoom(delta: number) {
        zoom = Math.max(.5, Math.min(2.5, Math.round((zoom + delta) * 10) / 10));
        applyZoom();
    }

    function syncState() {
        const select = document.getElementById("constraints_settings_opt") as HTMLSelectElement | null;
        if (select?.options.length) {
            variants = Array.from(select.options).map((option) => ({
                value: option.value,
                label: option.textContent,
                group: (option.parentElement as HTMLOptGroupElement | null)?.label || "Variants"
            }));
            selectedVariant = select.value || "classic";
        }
        if (layer !== "modes") layer = document.getElementById("pu_a")?.checked ? "solution" : "problem";
        noteMode = String((window as any).pu?.mode?.pu_a?.sudoku?.[0] || "1");
        if (layer === "solution") variantMenuOpen = false;
        variantHost?.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
            if (button.disabled !== (layer === "solution")) button.disabled = layer === "solution";
        });
        autoEnabled = document.getElementById("sudoku_auto_solver")?.classList.contains("auto-solver-active") || false;
        updateToolDescription();
    }

    function cycleInputMode(event: KeyboardEvent) {
        const target = event.target as HTMLElement | null;
        if (target?.closest("input, textarea, select, [contenteditable='true'], .modal, .swal2-container")) return;
        if (layer === "solution" && ["KeyZ", "KeyX", "KeyC"].includes(event.code)) {
            noteMode = event.code === "KeyZ" ? "1" : event.code === "KeyX" ? "2" : "3";
        }
        if (event.key !== "Tab" || layer === "solution" || layer === "modes" || studioModal) return;
        const modes = Array.from(variantHost?.querySelectorAll<HTMLButtonElement>(".sudoku-variant-mode") || [])
            .filter((button) => !button.disabled);
        if (!modes.length) return;
        const active = modes.findIndex((button) => button.classList.contains("active"));
        const direction = event.shiftKey ? -1 : 1;
        const next = active < 0
            ? (direction > 0 ? 0 : modes.length - 1)
            : (active + direction + modes.length) % modes.length;
        event.preventDefault();
        modes[next].click();
        modes[next].focus({ preventScroll: true });
    }

    function moveLegacyNodes() {
        const board = document.getElementById("puzzle-container");
        const variantTools = document.getElementById("sudoku-variant-tools");
        const log = document.getElementById("sudoku-solver-log");
        const autoSolver = document.getElementById("sudoku_auto_solver");
        const logHeader = log?.querySelector(".sudoku-solver-log-header");
        if (!board || !variantTools || !log || !autoSolver || !logHeader || !document.getElementById("canvas")) return false;
        boardHost.appendChild(board);
        variantHost.appendChild(variantTools);
        logHost.appendChild(log);
        logHeader.insertBefore(autoSolver, document.getElementById("sudoku-solver-status"));
        moveLegacyControls();
        syncState();
        initialized = true;
        window.requestAnimationFrame(() => window.requestAnimationFrame(fitBoard));
        window.setTimeout(fitBoard, 120);
        window.setTimeout(fitBoard, 500);
        return true;
    }

    onMount(() => {
        let observer: MutationObserver | undefined;
        let resizeObserver: ResizeObserver | undefined;
        const start = () => {
            if (!moveLegacyNodes()) return false;
            observer = new MutationObserver(syncState);
            [
                document.getElementById("constraints_settings_opt"),
                document.getElementById("sudoku_auto_solver"),
                document.getElementById("sudoku-variant-tools")
            ].filter(Boolean).forEach((node) => observer.observe(node, {
                attributes: true,
                childList: true,
                subtree: true
            }));
            resizeObserver = new ResizeObserver(fitBoard);
            resizeObserver.observe(boardHost);
            const board = document.getElementById("puzzle-container");
            if (board) resizeObserver.observe(board);
            return true;
        };
        const begin = () => {
            if (start()) return;
            const retry = window.setInterval(() => {
                if (start()) window.clearInterval(retry);
            }, 50);
            window.setTimeout(() => window.clearInterval(retry), 10000);
        };
        if (document.readyState === "complete") begin();
        else window.addEventListener("load", () => window.setTimeout(begin, 0), { once: true });
        document.addEventListener("keydown", cycleInputMode);
        const closeVariantMenu = (event: PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target?.closest(".variant-picker")) variantMenuOpen = false;
            if (!target?.closest(".action-dropdown")) actionMenu = null;
        };
        document.addEventListener("pointerdown", closeVariantMenu);
        return () => {
            observer?.disconnect();
            resizeObserver?.disconnect();
            document.removeEventListener("keydown", cycleInputMode);
            document.removeEventListener("pointerdown", closeVariantMenu);
        };
    });
</script>

<svelte:head>
    <title>Penpa Sudoku Studio</title>
    <meta name="description" content="A reactive Sudoku setting and CSP solving workspace powered by Penpa." />
</svelte:head>

<div class="studio-shell" class:ready={initialized} class:dark={darkTheme}>
    <main class="studio-grid">
        <aside class="column controls" aria-label="Puzzle controls">
            <section>
                <h2>Editing layer</h2>
                <div class="segmented">
                    <button class:active={layer === "problem"} on:click={() => chooseLayer("problem")}>Problem</button>
                    <button class:active={layer === "solution"} on:click={() => chooseLayer("solution")}>Note</button>
                    <button class:active={layer === "modes"} on:click={() => chooseLayer("modes")}>Modes</button>
                </div>
                {#if layer === "solution"}
                    <div class="note-modes" aria-label="Note input style">
                        <button class:active={noteMode === "1"} on:click={() => chooseNoteMode("1")}><span>Z</span>Normal</button>
                        <button class:active={noteMode === "3"} on:click={() => chooseNoteMode("3")}><span>C</span>Center</button>
                        <button class:active={noteMode === "2"} on:click={() => chooseNoteMode("2")}><span>X</span>Corner</button>
                    </div>
                {/if}
            </section>

            <section class="variant-picker" class:disabled-section={layer === "solution"} class:hidden-section={layer === "modes"}>
                <div class="control-label" id="svelte-variant-label">Add variant</div>
                <div class="variant-search-control">
                    <span class="variant-icon">{variantIcon(selectedVariant)}</span>
                    <input disabled={layer === "solution"} aria-labelledby="svelte-variant-label" aria-expanded={variantMenuOpen}
                        bind:value={variantSearch} on:focus={() => variantMenuOpen = true}
                        on:input={() => variantMenuOpen = true} placeholder="Search variants…" />
                    <span class="variant-chevron">⌄</span>
                </div>
                {#if variantMenuOpen}
                    <div class="variant-menu" role="menu" tabindex="-1" on:mouseleave={() => previewRule(null)}>
                        {#each [...new Set(visibleVariants().map((variant) => variant.group))] as group}
                            <div class="variant-menu-group">{group}</div>
                            {#each visibleVariants().filter((variant) => variant.group === group) as variant}
                                <button role="menuitem" class:current={variant.value === selectedVariant}
                                    on:mouseenter={() => previewRule(variant.value)}
                                    on:focus={() => previewRule(variant.value)}
                                    on:click={() => chooseVariant(variant.value)}>
                                    <span class="variant-icon">{variantIcon(variant.value)}</span>
                                    <span>{variant.label}</span>
                                </button>
                            {/each}
                        {/each}
                        {#if hoveredVariant}
                            <div class="variant-rule-preview">
                                <strong>{guideFor(hoveredVariant).title}</strong>
                                <span>{guideFor(hoveredVariant).rule}</span>
                            </div>
                        {/if}
                    </div>
                {/if}
            </section>

            <section class="input-modes-section" class:disabled-section={layer === "solution"} class:hidden-section={layer === "modes"}>
                <h2>Input modes</h2>
                <div bind:this={variantHost} class="legacy-variant-host"></div>
            </section>

            <section class="legacy-modes-section" class:hidden-section={layer !== "modes"}>
                <h2>Mode controls</h2>
                <div bind:this={legacyControlsHost} class="legacy-controls-host"></div>
            </section>

            <section class="legacy-panel-section" class:hidden-section={layer !== "modes"}>
                <h2>Panel</h2>
                <div bind:this={legacyPanelHost} class="legacy-panel-host"></div>
            </section>

            <section class="tool-help" class:hidden-section={layer === "modes"} aria-live="polite">
                <div>
                    <span class="help-label">Variant rule</span>
                    <strong>{ruleTitle}</strong>
                    <p>{ruleDescription}</p>
                </div>
                <div>
                    <span class="help-label">Tool usage</span>
                    <strong>{toolTitle}</strong>
                    <p>{toolDescription}</p>
                </div>
            </section>

        </aside>

        <section class="column board-column" aria-label="Puzzle board">
            <div class="zoom-controls" aria-label="Board zoom">
                <button on:click={() => changeZoom(-.1)} aria-label="Zoom out">−</button>
                <button class="zoom-value" on:click={fitBoard} title="Fit board">{Math.round(zoom * 100)}%</button>
                <button on:click={() => changeZoom(.1)} aria-label="Zoom in">+</button>
            </div>
            <div bind:this={boardHost} class="board-host">
                {#if !initialized}<p class="loading">Preparing Penpa canvas…</p>{/if}
            </div>
            <div class="board-busy-overlay" aria-live="polite" aria-label="CSP is working">
                <span class="busy-spinner" aria-hidden="true"></span>
                <strong>CSP working…</strong>
                <small>The board is locked until this run finishes.</small>
                <button on:click={() => (window as any).SudokuTools?.pauseWork?.()}>Pause</button>
            </div>
        </section>

        <aside class="column actions" aria-label="Solver and Penpa controls">
            <section bind:this={logHost} class="log-host"></section>

            <section class="penpa-actions">
                <h2>Penpa actions</h2>
                <div class="action-list">
                    <div class="action-group">
                        <div class="action-dropdown">
                            <button aria-haspopup="menu" aria-expanded={actionMenu === "new-grid"} on:click={() => toggleActionMenu("new-grid")}><span>▦</span>New grid <b>⌄</b></button>
                            {#if actionMenu === "new-grid"}
                                <div class="action-menu" role="menu">
                                    <button role="menuitem" on:click={() => requestNewGrid(6)}>6 × 6 Sudoku</button>
                                    <button role="menuitem" on:click={() => requestNewGrid(9)}>9 × 9 Sudoku</button>
                                </div>
                            {/if}
                        </div>
                        <div class="action-dropdown">
                            <button aria-haspopup="menu" aria-expanded={actionMenu === "generate"} on:click={() => toggleActionMenu("generate")}><span>✦</span>Generate <b>⌄</b></button>
                            {#if actionMenu === "generate"}
                                <div class="action-menu" role="menu">
                                    <button role="menuitem" on:click={() => requestGenerator("new")}>New grid</button>
                                    <button role="menuitem" on:click={() => requestGenerator("existing")}>From existing</button>
                                </div>
                            {/if}
                        </div>
                        <button on:click={() => legacyClick("sudoku_reset")}><span>↺</span>Reset grid</button>
                        <div class="action-dropdown align-right">
                            <button aria-haspopup="menu" aria-expanded={actionMenu === "transform"} on:click={() => toggleActionMenu("transform")}><span>◇</span>Transform <b>⌄</b></button>
                            {#if actionMenu === "transform"}
                                <div class="action-menu" role="menu">
                                    <button role="menuitem" on:click={() => transform("rt_left")}>↶ Rotate left</button>
                                    <button role="menuitem" on:click={() => transform("rt_right")}>↷ Rotate right</button>
                                    <button role="menuitem" on:click={() => transform("rt_LR")}>↔ Flip horizontal</button>
                                    <button role="menuitem" on:click={() => transform("rt_UD")}>↕ Flip vertical</button>
                                </div>
                            {/if}
                        </div>
                    </div>
                    <div class="action-group">
                        <div class="action-dropdown">
                            <button aria-haspopup="menu" aria-expanded={actionMenu === "clone"} on:click={() => toggleActionMenu("clone")}><span>⧉</span>Clone <b>⌄</b></button>
                            {#if actionMenu === "clone"}
                                <div class="action-menu" role="menu">
                                    <button role="menuitem" on:click={() => duplicateUrl(false)}>Clone here</button>
                                    <button role="menuitem" on:click={() => duplicateUrl(true)}>Clone to Penpa</button>
                                </div>
                            {/if}
                        </div>
                        <button on:click={openScreenshot}><span>▣</span>Screenshot</button>
                        <button on:click={() => legacyPress("savetext")}><span>↗</span>Share</button>
                    </div>
                    <div class="action-group">
                        <button on:click={() => legacyPress("page_settings")}><span>⚙</span>Settings</button>
                        <button on:click={toggleTheme}><span>{darkTheme ? "☀" : "◐"}</span>{darkTheme ? "Light" : "Dark"}</button>
                        <button on:click={() => legacyPress("input_url")}><span>⇩</span>Load</button>
                    </div>
                    <div class="action-group final-actions">
                        <button on:click={() => legacyClick("sudoku_undo")}><span>↶</span>Undo</button>
                        <button on:click={() => legacyClick("sudoku_redo")}><span>↷</span>Redo</button>
                        <button title="Populate with example grid" on:click={() => legacyClick("sudoku_load_test_board")}><span>⚗</span>Example grid</button>
                        <button class="info-action" title="About this editor" aria-label="About this editor" on:click={() => studioModal = "info"}><span>ⓘ</span></button>
                    </div>
                </div>
            </section>

        </aside>
    </main>
</div>

{#if studioModal}
    <div class="studio-modal-backdrop" role="presentation" on:click={closeModalFromBackdrop}>
        <div class="studio-modal" role="dialog" aria-modal="true" aria-labelledby="studio-modal-title" tabindex="-1">
            <button class="studio-modal-close" aria-label="Close" on:click={() => studioModal = null}>×</button>
            {#if studioModal === "confirm-grid"}
                <h2 id="studio-modal-title">Create a new {newGridSize} × {newGridSize} grid?</h2>
                <p>This replaces the current puzzle, variants, solver state, and undo history.</p>
                <div class="studio-modal-actions">
                    <button on:click={() => studioModal = null}>Cancel</button>
                    <button class="primary" on:click={createGrid}>Create grid</button>
                </div>
            {:else if studioModal === "confirm-generate"}
                <h2 id="studio-modal-title">Generate from the current variants?</h2>
                <p>{generatorSource === "existing" ? "The current givens and clues will seed the completed grid before pruning." : "A fresh completed grid will be constructed."} The {newGridSize} × {newGridSize} {generatorVariants.filter((variant) => variant !== "classic").join(" + ") || "Classic"} puzzle uses 180° rotational symmetry, and every clue-pair removal is checked by the CSP for a unique solution.</p>
                <div class="studio-modal-actions">
                    <button on:click={() => studioModal = null}>Cancel</button>
                    <button class="primary" on:click={confirmGenerator}>Generate</button>
                </div>
            {:else if studioModal === "screenshot"}
                <h2 id="studio-modal-title">Screenshot</h2>
                <p>Export the native Penpa canvas for typesetting or sharing.</p>
                <div class="modal-field">
                    <span>File type</span>
                    <div class="choice-group three">
                        <button class:active={screenshotType === "png"} on:click={() => screenshotType = "png"}>PNG</button>
                        <button class:active={screenshotType === "jpg"} on:click={() => screenshotType = "jpg"}>JPG</button>
                        <button class:active={screenshotType === "svg"} on:click={() => screenshotType = "svg"}>SVG</button>
                    </div>
                </div>
                <div class="modal-field">
                    <span>White border</span>
                    <div class="choice-group">
                        <button class:active={!screenshotBorder} on:click={() => screenshotBorder = false}>No</button>
                        <button class:active={screenshotBorder} on:click={() => screenshotBorder = true}>Yes</button>
                    </div>
                </div>
                <label class="modal-field">Filename<input bind:value={screenshotName} /></label>
                <div class="studio-modal-actions">
                    <button on:click={() => exportScreenshot(true)}>Open</button>
                    <button class="primary" on:click={() => exportScreenshot(false)}>Download</button>
                </div>
            {:else}
                <h2 id="studio-modal-title">About Penpa Sudoku Studio</h2>
                <p>This editor builds on Penpa+, created and maintained by the Penpa community and its contributors.</p>
                <div class="info-copy">
                    <strong>Credits</strong>
                    <p>Native puzzle drawing, canvas interaction, serialization, and SVG export are powered by Penpa+. This workspace adds the Svelte interface and CSP Sudoku tooling.</p>
                    <strong>Disclaimer</strong>
                    <p>This is an independent working fork. Variant solving remains experimental; always verify generated candidates before publishing a puzzle.</p>
                    <a href="https://github.com/lemononmars/penpa-edit" target="_blank" rel="noreferrer">View this project on GitHub ↗</a>
                </div>
                <div class="studio-modal-actions">
                    <button class="primary" on:click={() => studioModal = null}>Done</button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    :global(.svelte-home body) {
        margin: 0;
        min-width: 0;
        background: #eef1f5;
        color: #1d2633;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    :global(.svelte-home #header),
    :global(.svelte-home #tool-container),
    :global(.svelte-home #bottom_button) { display: none !important; }
    :global(.svelte-home #app-container) { display: contents; }
    :global(.svelte-home #svelte-app) { min-height: 100vh; }
    .studio-shell { min-height: 100vh; }
    .studio-grid {
        display: grid;
        grid-template-columns: minmax(230px, 290px) minmax(430px, 1fr) minmax(250px, 310px);
        gap: 14px;
        padding: 14px;
        box-sizing: border-box;
        min-height: calc(100vh - 64px);
    }
    .column { min-width: 0; }
    .controls, .actions { display: flex; flex-direction: column; gap: 12px; }
    section:not(.board-column) {
        padding: 14px;
        border: 1px solid #d4dbe3;
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 2px 8px rgba(23, 34, 49, .06);
    }
    h2, .control-label { display: block; margin: 0 0 9px; font-size: 12px; font-weight: 750; text-transform: uppercase; letter-spacing: .08em; color: #536170; }
    button { font: inherit; }
    button { cursor: pointer; }
    .segmented { display: grid; grid-template-columns: repeat(3, 1fr); }
    .segmented button { padding: 9px; border: 1px solid #bfc9d4; background: #f7f9fb; }
    .segmented button:first-child { border-radius: 6px 0 0 6px; }
    .segmented button + button { border-left: 0; }
    .segmented button:last-child { border-radius: 0 6px 6px 0; }
    .note-modes { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 8px; }
    .note-modes button { display: grid; gap: 2px; padding: 7px 3px; border: 1px solid #bfc9d4; border-right: 0; background: #f7f9fb; font-size: 11px; }
    .note-modes button:first-child { border-radius: 6px 0 0 6px; }
    .note-modes button:last-child { border-right: 1px solid #bfc9d4; border-radius: 0 6px 6px 0; }
    .note-modes span { font-size: 9px; opacity: .7; }
    button.active { background: #176fae !important; color: white !important; border-color: #176fae !important; }
    .variant-picker { position: relative; z-index: 20; }
    .variant-search-control {
        display: grid;
        grid-template-columns: 24px 1fr 18px;
        align-items: center;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        min-height: 38px;
        padding: 6px 9px;
        border: 1px solid #bfc9d4;
        border-radius: 6px;
        color: #263443;
        background: #fff;
        text-align: left;
    }
    .variant-search-control:focus-within { border-color: #176fae; box-shadow: 0 0 0 3px rgba(23,111,174,.12); }
    .variant-search-control input { width: 100%; min-width: 0; padding: 0; border: 0; outline: 0; color: #263443; background: transparent; font: inherit; }
    .variant-search-control:has(input:disabled) { background: #f0f2f4; }
    .variant-icon {
        display: inline-grid;
        place-items: center;
        width: 20px;
        height: 20px;
        font-family: "Segoe UI Symbol", sans-serif;
        font-size: 15px;
        line-height: 1;
    }
    .variant-chevron { color: #73808d; text-align: right; }
    .variant-menu {
        position: absolute;
        top: calc(100% - 8px);
        right: 0;
        left: 0;
        box-sizing: border-box;
        z-index: 25;
        max-height: min(430px, 65vh);
        padding: 6px;
        border: 1px solid #bdc8d3;
        border-radius: 8px;
        overflow: hidden auto;
        background: #fff;
        box-shadow: 0 12px 30px rgba(23,34,49,.2);
    }
    .variant-menu-group {
        padding: 7px 8px 4px;
        color: #778390;
        font-size: 10px;
        font-weight: 750;
        letter-spacing: .08em;
        text-transform: uppercase;
    }
    .variant-menu button {
        display: grid;
        grid-template-columns: 25px 1fr;
        align-items: center;
        width: 100%;
        min-height: 34px;
        padding: 5px 8px;
        border: 0;
        border-radius: 5px;
        color: #263443;
        background: transparent;
        text-align: left;
    }
    .variant-menu button:hover, .variant-menu button.current { background: #eaf4fb; color: #0d6099; }
    .variant-rule-preview {
        position: sticky;
        bottom: -6px;
        display: grid;
        gap: 3px;
        margin: 6px -6px -6px;
        padding: 9px 10px;
        border-top: 1px solid #dbe2e8;
        color: #536170;
        background: #f7fafc;
        font-size: 10px;
        line-height: 1.4;
    }
    .variant-rule-preview strong { color: #263443; font-size: 11px; }
    .legacy-variant-host { display: flex; flex-wrap: wrap; gap: 6px; }
    :global(.svelte-home .legacy-variant-host .sudoku-variant-tools) { display: flex; flex-wrap: wrap; gap: 6px; border: 0; padding: 0; }
    :global(.svelte-home .legacy-variant-host button) { min-height: 32px; }
    .board-column { display: flex; justify-content: center; align-items: flex-start; overflow: auto; }
    .board-host { width: 100%; min-height: 520px; display: flex; justify-content: center; align-items: flex-start; }
    :global(.svelte-home .board-host #puzzle-container) { width: auto; max-width: 100%; margin: 0; padding: 8px; background: white; border: 1px solid #d4dbe3; border-radius: 10px; box-shadow: 0 4px 18px rgba(23, 34, 49, .1); }
    :global(.svelte-home .board-host #puzzleinfo), :global(.svelte-home .board-host #contestinfo) { display: none; }
    .loading { margin-top: 80px; color: #6d7986; }
    .disabled-section { opacity: .48; }
    .disabled-section .control-label, .disabled-section h2 { color: #7f8994; }
    :global(.svelte-home .disabled-section .legacy-variant-host) { pointer-events: none; }
    .action-list { display: grid; gap: 6px; }
    .action-list button { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid #c8d1da; border-radius: 6px; background: #f9fbfc; text-align: left; }
    .action-list button span { width: 22px; text-align: center; color: #176fae; font-size: 17px; }
    .log-host { padding: 0 !important; overflow: hidden; }
    :global(.svelte-home .log-host .sudoku-solver-log) { width: 100%; margin: 0; border: 0; box-shadow: none; }
    @media (max-width: 1050px) {
        .studio-grid { grid-template-columns: 240px minmax(400px, 1fr); }
        .actions { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .log-host { grid-column: 1 / -1; }
    }
    @media (max-width: 760px) {
        .studio-grid { grid-template-columns: 1fr; }
        .controls, .actions { display: flex; grid-column: auto; }
        .board-column { order: -1; }
    }

    /* Fixed, full-viewport Svelte workspace. */
    :global(html.svelte-home),
    :global(html.svelte-home body) {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    :global(.svelte-home #svelte-app),
    .studio-shell {
        width: 100vw;
        height: 100vh;
        min-height: 0;
        overflow: hidden;
    }
    .studio-grid {
        width: 100%;
        height: 100%;
        min-height: 0;
        grid-template-columns: clamp(215px, 20vw, 285px) minmax(0, 1fr) clamp(245px, 22vw, 315px);
        gap: 10px;
        padding: 10px;
        overflow: hidden;
    }
    .column,
    .controls,
    .actions {
        height: 100%;
        min-height: 0;
        overflow: hidden;
    }
    .controls,
    .actions {
        display: flex;
        grid-column: auto;
        gap: 9px;
    }
    section:not(.board-column) {
        padding: 11px;
        border-radius: 8px;
        box-shadow: 0 1px 5px rgba(23, 34, 49, .06);
    }
    .input-modes-section { flex: 0 0 auto; min-height: 0; overflow: hidden; }
    .hidden-section { display: none !important; }
    .legacy-modes-section { flex: 1; min-height: 0; overflow: hidden auto; }
    .legacy-panel-section { flex: 0 0 290px; min-height: 290px; overflow: auto; }
    .tool-help { flex: 1; min-height: 0; display: grid; align-content: start; gap: 12px; }
    .tool-help > div + div { padding-top: 12px; border-top: 1px solid #e2e7eb; }
    .tool-help .help-label { display: block; margin-bottom: 5px; color: #7b8793; font-size: 9px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
    .tool-help strong { display: block; margin-bottom: 6px; color: #263443; font-size: 13px; }
    .tool-help p { margin: 0; color: #667482; font-size: 11px; line-height: 1.5; }

    /* Svelte-styled Penpa input modes and per-variant icons. */
    :global(.svelte-home .legacy-variant-host .sudoku-variant-tools) {
        align-content: flex-start;
        gap: 7px;
    }
    :global(.svelte-home .legacy-variant-host button) {
        min-height: 34px !important;
        height: 34px !important;
        padding: 0 10px !important;
        border: 1px solid #bdc8d3 !important;
        border-radius: 6px !important;
        color: #263443 !important;
        background: #f8fafc !important;
        box-shadow: none !important;
        font-size: 12px !important;
        font-weight: 650;
    }
    :global(.svelte-home .legacy-variant-host button:hover) {
        border-color: #176fae !important;
        background: #eef7fd !important;
    }
    :global(.svelte-home .legacy-variant-host button.active) {
        color: #fff !important;
        border-color: #176fae !important;
        background: #176fae !important;
    }
    :global(.svelte-home .sudoku-variant-group) { --variant-icon: "◇"; gap: 0 !important; }
    :global(.svelte-home .sudoku-variant-group[data-variant="odd even"]) { --variant-icon: "◐"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="diagonal"]) { --variant-icon: "╳"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="anti diagonal"]) { --variant-icon: "⨯"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="anti king"]) { --variant-icon: "♔"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="anti knight"]) { --variant-icon: "♞"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="non consecutive"]) { --variant-icon: "↮"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="arrow"]) { --variant-icon: "➜"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="thermo"]) { --variant-icon: "♨"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="killer"]) { --variant-icon: "Σ"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="kropki"]) { --variant-icon: "●"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="palindrome"]) { --variant-icon: "↔"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="xv"]) { --variant-icon: "Ⅹ"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="battenburg"]) { --variant-icon: "▦"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="skyscraper"]) { --variant-icon: "▥"; }
    :global(.svelte-home .sudoku-variant-group[data-variant="sandwich"]) { --variant-icon: "☰"; }
    :global(.svelte-home .sudoku-variant-group .sudoku-variant-mode::before),
    :global(.svelte-home .sudoku-variant-group .sudoku-variant-label::before) {
        content: var(--variant-icon);
        margin-right: 6px;
        color: #176fae;
        font-size: 15px;
    }
    :global(.svelte-home .sudoku-variant-group .sudoku-variant-mode.active::before) { color: #fff; }
    :global(.svelte-home .sudoku-variant-tools > .sudoku-variant-mode::before) {
        content: "9";
        display: inline-grid;
        place-items: center;
        width: 17px;
        height: 17px;
        margin-right: 6px;
        border: 1px solid currentColor;
        border-radius: 3px;
        font-size: 10px;
    }
    :global(.svelte-home .legacy-variant-host .sudoku-variant-close) {
        width: 28px !important;
        min-width: 28px !important;
        padding: 0 !important;
        color: #73808d !important;
    }
    :global(.svelte-home .sudoku-variant-group > button) {
        margin: 0 !important;
        border-left-width: 0 !important;
        border-radius: 0 !important;
    }
    :global(.svelte-home .sudoku-variant-group > button:first-child) {
        border-left-width: 1px !important;
        border-radius: 6px 0 0 6px !important;
    }
    :global(.svelte-home .sudoku-variant-group > button:last-child) {
        border-radius: 0 6px 6px 0 !important;
    }
    :global(.svelte-home .sudoku-kropki-negative),
    :global(.svelte-home .sudoku-xv-negative),
    :global(.svelte-home .sudoku-battenburg-negative) {
        padding: 0 8px !important;
        font-size: 10px !important;
    }

    /* Board is maximized and visually zoomed only inside its own column. */
    .board-column {
        position: relative;
        order: initial;
        align-items: stretch;
        overflow: hidden;
        border: 1px solid #d4dbe3;
        border-radius: 9px;
        background: #fff;
    }
    .board-host {
        width: 100%;
        height: 100%;
        min-height: 0;
        align-items: center;
        overflow: hidden;
    }
    :global(.svelte-home .board-host #puzzle-container) {
        flex: 0 0 auto;
        max-width: none;
        padding: 0;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        transform-origin: center center;
        transition: transform .12s ease-out;
    }
    .zoom-controls {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 5;
        display: grid;
        grid-template-columns: 32px 56px 32px;
        border: 1px solid #c3ced8;
        border-radius: 7px;
        overflow: hidden;
        background: rgba(255,255,255,.94);
        box-shadow: 0 2px 8px rgba(23,34,49,.12);
    }
    .zoom-controls button {
        height: 32px;
        padding: 0;
        border: 0;
        border-right: 1px solid #d4dbe3;
        background: transparent;
        color: #263443;
        font-weight: 700;
    }
    .zoom-controls button:last-child { border-right: 0; }
    .zoom-controls .zoom-value { font-size: 11px; font-weight: 650; }

    /* Right column: solver log first, followed by grouped Penpa actions. */
    .log-host { order: -1; flex: 0 0 196px; min-height: 0; }
    :global(.svelte-home .log-host .sudoku-solver-log) {
        height: 100%;
        box-sizing: border-box;
        padding: 0;
        border: 1px solid #d4dbe3;
        border-radius: 8px;
        overflow: hidden;
        color: #263443;
        background: #fff;
    }
    :global(.svelte-home .log-host .sudoku-solver-log-header) {
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr);
        min-height: 38px;
        box-sizing: border-box;
        align-items: center;
        margin: 0;
        padding: 8px 10px;
        color: #263443;
        background: #f4f7f9;
        border-bottom: 1px solid #d9e0e6;
    }
    :global(.svelte-home .log-host #sudoku_auto_solver) {
        width: 30px;
        height: 26px;
        margin: 0;
        padding: 0;
        border: 1px solid #bfcad4;
        border-radius: 5px;
        color: #176fae;
        background: #fff;
    }
    :global(.svelte-home .log-host #sudoku_auto_solver.active) { color: #fff; border-color: #176fae; background: #176fae; }
    :global(.svelte-home #sudoku-solver-status) { display: inline-flex; align-items: center; gap: 7px; color: #65727f; font-size: 11px; font-weight: 650; }
    :global(.svelte-home .log-host #sudoku-solver-status) { justify-self: end; }
    :global(.svelte-home #sudoku-solver-status::before) {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #7f8c98;
        box-shadow: 0 0 0 3px rgba(127,140,152,.13);
    }
    :global(.svelte-home body.sudoku-solver-mode #sudoku-solver-status::before) {
        background: #48c78e;
        box-shadow: 0 0 0 3px rgba(72,199,142,.16);
    }
    :global(.svelte-home .log-host progress) {
        width: calc(100% - 20px);
        height: 6px;
        margin: 8px 10px 0;
        accent-color: #42a5e8;
    }
    :global(.svelte-home .log-host #sudoku-solver-log-output) {
        box-sizing: border-box;
        height: 116px;
        max-height: 116px;
        margin: 7px 10px 10px;
        padding: 7px 8px;
        overflow: hidden;
        white-space: pre-wrap;
        color: #435160;
        background: #fff !important;
        border: 1px solid #e0e5ea;
        border-radius: 5px;
        font-size: 10px;
    }
    :global(.svelte-home body.sudoku-solver-running .board-host #puzzle-container) {
        pointer-events: none;
        cursor: progress;
    }
    .board-busy-overlay {
        position: absolute;
        inset: 0;
        z-index: 10;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        pointer-events: all;
        color: #263443;
        background: rgba(247, 250, 252, .82);
        backdrop-filter: blur(3px);
        cursor: progress;
    }
    :global(.svelte-home body.sudoku-solver-running) .board-busy-overlay { display: flex; }
    .board-busy-overlay small { color: #65727f; font-size: 11px; }
    .board-busy-overlay button {
        min-width: 96px;
        min-height: 34px;
        margin-top: 4px;
        border: 1px solid #176fae;
        border-radius: 6px;
        color: #fff;
        background: #176fae;
        font-weight: 700;
    }
    .busy-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid #c9d8e3;
        border-top-color: #176fae;
        border-radius: 50%;
        animation: busy-spin .8s linear infinite;
    }
    @keyframes busy-spin { to { transform: rotate(360deg); } }
    .penpa-actions { flex: 1; min-height: 0; overflow: visible; }
    .action-list {
        display: grid;
        gap: 9px;
    }
    .action-group {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
        padding-bottom: 9px;
        border-bottom: 1px solid #e2e7eb;
    }
    .action-group:last-child { padding-bottom: 0; border-bottom: 0; }
    .action-dropdown { position: relative; min-width: 0; }
    .action-dropdown > button { width: 100%; }
    .action-dropdown > button b { margin-left: auto; color: #71808d; font-size: 10px; }
    .action-menu {
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        z-index: 40;
        display: grid;
        width: max(150px, 100%);
        padding: 5px;
        border: 1px solid #bdc8d3;
        border-radius: 7px;
        background: #fff;
        box-shadow: 0 10px 28px rgba(23,34,49,.2);
    }
    .action-dropdown.align-right .action-menu { right: 0; left: auto; }
    .action-menu button {
        width: 100%;
        min-height: 32px;
        padding: 6px 8px;
        border: 0;
        background: transparent;
        text-align: left;
        white-space: nowrap;
    }
    .action-menu button:hover { color: #0d6099; background: #eaf4fb; }
    .action-list button {
        min-width: 0;
        min-height: 38px;
        gap: 6px;
        padding: 6px 7px;
        overflow: hidden;
        font-size: 11px;
        white-space: nowrap;
    }
    .action-list button span { width: 17px; flex: 0 0 17px; }
    .final-actions .info-action { grid-column: 3; justify-content: center; }
    .info-copy { display: grid; gap: 6px; }
    .info-copy strong { color: #263443; font-size: 12px; }
    .info-copy p { margin: 0 0 8px; }
    .info-copy a { color: #176fae; font-weight: 700; text-decoration: none; }

    /* Existing Penpa modal content, presented as a Svelte-themed dialog. */
    :global(.svelte-home .modal),
    :global(.svelte-home #modal-image),
    :global(.svelte-home #modal-bg-image),
    :global(.svelte-home #modal-save),
    :global(.svelte-home #modal-newsize),
    :global(.svelte-home #modal-input),
    :global(.svelte-home #modal-load),
    :global(.svelte-home #modal-keys),
    :global(.svelte-home #modal-save2),
    :global(.svelte-home #modal-save-tag),
    :global(.svelte-home #modal-replay) {
        z-index: 1000;
        overflow: hidden;
        background: rgba(15, 24, 35, .62);
        backdrop-filter: blur(5px);
    }
    :global(.svelte-home .modal-content),
    :global(.svelte-home #modal-image-content),
    :global(.svelte-home #modal-save-content),
    :global(.svelte-home #modal-save2-content),
    :global(.svelte-home #modal-replay-content),
    :global(.svelte-home #modal-input-content),
    :global(.svelte-home #modal-load-content),
    :global(.svelte-home #modal-save-tag-content) {
        top: 50%;
        transform: translateY(-50%);
        box-sizing: border-box;
        max-width: min(720px, calc(100vw - 40px));
        max-height: calc(100vh - 40px);
        margin: 0 auto;
        padding: 50px 22px 20px;
        border: 1px solid #cbd5df;
        border-radius: 12px;
        overflow: hidden auto;
        color: #1d2633;
        background: #fff;
        box-shadow: 0 24px 70px rgba(0,0,0,.3);
    }
    :global(.svelte-home .modal-header) {
        height: 40px;
        line-height: 40px;
        border-radius: 11px 11px 0 0;
        color: #fff;
        background: #172231;
        font-size: 15px;
        font-weight: 700;
    }
    :global(.svelte-home .modal-content button),
    :global(.svelte-home .modal-content input[type="button"]),
    :global(.svelte-home .modal .nb_button input[type="button"]),
    :global(.svelte-home .modal .nb_button button) {
        min-height: 34px;
        padding: 7px 12px;
        border: 1px solid #bfcad4;
        border-radius: 6px;
        color: #263443;
        background: #f7f9fb;
    }
    :global(.svelte-home .modal .nb_button input[type="button"]:hover),
    :global(.svelte-home .modal .nb_button button:hover) {
        border-color: #176fae;
        color: #0d6099;
        background: #eaf4fb;
    }
    :global(.svelte-home .modal input[type="text"]),
    :global(.svelte-home .modal input[type="number"]),
    :global(.svelte-home .modal textarea),
    :global(.svelte-home .modal select) {
        box-sizing: border-box;
        max-width: 100%;
        padding: 8px 10px;
        border: 1px solid #bdc8d3;
        border-radius: 6px;
        color: #263443;
        background: #fbfcfd;
    }
    :global(.svelte-home .modal input:focus),
    :global(.svelte-home .modal textarea:focus),
    :global(.svelte-home .modal select:focus) {
        border-color: #176fae;
        outline: 3px solid rgba(23,111,174,.13);
    }
    :global(.svelte-home .modal-subheader) {
        padding: 7px 9px;
        border-radius: 5px;
        color: #25425a;
        background: #edf3f7;
    }

    /* Focused Svelte dialogs and matching Penpa confirmation styling. */
    .studio-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1200;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(15,24,35,.62);
        backdrop-filter: blur(5px);
    }
    .legacy-controls-host { display: grid; gap: 14px; }
    .legacy-panel-host { min-width: 0; min-height: 260px; overflow: auto; }
    :global(.svelte-home .legacy-panel-host #float-key) {
        position: static !important;
        inset: auto !important;
        display: block !important;
        width: 100% !important;
        max-width: 100%;
        min-height: 255px;
        box-shadow: none;
        transform: none !important;
    }
    :global(.svelte-home .legacy-panel-host #close-float-panel) { display: none !important; }
    :global(.svelte-home .legacy-panel-host #float-key-body) { box-sizing: border-box; width: 100%; min-height: 220px; overflow: visible; }
    :global(.svelte-home .legacy-panel-host #float-canvas) { max-width: 100%; height: auto; }
    :global(.svelte-home .legacy-controls-host #legacy_mode_controls),
    :global(.svelte-home .legacy-controls-host #submode_button),
    :global(.svelte-home .legacy-controls-host #stylemode_button) {
        display: block !important;
        padding: 9px;
        border: 1px solid #d7dee5;
        border-radius: 7px;
        color: #263443;
        background: #f8fafc;
        line-height: 2.5;
    }
    :global(.svelte-home .legacy-controls-host .label_mode) { color: #536170; font-weight: 750; }
    :global(.svelte-home .legacy-controls-host input[type="radio"]) { position: absolute; opacity: 0; pointer-events: none; }
    :global(.svelte-home .legacy-controls-host input[type="radio"] + label) {
        display: inline-flex;
        min-height: 28px;
        box-sizing: border-box;
        align-items: center;
        margin: 2px;
        padding: 3px 8px;
        border: 1px solid #bdc8d3;
        border-radius: 5px;
        color: #344353;
        background: #fff;
        cursor: pointer;
        font-size: 10px;
        line-height: 1.2;
    }
    :global(.svelte-home .legacy-controls-host input[type="radio"]:checked + label) {
        color: #fff;
        border-color: #176fae;
        background: #176fae;
    }
    :global(.svelte-home .legacy-controls-host input[type="radio"]:focus-visible + label) {
        outline: 3px solid rgba(23,111,174,.18);
    }
    .studio-modal {
        position: relative;
        box-sizing: border-box;
        width: min(480px, calc(100vw - 40px));
        padding: 24px;
        border: 1px solid #cbd5df;
        border-radius: 12px;
        color: #1d2633;
        background: #fff;
        box-shadow: 0 24px 70px rgba(0,0,0,.3);
    }
    .studio-modal h2 {
        margin: 0 34px 6px 0;
        color: #172231;
        font-size: 19px;
        letter-spacing: 0;
        text-transform: none;
    }
    .studio-modal p { margin: 0 0 18px; color: #64717e; font-size: 13px; }
    .studio-modal-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 6px;
        color: #65727f;
        background: transparent;
        font-size: 22px;
    }
    .modal-field { display: grid; gap: 7px; margin-top: 14px; color: #536170; font-size: 12px; font-weight: 700; }
    .modal-field input { box-sizing: border-box; width: 100%; padding: 9px 10px; border: 1px solid #bdc8d3; border-radius: 6px; color: #263443; background: #fff; }
    .choice-group { display: grid; grid-template-columns: repeat(2, 1fr); }
    .choice-group.three { grid-template-columns: repeat(3, 1fr); }
    .choice-group button { min-height: 36px; border: 1px solid #bdc8d3; border-right: 0; background: #f7f9fb; }
    .choice-group button:first-child { border-radius: 6px 0 0 6px; }
    .choice-group button:last-child { border-right: 1px solid #bdc8d3; border-radius: 0 6px 6px 0; }
    .studio-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
    .studio-modal-actions button {
        min-width: 90px;
        min-height: 36px;
        padding: 7px 14px;
        border: 1px solid #bdc8d3;
        border-radius: 6px;
        background: #f7f9fb;
    }
    .studio-modal-actions button.primary { color: #fff; border-color: #176fae; background: #176fae; }
    :global(.svelte-home .swal2-container) { z-index: 1300; background: rgba(15,24,35,.62); backdrop-filter: blur(5px); }
    :global(.svelte-home .swal2-popup) { border: 1px solid #cbd5df; border-radius: 12px; box-shadow: 0 24px 70px rgba(0,0,0,.3); }
    :global(.svelte-home .swal2-title) { color: #172231; font-size: 20px; }
    :global(.svelte-home .swal2-confirm),
    :global(.svelte-home .swal2-cancel) { min-height: 36px; border-radius: 6px !important; }

    /* Native Penpa keypad remains a user-invoked floating panel. */
    :global(.svelte-home #float-key) { z-index: 1150; box-sizing: border-box; border: 1px solid #bdc8d3; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 16px 40px rgba(23,34,49,.25); }
    :global(.svelte-home #float-key-header) { box-sizing: border-box; height: 36px; border-radius: 0; color: #263443; background: #edf3f7; cursor: move; }
    :global(.svelte-home #float-key-header h4) { margin: 0; line-height: 36px; font-size: 12px; }
    :global(.svelte-home #float-key-body) { padding: 8px; background: #fff; }
    :global(.svelte-home #float-key-menu li),
    :global(.svelte-home #float-key-select li) { border-radius: 5px; color: #263443; background: #f3f6f8; }
    :global(.svelte-home #float-canvas) { border-radius: 7px; }

    .studio-shell.dark { background: #17202a; }
    .studio-shell.dark section:not(.board-column) { color: #dde6ed; border-color: #40505f; background: #263340; }
    .studio-shell.dark .board-column, .studio-shell.dark .board-host { border-color: #40505f; background: #1b2630; }
    .studio-shell.dark .board-busy-overlay { color: #eef4f8; background: rgba(27, 38, 48, .86); }
    .studio-shell.dark .board-busy-overlay small { color: #b8c5cf; }
    .studio-shell.dark :global(.board-host #puzzle-container) { background: #1b2630; }
    .studio-shell.dark h2, .studio-shell.dark .control-label { color: #aebdca; }
    .studio-shell.dark .action-list button { color: #e1e8ee; border-color: #4b5a68; background: #32414f; }
    .studio-shell.dark :global(.log-host .sudoku-solver-log) { color: #dce6ef; border-color: #40505f; background: #263340; }
    .studio-shell.dark :global(.log-host .sudoku-solver-log-header) { color: #eef4f8; border-color: #40505f; background: #2e3d4a; }
    .studio-shell.dark :global(#sudoku-solver-status) { color: #b8c5cf; }
    .studio-shell.dark :global(.log-host #sudoku-solver-log-output) { color: #d5dfe7; border-color: #465563; background: #1f2b35 !important; }
    .studio-shell.dark :global(#float-key),
    .studio-shell.dark :global(#float-key-body) { color: #dde6ed; background: #263340; }
    .studio-shell.dark :global(#float-key-header) { color: #eef4f8; background: #32414f; }
    .studio-shell.dark :global(#canvas) { background: #fff !important; }
    .studio-shell.dark .tool-help strong { color: #eef4f8; }
    .studio-shell.dark .tool-help p { color: #bac6cf; }
    .studio-shell.dark .tool-help > div + div { border-color: #40505f; }
    .studio-shell.dark .action-group { border-color: #40505f; }
    .studio-shell.dark .variant-rule-preview { color: #c2ced7; border-color: #40505f; background: #263340; }
    .studio-shell.dark .variant-rule-preview strong { color: #eef4f8; }
    .studio-shell.dark .action-menu { border-color: #4b5a68; background: #263340; }
    .studio-shell.dark .action-menu button:hover { color: #fff; background: #3a4a58; }
    .studio-shell.dark :global(.legacy-controls-host #legacy_mode_controls),
    .studio-shell.dark :global(.legacy-controls-host #submode_button),
    .studio-shell.dark :global(.legacy-controls-host #stylemode_button) {
        color: #e1e8ee;
        border-color: #4b5a68;
        background: #32414f;
    }
    .studio-shell.dark :global(.legacy-controls-host .label_mode) { color: #b7c5cf; }
    .studio-shell.dark :global(.legacy-controls-host input[type="radio"] + label) {
        color: #dce5ec;
        border-color: #536473;
        background: #263340;
    }
    .studio-shell.dark :global(.legacy-controls-host input[type="radio"]:checked + label) {
        color: #fff;
        border-color: #2b8bc7;
        background: #176fae;
    }
</style>
