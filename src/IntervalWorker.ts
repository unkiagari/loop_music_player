export default class IntervalWorker {
  ticker = new Worker("./ticker_worker.js")
  start() {
    this.ticker.postMessage("start")
  }
  stop() {
    this.ticker.postMessage("stop")
  }

  constructor(public onmessage: () => void) {
    this.ticker.onmessage = this.onmessage
  }
}