<script lang="ts">
  type PanelOption = {
    value: string;
    label: string;
    action?: "backspace" | "delete";
    sym?: string;
    num?: number | number[];
  };

  export let title = "Input panel";
  export let options: PanelOption[] = [];
  export let selected = new Set<string>();
  export let darkTheme = false;
  export let symbolRenderer: (
    node: HTMLCanvasElement,
    params: { sym?: string; num?: number | number[]; darkTheme?: boolean; size?: number },
  ) => { update?: (params: { sym?: string; num?: number | number[]; darkTheme?: boolean; size?: number }) => void };
  export let onSelect: (option: PanelOption) => void;
  export let onClose: () => void;

  let left: number | null = null;
  let top = 110;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function startDrag(event: PointerEvent) {
    if ((event.target as HTMLElement).closest("button")) return;
    const panel = (event.currentTarget as HTMLElement).closest<HTMLElement>(".floating-input-panel");
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    left = rect.left;
    top = rect.top;
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    const move = (moveEvent: PointerEvent) => {
      left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, moveEvent.clientX - dragOffsetX));
      top = Math.max(8, Math.min(window.innerHeight - 60, moveEvent.clientY - dragOffsetY));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
    event.preventDefault();
  }
</script>

<section
  class="floating-input-panel"
  class:dark={darkTheme}
  style:left={left === null ? undefined : `${left}px`}
  style:top={`${top}px`}
  aria-label={title}
>
  <div class="panel-handle" role="toolbar" tabindex="0" aria-label="Drag large input panel" on:pointerdown={startDrag}>
    <strong>{title}</strong>
    <button type="button" aria-label="Close large input panel" title="Close" on:click={onClose}>×</button>
  </div>
  <div class="large-button-grid">
    {#each options as option}
      <button
        type="button"
        class:selected={selected.has(option.value)}
        class:panel-action={Boolean(option.action)}
        class:erase-action={option.action === "backspace"}
        class:clear-action={option.action === "delete"}
        title={option.label}
        aria-label={option.label}
        on:pointerdown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSelect(option);
        }}
      >
        {#if option.sym && option.num !== undefined}
          <canvas use:symbolRenderer={{ sym: option.sym, num: option.num, darkTheme, size: 42 }}></canvas>
        {:else}
          {option.label}
        {/if}
      </button>
    {/each}
  </div>
</section>

<style>
  .floating-input-panel {
    position: fixed;
    top: 110px;
    right: 24px;
    z-index: 1600;
    width: 284px;
    overflow: hidden;
    border: 1px solid #aebbc6;
    border-radius: 10px;
    background: #f7fafc;
    box-shadow: 0 14px 38px rgba(15, 28, 40, 0.28);
  }
  .panel-handle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 38px;
    padding: 5px 8px 5px 12px;
    color: #fff;
    background: #324b5e;
    cursor: move;
    touch-action: none;
    user-select: none;
  }
  .panel-handle strong { font-size: 12px; }
  .panel-handle button {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: 5px;
    color: #fff;
    background: transparent;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
  }
  .panel-handle button:hover { background: rgba(255, 255, 255, 0.16); }
  .large-button-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
    padding: 10px;
  }
  .large-button-grid > button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    height: 58px;
    padding: 4px;
    border: 1px solid #b9c5cf;
    border-radius: 7px;
    color: #253746;
    background: #f1f3f5;
    font-size: 24px;
    font-weight: 750;
    cursor: pointer;
    touch-action: manipulation;
  }
  .large-button-grid > button:hover,
  .large-button-grid > button.selected {
    color: #1676ac;
    border-color: #1676ac;
    background: #f1f3f5;
    box-shadow: inset 0 0 0 2px rgba(22, 118, 172, 0.16);
  }
  .large-button-grid > button.panel-action {
    color: #9b3737;
    font-size: 15px;
  }
  .large-button-grid > button.erase-action { grid-column: 3; }
  .large-button-grid > button.clear-action { grid-column: 4; }
  canvas { display: block; pointer-events: none; }
  .dark {
    border-color: #536473;
    background: #263440;
  }
  .dark .panel-handle { background: #172633; }
  .dark .large-button-grid > button {
    color: #17212a;
    border-color: #738391;
    background: #f1f3f5;
  }
  .dark .large-button-grid > button.selected { color: #1676ac; border-color: #2b8bc7; }
</style>
