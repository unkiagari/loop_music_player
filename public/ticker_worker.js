let interval = 0
self.addEventListener('message', function (e) {
  switch (e.data) {
    case "start":
      if (interval !== 0) return
      interval = setInterval(function () {
        self.postMessage(null)
      }, 1000 / 60)
      break
    case "stop":
      clearInterval(interval)
      interval = 0
      break
  }
}, false)