<script lang="ts">
  import * as d from "@tauri-apps/api/dialog";
  import * as fs from "@tauri-apps/api/fs";
  import { homeDir } from "@tauri-apps/api/path";
  import { convertFileSrc } from "@tauri-apps/api/tauri";
  // console.log(fs.readDir())

  const settings = {
    audioDirPath: "",
    duration: 10,
    ...JSON.parse(localStorage.getItem("settings") || "{}"),
  } as { audioDirPath: string; duration: number };

  let files = [];
  const selectAudioDir = async () => {
    const dir = (await d.open({ directory: true })) as string | null;
    if (!dir) return;
    settings.audioDirPath = dir;
    save();
    load();
  };

  const save = () => {
    if (isNaN(settings.duration) || settings.duration < 1) {
      settings.duration = 1;
    }
    localStorage.setItem("settings", JSON.stringify(settings));
  };
  const load = async () => {
    if (!settings.audioDirPath) return;
    files = await fs.readDir(settings.audioDirPath);
  };
  load();

  let audioElmIndex = 0;
  const play = async () => {
    const files = fs.readDir(settings.audioDirPath);
  };

  const audios = Array(2).fill(document.createElement("audio"));
</script>

{#if !settings.audioDirPath}
  <button on:click={selectAudioDir}>select audio dir</button>
{:else}
  <button>play</button>
  <button>stop</button>
  <hr />
  <div>
    <table>
      <tr>
        <td>audioDir</td>
        <td>
          <button on:click={selectAudioDir}>{settings.audioDirPath}</button>
        </td>
      </tr>
      <tr>
        <td>duration</td>
        <td>
          <input
            type="number"
            min="1"
            pattern="0-9"
            bind:value={settings.duration}
            on:change={save} />
        </td>
      </tr>
    </table>
  </div>
{/if}
