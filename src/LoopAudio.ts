import IntervalWorker from "./IntervalWorker"

const ctx = new AudioContext

let idcounter = 0
class AudioPipeline {
  id = ++idcounter
  src = null as null | AudioBufferSourceNode
  gain = ctx.createGain()
  constructor(dest: AudioNode) {
    this.gain.connect(dest)
  }

  isPlay = false

  async play(uri: string) {
    const audioData = await fetch(uri)
      .then(res => res.arrayBuffer())
    const buffer = await ctx.decodeAudioData(audioData)
    this.src = ctx.createBufferSource()
    this.src.connect(this.gain)
    this.src.buffer = buffer
    this.src.loop = true
    this.src.start()
    this.isPlay = true
  }

  stop() {
    this.src?.stop()
    this.isPlay = false
    this.src.loop = false
  }


  get volume() {
    return this.gain.gain.value
  }
  set volume(v) {
    this.gain.gain.value = Math.max(0, Math.min(1, v))
  }

  sweep() {
    // if disconnect, gc sweep audiobuffer
    this.src?.stop()
    this.src?.disconnect()
    this.src = null
  }
}

export default class LoopAudio {
  masterGain = ctx.createGain()
  audioPool = [] as AudioPipeline[]
  audioBuffer4Fadeout = [] as AudioPipeline[]
  audio = null as null | AudioPipeline

  crossfadeFactor = 1
  processFade = () => {
    const step = 1 / 60 / this.crossfadeFactor
    this.audio!.volume += step
    this.audioBuffer4Fadeout.forEach(audio => {
      audio.volume -= step
    })

    this.audioBuffer4Fadeout = this.audioBuffer4Fadeout
      .filter(v => {
        const needSweep = v.volume === 0
        if (needSweep) {
          v.stop()
          v.sweep()
          this.audioPool.push(v)
        }
        return !needSweep
      })

    // fade処理が終了している場合はintervalをストップ
    if (this.audio?.volume === 1 && this.audioBuffer4Fadeout.length === 0) {
      this.fader.stop()
    }
  }
  fader = new IntervalWorker(this.processFade)

  constructor() {
    this.masterGain.connect(ctx.destination)
  }

  async play(path: string) {
    if (this.audio) {
      this.audioBuffer4Fadeout.push(this.audio)
    }

    this.audio = this.audioPool.pop() ?? new AudioPipeline(this.masterGain)
    this.audio.volume = 0
    await this.audio.play(path)

    this.fader.start()
  }

  stop() {
    this.fader.stop()
    if (this.audio) {
      this.audio?.stop()
      this.audio?.sweep()
      this.audioPool.push(this.audio)
      this.audio = null
    }
    this.audioBuffer4Fadeout.forEach(v => {
      v.stop()
      v.sweep()
      this.audioPool.push(v)
    })
    this.audioBuffer4Fadeout.length = 0
  }
  get volume() { return this.masterGain.gain.value }
  set volume(v) { this.masterGain.gain.value = v }
}
