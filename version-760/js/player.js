document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("moviePlayer");
  var cover = document.getElementById("playerCover");
  var start = document.getElementById("playerStart");
  var loaded = false;

  function loadVideo() {
    if (!video || loaded || typeof videoSource !== "string") {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSource;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(videoSource);
      hls.attachMedia(video);
    } else {
      video.src = videoSource;
    }
  }

  function startVideo() {
    loadVideo();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    if (video) {
      video.controls = true;
      var playAction = video.play();
      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {});
      }
    }
  }

  if (start) {
    start.addEventListener("click", startVideo);
  }
  if (cover) {
    cover.addEventListener("click", startVideo);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!loaded) {
        startVideo();
      }
    });
  }
});
