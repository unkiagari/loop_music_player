<script lang="ts">
  import * as d from "@tauri-apps/api/dialog";
  import * as fs from "@tauri-apps/api/fs";
  import { homeDir } from "@tauri-apps/api/path";
  import { convertFileSrc } from "@tauri-apps/api/tauri";
  import { appWindow, LogicalSize } from "@tauri-apps/api/window";
  import { onDestroy } from "svelte";
  import LoopAudio from "./LoopAudio";
  import TitleBar from "./TitleBar.svelte";
  // console.log(fs.readDir())
  const loopAudio = new LoopAudio();
  const settings = {
    audioDirPath: "",
    duration: 10,
    crossfade: 3,
    volume: 0.5,
    ...JSON.parse(localStorage.getItem("settings") || "{}"),
  } as {
    audioDirPath: string;
    duration: number;
    crossfade: number;
    volume: number;
  };

  let isShowSettings = false;
  let isPlaying = false;
  loopAudio.onChangePlayState = (_isPlaying) => {
    isPlaying = _isPlaying;
  };

  const selectAudioDir = async () => {
    const dir = (await d.open({
      directory: true,
      defaultPath: settings.audioDirPath || null,
    })) as string | null;
    if (!dir) return;
    settings.audioDirPath = dir;
    save();
    load();
  };

  const save = () => {
    if (isNaN(settings.duration) || settings.duration < 1) {
      settings.duration = 1;
    }
    if (isNaN(settings.crossfade) || settings.crossfade < 1) {
      settings.crossfade = 1;
    }
    if (isNaN(settings.volume)) {
      settings.volume = 0.5;
    }
    settings.volume = Math.min(1, Math.max(0, settings.volume));

    localStorage.setItem("settings", JSON.stringify(settings));
  };
  const load = async () => {
    if (!settings.audioDirPath) {
      isShowSettings = true;
      return;
    }
    loopAudio.files = (await fs.readDir(settings.audioDirPath))
      .filter((v) => v.name.endsWith(".mp3"))
      .map((v) => ({
        name: v.name,
        path: convertFileSrc(v.path)
          .replace(/%2F/g, "/")
          // .replace(/%5C/g, "/")
          // .replace(/%3A/g, ":")
          .replace(/\\/g, "/"),
      }));

    loopAudio.volume = settings.volume;
    loopAudio.crossfade = 3;
    loopAudio.audioDuration = settings.duration;
  };
  const saveAndLoad = () => {
    save();
    load();
  };
  load();

  onDestroy(() => loopAudio.stop());

  $: {
    const size =
      isShowSettings || !settings.audioDirPath
        ? new LogicalSize(250, 180)
        : new LogicalSize(250, 72);
    appWindow.setSize(size);
  }

  const getDirName = (path: string) => {
    const f = path.replace(/\\/g, "/").split("/");
    return f[f.length - 1] || "none";
  };
</script>

<div class="wrap">
  <TitleBar />
  {#if settings.audioDirPath}
    <div class="main-commands">
      <button class:active={isPlaying} on:click={() => loopAudio.play()}>
        <i class="icon-play-outline" /></button>
      <button on:click={() => loopAudio.stop()}>
        <i class="icon-stop-outline" />
      </button>
      <button
        class:active={isShowSettings}
        on:click={() => (isShowSettings = !isShowSettings)}>
        <i class="icon-cog-outline" />
      </button>
    </div>
  {/if}

  {#if isShowSettings}
    <div>
      <table>
        <tr>
          <td>audioDir</td>
          <td>
            <button class="selectDirBtn" on:click={selectAudioDir}>
              {getDirName(settings.audioDirPath)}
            </button>
          </td>
        </tr>
        <tr>
          <td>duration</td>
          <td>
            <input
              type="number"
              min="1"
              bind:value={settings.duration}
              on:change={saveAndLoad} />
          </td>
        </tr>
        <tr>
          <td>crossfade</td>
          <td>
            <input
              type="range"
              min="1"
              max="5"
              bind:value={settings.crossfade}
              on:change={saveAndLoad} />
            {settings.crossfade}
          </td>
        </tr>
        <tr>
          <td>volume</td>
          <td>
            <input
              type="range"
              min="0"
              max="1"
              step=".05"
              bind:value={settings.volume}
              on:input={saveAndLoad} />
            {settings.volume}
          </td>
        </tr>
      </table>
    </div>
  {/if}
</div>

<style lang="scss">
  td > input {
    vertical-align: middle;
  }

  .wrap {
    background: transparent;
    border: 2px solid white;
    border-radius: var(--window-radius);
    overflow: hidden;
    background: #333;
  }

  .main-commands {
    display: flex;
    button {
      flex-grow: 1;
      font-size: 32px;
      margin: 0;
      background-color: white;
      &.active {
        background-color: royalblue;
        color: #eee;
      }
      &:hover {
        background: white;
        color: royalblue;
      }
    }
  }

  tr > td:first-child {
    padding: 0 0.5em;
  }
</style>
