(function () {
  function loadHls(callback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.onload = function () {
      callback(window.Hls);
    };
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (source, poster) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var started = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    if (poster) {
      video.setAttribute('poster', poster);
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function start() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (started) {
        playVideo();
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo();
        return;
      }

      loadHls(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: false });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        } else {
          video.src = source;
          playVideo();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };
})();
