function initVideoPlayer(videoUrl) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var hlsInstance = null;
  var isReady = false;

  if (!video || !overlay || !videoUrl) {
    return;
  }

  function prepare() {
    if (isReady) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      isReady = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      isReady = true;
      return;
    }
    video.src = videoUrl;
    isReady = true;
  }

  function play() {
    prepare();
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
