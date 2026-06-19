(function () {
  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-slide-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-slide-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalized(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var search = panel.querySelector("[data-filter-search]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var category = panel.querySelector("[data-filter-category]");
    var reset = panel.querySelector("[data-filter-reset]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    if (search && params.get("q")) {
      search.value = params.get("q");
    }
    function matches(card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags")
      ].map(normalized).join(" ");
      var q = search ? normalized(search.value) : "";
      var t = type ? normalized(type.value) : "";
      var y = year ? normalized(year.value) : "";
      var c = category ? normalized(category.value) : "";
      return (!q || text.indexOf(q) !== -1) &&
        (!t || normalized(card.getAttribute("data-type")) === t) &&
        (!y || normalized(card.getAttribute("data-year")) === y) &&
        (!c || normalized(card.getAttribute("data-category")) === c);
    }
    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle("hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    [search, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        [search, type, year, category].forEach(function (control) {
          if (control) {
            control.value = "";
          }
        });
        apply();
      });
    }
    apply();
  }

  window.bindMoviePlayer = function (streamUrl, posterUrl) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".play-cover");
    if (!video || !cover || !streamUrl) {
      return;
    }
    if (posterUrl) {
      video.setAttribute("poster", posterUrl);
    }
    var hlsInstance = null;
    var ready = false;
    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.controls = true;
    }
    function play() {
      prepare();
      cover.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
