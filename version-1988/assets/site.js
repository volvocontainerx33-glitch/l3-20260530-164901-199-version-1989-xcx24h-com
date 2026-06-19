const Hls = window.Hls;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileMenu() {
  const button = $(".mobile-toggle");
  const panel = $(".mobile-panel");
  if (!button || !panel) return;
  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function initHero() {
  const hero = $("[data-hero]");
  if (!hero) return;
  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  const prev = $("[data-hero-prev]", hero);
  const next = $("[data-hero-next]", hero);
  if (!slides.length) return;
  let index = 0;
  let timer = null;
  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };
  const restart = () => {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5200);
  };
  prev?.addEventListener("click", () => {
    show(index - 1);
    restart();
  });
  next?.addEventListener("click", () => {
    show(index + 1);
    restart();
  });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.getAttribute("data-hero-dot") || 0));
      restart();
    });
  });
  restart();
}

function initRails() {
  $$('[data-scroll-rail]').forEach((rail) => {
    const wrap = rail.closest(".rail-wrap");
    const left = $('[data-scroll-left]', wrap || document);
    const right = $('[data-scroll-right]', wrap || document);
    left?.addEventListener("click", () => rail.scrollBy({ left: -420, behavior: "smooth" }));
    right?.addEventListener("click", () => rail.scrollBy({ left: 420, behavior: "smooth" }));
  });
}

function initFilters() {
  const textInput = $(".js-search-filter");
  const typeSelect = $(".js-type-filter");
  const cards = $$(".movie-card");
  if (!cards.length || (!textInput && !typeSelect)) return;
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q && textInput) textInput.value = q;
  const apply = () => {
    const text = (textInput?.value || "").trim().toLowerCase();
    const type = typeSelect?.value || "";
    cards.forEach((card) => {
      const keywords = `${card.getAttribute("data-title") || ""} ${card.getAttribute("data-keywords") || ""}`.toLowerCase();
      const cardType = card.getAttribute("data-type") || "";
      const matchText = !text || keywords.includes(text);
      const matchType = !type || cardType === type;
      card.classList.toggle("is-hidden", !(matchText && matchType));
    });
  };
  textInput?.addEventListener("input", apply);
  typeSelect?.addEventListener("change", apply);
  apply();
}

function initPlayers() {
  $$(".js-player").forEach((frame) => {
    const video = $("video", frame);
    const source = $("source", frame);
    const button = $(".play-layer", frame);
    if (!video || !source || !button) return;
    let ready = false;
    let hls = null;
    const load = () => {
      if (ready) return;
      const url = source.getAttribute("src");
      if (!url) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      }
      ready = true;
    };
    const play = async () => {
      load();
      try {
        await video.play();
        frame.classList.add("is-playing");
      } catch (error) {
        frame.classList.remove("is-playing");
      }
    };
    button.addEventListener("click", play);
    video.addEventListener("play", () => frame.classList.add("is-playing"));
    video.addEventListener("pause", () => frame.classList.remove("is-playing"));
    video.addEventListener("ended", () => frame.classList.remove("is-playing"));
    window.addEventListener("beforeunload", () => {
      if (hls) hls.destroy();
    });
  });
}

initMobileMenu();
initHero();
initRails();
initFilters();
initPlayers();
