import { Gapless5 } from "@regosen/gapless-5"


interface IFile {
  name: string
  path: string
}
export default class LoopAudio {
  _volume = .5
  get volume() { return this._volume }
  set volume(v) {
    if (this.intervalId === 0) {
      this.audios.forEach((audio) => {
        if (audio.isPlaying()) audio.volume = v;
      });
    }
    this._volume = v
  }

  crossfade = 3
  audioDuration = 10

  audioElmIndex = 0
  audioFileIndex = 0

  audios = Array(2).
    fill(0).map(v => {
      const audio = new Gapless5({
        loop: true,
        singleMode: true
      }) as {
        play: () => void
        volume: number
        removeAllTracks: () => void
        addTrack: (path: string) => void
        isPlaying: () => boolean
        pause: () => void
      }
      return audio
    })

  files = [] as IFile[]
  shuffledFiles = [] as IFile[]

  intervalId = 0 as any
  timeoutId = 0 as any

  onChangePlayState = (isPlaying: boolean) => { }
  updatePlayingState() {
    const isPlaying = this.audios.some(v => v.isPlaying())
    this.onChangePlayState(isPlaying)
  }

  play = () => {
    window["players"] = this.audios
    if (this.audios.every(v => !v.isPlaying())) {
      this.audioFileIndex = 0
      this.audioElmIndex = 0
      this.shuffledFiles = shuffle(this.files)
      this.audios.forEach(v => v.volume = 0)
    }

    const prevAudio = this.audios[(this.audioElmIndex) % 2]
    const newAudio = this.audios[(this.audioElmIndex + 1) % 2]
    const newAudioInfo = this.shuffledFiles[this.audioFileIndex % this.shuffledFiles.length]
    newAudio.removeAllTracks()
    newAudio.addTrack(newAudioInfo.path)
    newAudio.play()
    console.log(newAudioInfo.name)
    this.audioFileIndex++
    this.audioElmIndex++
    this.updatePlayingState()

    const step = this.volume / (1000 / 60) / this.crossfade

    clearInterval(this.intervalId)
    this.intervalId = 0
    this.intervalId = setInterval(() => {
      prevAudio.volume = Math.max(0, prevAudio.volume - step)
      newAudio.volume = Math.max(this.volume, prevAudio.volume + step)
      if (prevAudio.volume === 0) prevAudio.pause()
      if (prevAudio.volume === 0
        && newAudio.volume === this.volume) {
        clearInterval(this.intervalId)
        this.intervalId = 0
      }
    }, 1000 / 60)

    clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(this.play, this.audioDuration * 1000 * 60)
  }
  stop() {
    clearInterval(this.intervalId)
    clearTimeout(this.timeoutId)
    this.audios.forEach(v => v.pause())
    this.updatePlayingState()
  }
}

const shuffle = ([...array]) => {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}