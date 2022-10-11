<script lang="ts">
  import { appWindow } from "@tauri-apps/api/window";
</script>

<div data-tauri-drag-region class="titlebar">
  <div class="title">LoopMusicPlayer</div>

  <div class="navs">
    <button class="titlebar-button" on:click={() => appWindow.minimize()}>
      <i class="icon-resize-small" />
    </button>
    <button class="titlebar-button" on:click={() => appWindow.close()}>
      <i class="icon-cancel" />
    </button>
  </div>
</div>

<style>
  .titlebar {
    height: 25px;
    background: var(--title-bar--bg);
    color: var(--title-bar--fg);
    user-select: none;
    display: flex;
    justify-content: flex-between;
  }
  .title {
    flex-grow: 1;
    line-height: 25px;
    padding: 0 0.5em;
    pointer-events: none;
  }
  .titlebar-button {
    appearance: none;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 25px;
    height: 25px;
    background: transparent;
    color: var(--title-bar--fg);
  }
  .titlebar-button:hover {
    background: var(--title-bar-btn--bg-hober);
  }

  i {
    font-size: 16px;
  }
</style>
