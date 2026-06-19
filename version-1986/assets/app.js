(function () {
  var doc = document;

  function ready(callback) {
    if (doc.readyState === "loading") {
      doc.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = doc.querySelector("[data-nav-toggle]");
    var menu = doc.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = doc.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearchForms() {
    Array.prototype.slice.call(doc.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(doc.querySelectorAll("[data-filter-scope]"));
    if (!scopes.length) {
      return;
    }

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var typeSelect = scope.querySelector('[data-filter-select="type"]');
      var yearSelect = scope.querySelector('[data-filter-select="year"]');
      var clearButton = scope.querySelector("[data-filter-clear]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var activeChip = "";
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function cardText(card) {
        return normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var chip = normalize(activeChip);
        cards.forEach(function (card) {
          var haystack = cardText(card);
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (type && normalize(card.getAttribute("data-type")) !== type) {
            matched = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            matched = false;
          }
          if (chip && haystack.indexOf(chip) === -1) {
            matched = false;
          }
          card.hidden = !matched;
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }
      chips.forEach(function (chipButton) {
        chipButton.addEventListener("click", function () {
          var value = chipButton.getAttribute("data-filter-chip") || "";
          activeChip = activeChip === value ? "" : value;
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chipButton && activeChip);
          });
          apply();
        });
      });
      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          activeChip = "";
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          apply();
        });
      }
      apply();
    });
  }

  function setupPlayers() {
    Array.prototype.slice.call(doc.querySelectorAll(".video-shell")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".play-overlay");
      if (!video || !overlay) {
        return;
      }
      var stream = video.getAttribute("data-stream") || "";
      var started = false;
      var hlsInstance = null;

      function prepare() {
        if (started || !stream) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!started) {
          play();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayers();
  });
})();
