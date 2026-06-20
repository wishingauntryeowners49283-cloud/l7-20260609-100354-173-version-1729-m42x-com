(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setStatus(frame, message) {
    var status = frame.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message || '';
    }
  }

  function attachHls(video, source, frame, onReady) {
    if (video.dataset.ready === 'true') {
      onReady();
      return;
    }

    setStatus(frame, '正在加载播放源...');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.dataset.ready = 'true';
        setStatus(frame, '');
        onReady();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus(frame, '播放源加载失败，请刷新页面后重试。');
        }
      });
      video._hlsInstance = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.dataset.ready = 'true';
        setStatus(frame, '');
        onReady();
      }, { once: true });
      video.load();
      return;
    }

    setStatus(frame, '当前浏览器不支持 HLS 播放，请更换现代浏览器。');
  }

  function setupPlayer(frame) {
    var video = frame.querySelector('video[data-src]');
    var button = frame.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    function play() {
      var source = video.dataset.src;
      if (!source) {
        setStatus(frame, '未找到播放源。');
        return;
      }

      attachHls(video, source, frame, function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus(frame, '浏览器阻止了自动播放，请再次点击播放器。');
          });
        }
        button.classList.add('is-hidden');
      });
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  }

  ready(function () {
    var frames = document.querySelectorAll('[data-player-frame]');
    Array.prototype.forEach.call(frames, setupPlayer);
  });
}());
