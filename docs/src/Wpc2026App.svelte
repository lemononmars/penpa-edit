<script lang="ts">
  import bookletText from './wpc2026/pages.txt?raw';
  import { bookletUrl, rounds } from './wpc2026/content';
  import WpcTeamEditor from './WpcTeamEditor.svelte';
  import MiniLaxmanPractice from './MiniLaxmanPractice.svelte';

  const editorRounds = rounds.filter((round) => round.team || round.number === 10);
  const pages = bookletText.replace(/\r/g, '').split('\f').filter((text) => text.trim());
  const totalPages = pages.length;
  const initialPage = Number(new URLSearchParams(location.search).get('page'));
  let page = Number.isInteger(initialPage) && initialPage >= 1 && initialPage <= totalPages ? initialPage : 1;
  let query = '';
  let view: 'page' | 'text' = 'page';
  const initialEditor = Number(new URLSearchParams(location.search).get('editor'));
  let showEditor = editorRounds.some((round) => round.number === initialEditor);
  let showPractice = new URLSearchParams(location.search).get('practice') === 'laxman';
  let selectedEditor = showEditor ? initialEditor : 8;
  $: activeRound = rounds.find((round) => page >= round.firstPage && page <= round.lastPage);
  $: matches = query.trim()
    ? pages.map((text, index) => ({ page: index + 1, text })).filter((item) => item.text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    : [];

  function goToPage(next: number) {
    showEditor = false;
    showPractice = false;
    page = Math.min(totalPages, Math.max(1, next));
    const url = new URL(location.href);
    url.searchParams.delete('editor');
    url.searchParams.delete('practice');
    url.searchParams.set('page', String(page));
    history.replaceState(null, '', url);
  }

  function headingFor(pageNumber: number) {
    if (pageNumber === 1) return 'Schedule and cover';
    if (pageNumber === 2) return 'What changed in version 2';
    if (pageNumber <= 4) return 'Competition rules and scoring';
    if (pageNumber <= 6) return 'Glossary';
    const round = rounds.find((item) => pageNumber >= item.firstPage && pageNumber <= item.lastPage);
    return round ? `Round ${String(round.number).padStart(2, '0')} · ${round.name}` : 'Booklet page';
  }
  function openEditor(number = 8) {
    showEditor = true;
    showPractice = false;
    selectedEditor = number;
    const url = new URL(location.href);
    url.searchParams.delete('page');
    url.searchParams.delete('practice');
    url.searchParams.set('editor', String(number));
    history.replaceState(null, '', url);
  }
  function openPractice() {
    showEditor = false;
    showPractice = true;
    const url = new URL(location.href);
    url.searchParams.delete('page');
    url.searchParams.delete('editor');
    url.searchParams.set('practice', 'laxman');
    history.replaceState(null, '', url);
  }

  function excerpt(text: string, needle: string) {
    const clean = text.replace(/\s+/g, ' ').trim();
    const at = clean.toLocaleLowerCase().indexOf(needle.trim().toLocaleLowerCase());
    const start = Math.max(0, at - 65);
    return `${start ? '…' : ''}${clean.slice(start, start + 180)}${start + 180 < clean.length ? '…' : ''}`;
  }
</script>

<svelte:head>
  <title>WPC 2026 · Instructions booklet</title>
  <meta name="description" content="Browse the WPC 2026 individual and team instructions, and sketch team round puzzles in construction workspaces." />
</svelte:head>

<div class="shell">
  <header>
    <div>
      <a class="home" href="/">Sudotoku</a><span class="divider">/</span><span>WPC 2026</span>
    </div>
    <a class="download" href={bookletUrl} target="_blank" rel="noreferrer">Open full booklet ↗</a>
  </header>

  <div class="hero">
    <p class="eyebrow">33rd World Puzzle Championship · Kolkata 2026</p>
    <h1>Instructions booklet</h1>
    <p>Individual and team rounds · Version 2, published 5 October 2026</p>
    <p class="source">Browse all 111 original pages, including diagrams and solutions. The searchable text is extracted from the booklet; use the original page for precise rules and layouts.</p>
    <div class="section-switch" role="tablist" aria-label="WPC 2026 sections">
      <button role="tab" aria-selected={!showEditor && !showPractice} class:chosen={!showEditor && !showPractice} onclick={() => goToPage(page)}>Booklet</button>
      <button role="tab" aria-selected={showPractice} class:chosen={showPractice} onclick={openPractice}>Mini Laxman Rekha</button>
      {#each editorRounds as round}
        <button role="tab" aria-selected={showEditor && selectedEditor === round.number} class:chosen={showEditor && selectedEditor === round.number} onclick={() => openEditor(round.number)}>
          <span class="tab-number">{String(round.number).padStart(2, '0')}</span> {round.name}
        </button>
      {/each}
    </div>
  </div>

  <div class="layout" class:editing={showEditor || showPractice}>
    <aside aria-label="Booklet navigation">
      <label for="search">Search the booklet</label>
      <input id="search" type="search" placeholder="Puzzle name or rule" bind:value={query} />
      {#if query.trim()}
        <p class="count">{matches.length} {matches.length === 1 ? 'page' : 'pages'} found</p>
        <div class="results">
          {#each matches as match}
            <button class:active={page === match.page} onclick={() => goToPage(match.page)}>
              <strong>Page {match.page} · {headingFor(match.page)}</strong>
              <span>{excerpt(match.text, query)}</span>
            </button>
          {:else}
            <p class="empty">No matching pages.</p>
          {/each}
        </div>
      {:else}
        <div class="nav-group">
          <p class="group-title">Start here</p>
          <button class:active={!showEditor && page === 1} onclick={() => goToPage(1)}>Schedule <span>1</span></button>
          <button class:active={!showEditor && page === 2} onclick={() => goToPage(2)}>Changes in v2 <span>2</span></button>
          <button class:active={!showEditor && page >= 3 && page <= 4} onclick={() => goToPage(3)}>Rules & scoring <span>3–4</span></button>
          <button class:active={!showEditor && page >= 5 && page <= 6} onclick={() => goToPage(5)}>Glossary <span>5–6</span></button>
        </div>
        {#each ['Thursday, 15 October', 'Friday, 16 October', 'Saturday, 17 October'] as day}
          <div class="nav-group">
            <p class="group-title">{day}</p>
            {#each rounds.filter((item) => item.day === day) as round}
              <button class:active={!showEditor && activeRound?.number === round.number} onclick={() => goToPage(round.firstPage)}>
                <span class="round-name"><small>{String(round.number).padStart(2, '0')}</small> {round.name}{round.team ? ' · Team' : ''}</span>
                <span>{round.firstPage}–{round.lastPage}</span>
              </button>
              {#if round.team || round.number === 10}<button class="editor-link" onclick={() => openEditor(round.number)}>↳ Construction editor <span>Open</span></button>{/if}
              {#if round.number === 10}<button class="editor-link" onclick={openPractice}>↳ Mini practice <span>Play</span></button>{/if}
            {/each}
          </div>
        {/each}
        <p class="note">Team round construction boards are local drafts. The booklet remains the source for official rules and examples.</p>
      {/if}
    </aside>

    <main>
      {#if showPractice}
        <MiniLaxmanPractice />
      {:else if showEditor}
        {#if selectedEditor === 10}
          <section class="loop-editor" aria-label="Round 10 Laxman Rekha editor">
            <div class="loop-editor-heading"><div><p class="eyebrow">INDIVIDUAL ROUND 10 · LOOP MASHUP</p><h2>Laxman Rekha · 25×25 editor</h2></div><a href="/wpc2026/laxman-rekha/" target="_blank" rel="noreferrer">Open full window ↗</a></div>
            <iframe title="Laxman Rekha 25 by 25 loop editor" src="/wpc2026/laxman-rekha/" allow="clipboard-write"></iframe>
          </section>
        {:else}
          {#key selectedEditor}<WpcTeamEditor initialRound={selectedEditor} />{/key}
        {/if}
      {:else}
      <div class="page-header">
        <div>
          <p class="eyebrow">PDF PAGE {page} OF {totalPages}</p>
          <h2>{headingFor(page)}</h2>
          {#if activeRound}
            <p class="meta">{activeRound.time} · {activeRound.minutes} minutes · {activeRound.points}{activeRound.number === 8 ? '+' : ''} points{activeRound.team ? ' · Team' : activeRound.playoffs ? ' · Playoffs' : ''}{activeRound.playoffs ? '' : ` · ${activeRound.bonus}× bonus`}</p>
          {/if}
        </div>
        <div class="pager">
          <button disabled={page === 1} onclick={() => goToPage(page - 1)} aria-label="Previous page">←</button>
          <label for="page-number" class="sr-only">Page number</label>
          <select id="page-number" value={page} onchange={(event) => goToPage(Number(event.currentTarget.value))}>
            {#each pages as _, index}<option value={index + 1}>{index + 1}</option>{/each}
          </select>
          <button disabled={page === totalPages} onclick={() => goToPage(page + 1)} aria-label="Next page">→</button>
        </div>
      </div>
      <div class="view-toggle" aria-label="Page view">
        <button class:chosen={view === 'page'} onclick={() => view = 'page'}>Original page</button>
        <button class:chosen={view === 'text'} onclick={() => view = 'text'}>Extracted text</button>
        <a href={`${bookletUrl}#page=${page}`} target="_blank" rel="noreferrer">Open page ↗</a>
      </div>
      {#if view === 'page'}
        {#key page}<img class="document" src={`/wpc2026/pages/page-${String(page).padStart(2, '0')}.jpg`} alt={`WPC 2026 instructions booklet, page ${page}`} />{/key}
      {:else}
        <pre class="transcript">{pages[page - 1]}</pre>
      {/if}
      <p class="credit">Source: WPC 2026 Instructions Booklet, version 2. Examples belong to their credited creators; non-commercial reference.</p>
      {/if}
    </main>
  </div>
</div>

<style>
  .section-switch{display:flex;gap:7px;margin-top:22px;overflow-x:auto;padding-bottom:5px}.section-switch button{font:inherit;font-size:13px;color:#285741;border:1px solid #b9c9bc;border-radius:6px;background:white;padding:10px 13px;cursor:pointer;white-space:nowrap;flex:none}.section-switch button.chosen{background:#285741;color:white;border-color:#285741}.tab-number{font-weight:700;margin-right:3px}.layout.editing{display:block}.layout.editing aside{display:none}.editor-link{padding-left:23px!important;color:#547b5e!important;font-size:12px!important}.loop-editor-heading{display:flex;justify-content:space-between;align-items:end;gap:20px;margin:0 0 15px}.loop-editor-heading h2{margin:0}.loop-editor-heading a{font-size:13px;white-space:nowrap}.loop-editor iframe{display:block;width:100%;height:max(780px,calc(100vh - 240px));border:1px solid #cbded1;border-radius:10px;background:#fff}
  :global(*){box-sizing:border-box}
  :global(body){margin:0;background:#f5f4ef;color:#20382e;font-family:Inter,Arial,sans-serif}
  :global(button),:global(input),:global(select){font:inherit}
  .shell{min-height:100vh}header{height:68px;border-bottom:1px solid #d9ddd4;display:flex;justify-content:space-between;align-items:center;padding:0 max(24px,calc((100vw - 1480px)/2));font-size:13px}header>div{display:flex;gap:11px;align-items:center;font-weight:700}.home{font-size:16px;letter-spacing:.08em;text-transform:uppercase}.divider{color:#a2aca1}.download{border:1px solid #b9c9bc;border-radius:6px;padding:9px 12px;text-decoration:none}a{color:#285741}.hero{max-width:1480px;margin:auto;padding:43px 24px 30px}.eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#607866;font-weight:700;margin:0 0 10px}h1{font-size:clamp(36px,4vw,58px);font-weight:500;letter-spacing:-.045em;margin:0 0 9px}.hero>p:not(.eyebrow){color:#61736a;margin:7px 0;line-height:1.55}.hero .source{font-size:13px;max-width:760px}.layout{max-width:1480px;margin:auto;padding:0 24px 60px;display:grid;grid-template-columns:315px minmax(0,1fr);gap:28px}aside{align-self:start;max-height:calc(100vh - 28px);overflow-y:auto;position:sticky;top:14px;border:1px solid #dce1d6;background:white;border-radius:10px;padding:19px}aside label{display:block;font-size:13px;font-weight:700;margin-bottom:8px}input{width:100%;padding:11px 12px;border:1px solid #cbd6ca;border-radius:6px;outline-color:#4d8061}.nav-group{border-top:1px solid #e8ebe5;padding:9px 0}.nav-group:first-of-type{margin-top:19px}.group-title{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#738273;font-weight:700;margin:11px 7px}.nav-group button,.results button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;background:transparent;border:0;border-radius:6px;padding:9px 8px;cursor:pointer;color:#284436;font-size:13px}.nav-group button:hover,.results button:hover,.nav-group button.active,.results button.active{background:#eaf1e9}.nav-group button>span:last-child{color:#809082;font-size:11px;white-space:nowrap}.round-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.round-name small{font-size:10px;color:#7a907f;margin-right:5px}.note{font-size:11px;color:#7b897e;line-height:1.6;margin:13px 7px 2px}.count{font-size:12px;color:#6d806f;margin:10px 0}.results{max-height:calc(100vh - 200px);overflow:auto}.results button{display:block;border-bottom:1px solid #edf0ea;border-radius:0}.results strong{display:block;font-size:12px}.results span{display:block;color:#738273;line-height:1.45;margin-top:4px;font-size:11px}.empty{font-size:13px;color:#738273}main{min-width:0}.page-header{display:flex;align-items:end;justify-content:space-between;gap:20px;padding:9px 0 16px}h2{font-size:clamp(23px,2.4vw,32px);font-weight:550;letter-spacing:-.025em;margin:0}.meta{color:#6b7d6e;font-size:13px;margin:8px 0 0}.pager{display:flex;gap:6px;align-items:center}.pager button,.pager select,.view-toggle button{border:1px solid #cbd6ca;border-radius:6px;background:white;color:#285741;padding:8px 11px;cursor:pointer}.pager button:disabled{opacity:.4;cursor:default}.pager select{padding:8px}.view-toggle{display:flex;align-items:center;gap:5px;margin-bottom:10px}.view-toggle .chosen{background:#285741;color:white;border-color:#285741}.view-toggle a{font-size:12px;margin-left:auto}.document{width:100%;height:auto;border:1px solid #d4dcd2;background:#fff;border-radius:8px}.transcript{white-space:pre-wrap;overflow-wrap:anywhere;background:white;border:1px solid #d4dcd2;border-radius:8px;padding:24px;min-height:590px;font:13px/1.55 ui-monospace,Consolas,monospace;color:#28382e}.credit{font-size:11px;line-height:1.5;color:#79877a;margin:14px 0}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  /* Match the WSC 2026 practice room's page width, type, tabs, and controls. */
  :global(body){font-size:15px}
  .hero,.layout{max-width:1200px}
  header{padding-inline:max(24px,calc((100vw - 1200px)/2))}
  .hero{padding:30px 0 22px}
  h1{font-size:clamp(34px,4.5vw,60px);letter-spacing:-2px;margin:20px 0 9px}
  .eyebrow{letter-spacing:2px;color:#6a7869}
  .hero>p:not(.eyebrow){color:#74806d}
  .section-switch{gap:28px;margin-top:23px;padding:0;border-bottom:1px solid #d8ded4}
  .section-switch button{border:0;border-bottom:3px solid transparent;border-radius:0;background:transparent;color:#788171;padding:16px 0;font-size:15px}
  .section-switch button:hover{background:transparent;color:#315e43}
  .section-switch button.chosen{background:transparent;color:#20382e;border-color:#254c37;font-weight:700}
  .section-switch button:focus-visible,.nav-group button:focus-visible,.results button:focus-visible{outline:2px solid #315e43;outline-offset:2px}
  .layout{padding:0 0 60px;grid-template-columns:280px minmax(0,1fr);gap:24px}
  .pager button,.pager select,.view-toggle button,.download{border-color:#c5cec4;border-radius:7px;color:#20382e}
  .pager button:hover:not(:disabled),.view-toggle button:hover,.download:hover{background:#e8ede4}
  .view-toggle .chosen{background:#244d3b;color:#fff;border-color:#244d3b}
  .nav-group button:hover,.results button:hover,.nav-group button.active,.results button.active{background:#edf2e8}
  .loop-editor iframe{border-color:#dce1d6}
  @media(max-width:1260px){.hero,.layout{margin-inline:30px}header{padding-inline:30px}}
  @media(max-width:800px){header{padding:0 18px}.hero{padding:25px 0 18px}.hero,.layout{margin-inline:18px}.layout{padding:0 0 40px;display:block}aside{position:static;max-height:320px;overflow:auto;margin-bottom:18px}.section-switch{gap:24px}.page-header{align-items:start;flex-wrap:wrap}.document{height:auto}.transcript{min-height:460px;padding:14px}}
</style>
