import LoopAudio from "./LoopAudio"

interface IFile {
  name: string
  path: string
  uri: string
}
class AudioManager {
  la = new LoopAudio

  files = [] as IFile[]
  shuffledFiles = [] as IFile[]
  index = 0
  nextMusicTimeoutId = 0
  nextMusicTime = Infinity

  shuffle() {
    this.shuffledFiles = shuffle(this.files)
  }

  play() {
    clearTimeout(this.nextMusicTimeoutId)
    this.nextMusicTimeoutId = setTimeout(() => {
      this.play()
    }, this.audioDuration * 1000 * 60) as any
    
    if (this.shuffledFiles.length === 0) return
    const t = this.shuffledFiles[this.index % this.shuffledFiles.length]
    this.index++

    console.log("play", t.name)
    this.la.play(t.uri)

  }
  stop() {
    this.la.stop()
    this.index = 0
    this.shuffle()
    clearTimeout(this.nextMusicTimeoutId)
  }

  get volume() { return this.la.volume }
  set volume(v) { this.la.volume = v }
  get crossfade() { return this.la.crossfadeFactor }
  set crossfade(v) { this.la.crossfadeFactor = v }
  audioDuration = 10
}

const am = new AudioManager
export default am

const shuffle = ([...array]) => {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
