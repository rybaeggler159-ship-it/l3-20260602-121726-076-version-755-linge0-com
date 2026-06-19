(function () {
  function startPlayer(shell) {
    const video = shell.querySelector("video[data-hls]");
    const overlay = shell.querySelector("[data-player-trigger]");

    if (!video) {
      return;
    }

    const stream = video.getAttribute("data-hls");
    let loaded = false;
    let hls = null;

    function loadAndPlay() {
      if (!stream) {
        return;
      }

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
              promise.catch(function () {});
            }
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal || !hls) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }

        loaded = true;
      }

      shell.classList.add("is-playing");
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", loadAndPlay);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        loadAndPlay();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.querySelectorAll("[data-player-shell]").forEach(startPlayer);
})();
