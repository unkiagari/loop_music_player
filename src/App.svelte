<script lang="ts">
  import * as d from "@tauri-apps/api/dialog";
  import * as fs from "@tauri-apps/api/fs";
  import { homeDir } from "@tauri-apps/api/path";
  import { convertFileSrc } from "@tauri-apps/api/tauri";
  import { appWindow, LogicalSize } from "@tauri-apps/api/window";
  import { onDestroy } from "svelte";
  import LoopAudio from "./LoopAudio";
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

  let isPlaying = false;
  loopAudio.onChangePlayState = (_isPlaying) => {
    isPlaying = _isPlaying;
  };

  const selectAudioDir = async () => {
    const dir = (await d.open({
      directory: true,
      defaultPath: settings.audioDirPath,
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
    if (!settings.audioDirPath) return;
    loopAudio.files = (await fs.readDir(settings.audioDirPath))
      .filter((v) => v.name.endsWith(".mp3"))
      .map((v) => ({
        name: v.name,
        path: convertFileSrc(v.path).replace(/%2F/g, "/"),
      }));
    loopAudio.crossfade = 3;
    loopAudio.audioDuration = settings.duration;
  };
  load();

  onDestroy(() => loopAudio.stop());

  let isShowSettings = false;
  $: {
    const barSize = 25;
    const size = isShowSettings
      ? new LogicalSize(250, 200 + barSize)
      : new LogicalSize(250, 40 + barSize);
    appWindow.setSize(size);
  }

  const getDirName = (path: string) => {
    const f = path.split("/");
    return f[f.length - 1];
  };
</script>

{#if settings.audioDirPath}
  <button class:active={isPlaying} on:click={() => loopAudio.play()}
    >play</button>
  <button on:click={() => loopAudio.stop()}>stop</button>
  <button
    class:active={isShowSettings}
    on:click={() => (isShowSettings = !isShowSettings)}>settings</button>
{/if}

{#if isShowSettings || !settings.audioDirPath}
  <hr />
  <div>
    <table>
      <tr>
        <td>audioDir</td>
        <td>
          <button on:click={selectAudioDir}
            >{getDirName(settings.audioDirPath)}</button>
        </td>
      </tr>
      <tr>
        <td>duration</td>
        <td>
          <input
            type="number"
            min="1"
            bind:value={settings.duration}
            on:change={save} />
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
            on:change={save} />
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
            on:change={save} />
          {settings.volume}
        </td>
      </tr>
    </table>
  </div>
{/if}

<style>
  td > input {
    vertical-align: middle;
  }
</style>
