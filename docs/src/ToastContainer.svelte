<script lang="ts">
  export type ToastType = "success" | "error" | "warning" | "info";
  export interface ToastItem {
    id: number;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
  }

  export let toasts: ToastItem[] = [];
  export let onDismiss: (id: number) => void;
</script>

<div class="toast-viewport" aria-live="polite">
  {#each toasts as toast (toast.id)}
    <div class="toast-item toast-{toast.type}">
      <div class="toast-icon">
        {#if toast.type === "success"}✓{:else if toast.type === "error"}✕{:else if toast.type === "warning"}⚠{:else}ℹ{/if}
      </div>
      <div class="toast-body">
        {#if toast.title}<div class="toast-title">{toast.title}</div>{/if}
        <div class="toast-message">{toast.message}</div>
      </div>
      <button type="button" class="toast-close-btn" on:click={() => onDismiss(toast.id)}>×</button>
      <div
        class="toast-progress-bar"
        style="animation-duration: {toast.duration || 4000}ms;"
      ></div>
    </div>
  {/each}
</div>

<style>
  .toast-viewport {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: none;
    width: 90%;
    max-width: 480px;
  }

  .toast-item {
    position: relative;
    overflow: hidden;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px 14px;
    border-radius: 10px;
    background: #ffffff;
    color: #1e293b;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.08);
    border-left: 5px solid #3b82f6;
    font-size: 13.5px;
    line-height: 1.4;
    width: 100%;
    box-sizing: border-box;
    animation: toastSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(html.dark) .toast-item {
    background: #1e293b;
    color: #f8fafc;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  }

  .toast-item.toast-success { border-left-color: #22c55e; }
  .toast-item.toast-error { border-left-color: #ef4444; }
  .toast-item.toast-warning { border-left-color: #f59e0b; }
  .toast-item.toast-info { border-left-color: #3b82f6; }

  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
    font-weight: bold;
    font-size: 13px;
  }
  .toast-success .toast-icon { background: #dcfce7; color: #15803d; }
  .toast-error .toast-icon { background: #fee2e2; color: #b91c1c; }
  .toast-warning .toast-icon { background: #fef3c7; color: #b45309; }
  .toast-info .toast-icon { background: #dbeafe; color: #1d4ed8; }

  :global(html.dark) .toast-success .toast-icon { background: #14532d; color: #86efac; }
  :global(html.dark) .toast-error .toast-icon { background: #7f1d1d; color: #fca5a5; }
  :global(html.dark) .toast-warning .toast-icon { background: #78350f; color: #fde68a; }
  :global(html.dark) .toast-info .toast-icon { background: #1e3a8a; color: #93c5fd; }

  .toast-body {
    flex: 1;
  }
  .toast-title {
    font-weight: 600;
    font-size: 13.5px;
    margin-bottom: 2px;
  }
  .toast-message {
    font-size: 13px;
  }
  .toast-close-btn {
    background: transparent;
    border: none;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
    padding: 4px;
    font-size: 18px;
    line-height: 1;
  }
  .toast-close-btn:hover {
    opacity: 1;
  }

  .toast-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    animation: toastCountdown linear forwards;
  }

  .toast-success .toast-progress-bar { background: #22c55e; }
  .toast-error .toast-progress-bar { background: #ef4444; }
  .toast-warning .toast-progress-bar { background: #f59e0b; }
  .toast-info .toast-progress-bar { background: #3b82f6; }

  @keyframes toastSlideDown {
    from {
      opacity: 0;
      transform: translateY(-16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes toastCountdown {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
</style>
