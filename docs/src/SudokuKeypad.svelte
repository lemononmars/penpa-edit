<script lang="ts">
  import { battleLocale, t as i18nT } from "./battle/i18n";
  export let size = 9;
  export let mode: "normal" | "center" | "corner" = "normal";
  export let disabled = false;
  export let showClear = false;
  export let onDigit: (digit: number) => void = () => {};
  export let onMode: (mode: "normal" | "center" | "corner") => void = () => {};
  export let onClear: () => void = () => {};
  $: locale = $battleLocale;
  $: t = (key: string) => (locale, i18nT(key));
</script>

<div class="sudoku-keypad" aria-label={t("sudokuKeypad")}>
  <button class:active={mode === "normal"} class="mode-normal" {disabled} aria-label={t("normalDigits")} title={`${t("normalDigits")} (Z)`} on:click={() => onMode("normal")}><span class="note-icon"><b>1</b></span><kbd>z</kbd></button>
  <button class:active={mode === "center"} class="mode-center" {disabled} aria-label={t("centerNotes")} title={`${t("centerNotes")} (X)`} on:click={() => onMode("center")}><span class="note-icon"><small>23</small></span><kbd>x</kbd></button>
  <button class:active={mode === "corner"} class="mode-corner" {disabled} aria-label={t("cornerNotes")} title={`${t("cornerNotes")} (C)`} on:click={() => onMode("corner")}><span class="note-icon corner-numbers"><small>4</small><small>5</small><small>6</small><small>7</small></span><kbd>c</kbd></button>
  {#each [1,2,3,4,5,6,7,8,9] as digit}
    {#if digit <= size}<button class={`digit digit-${digit}`} {disabled} on:click={() => onDigit(digit)}>{digit}</button>{/if}
  {/each}
  {#if showClear}<button class="clear-key" {disabled} aria-label={t("clearSelectedCell")} title={t("clear")} on:click={onClear}>×</button>{/if}
</div>

<style>
  .sudoku-keypad{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:6px;width:100%}
  button{position:relative;min-height:48px;border:1px solid #b9c6cf;border-radius:8px;background:#f8fafb;color:#243642;font:inherit;cursor:pointer}
  button:hover:not(:disabled){border-color:#1688ca;background:#eef8fd}button:disabled{cursor:not-allowed;opacity:.45}button.active{border-color:#1688ca;background:#dff3ff;box-shadow:inset 0 0 0 1px #1688ca}
  .digit{font-size:25px;font-weight:700}.mode-normal{grid-column:1;grid-row:4}.mode-center{grid-column:2;grid-row:4}.mode-corner{grid-column:3;grid-row:4}.clear-key{grid-column:3;grid-row:4;font-size:24px}.clear-key~.mode-corner{display:none}
  .note-icon{display:flex;align-items:center;justify-content:center;min-height:24px}.note-icon b{font-size:20px}.note-icon small{font-size:11px}.corner-numbers{display:grid;grid-template-columns:repeat(2,9px);line-height:9px}
  kbd{position:absolute;right:4px;bottom:2px;border:0;background:transparent;color:#81909b;font-size:9px}
  :global(.dark) button{border-color:#485967;background:#25333e;color:#edf3f6}:global(.dark) button:hover:not(:disabled){border-color:#4fb8f5;background:#304b5c;color:#fff}:global(.dark) button.active{border-color:#4fb8f5;background:#173f55}
  @media(max-width:700px){.sudoku-keypad{grid-template-columns:repeat(4,52px);grid-template-rows:repeat(3,52px);gap:5px;width:max-content}.sudoku-keypad button{width:52px;height:52px;min-height:0}.digit{font-size:29px}.mode-normal{grid-column:4;grid-row:1}.mode-center{grid-column:4;grid-row:2}.mode-corner{grid-column:4;grid-row:3}kbd{display:none}}
</style>
