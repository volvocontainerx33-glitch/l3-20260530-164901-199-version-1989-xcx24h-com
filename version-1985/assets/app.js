import { H as Hls } from "./hls-dru42stk.js";

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
}

function initNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const links = document.querySelector("[data-nav-links]");

    if (!toggle || !links) {
        return;
    }

    toggle.addEventListener("click", () => {
        links.classList.toggle("open");
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function activate(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            activate(Number(dot.dataset.heroDot));
        });
    });

    if (slides.length > 1) {
        window.setInterval(() => {
            activate(current + 1);
        }, 5200);
    }
}

function initFilters() {
    const input = document.querySelector("[data-filter-input]");
    const yearSelect = document.querySelector("[data-filter-year]");
    const list = document.querySelector("[data-filter-list]");

    if (!list || (!input && !yearSelect)) {
        return;
    }

    const items = Array.from(list.children);
    const params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
        input.value = params.get("q");
    }

    function applyFilter() {
        const query = input ? input.value.trim().toLowerCase() : "";
        const year = yearSelect ? yearSelect.value : "";

        items.forEach((item) => {
            const haystack = item.textContent.toLowerCase();
            const itemYear = item.dataset.year || "";
            const matchesQuery = !query || query.split(/\s+/).every((part) => haystack.includes(part));
            const matchesYear = !year || itemYear === year;
            item.classList.toggle("is-hidden", !(matchesQuery && matchesYear));
        });
    }

    if (input) {
        input.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
    }

    applyFilter();
}

function initPlayer() {
    const shell = document.querySelector("[data-video-url]");

    if (!shell) {
        return;
    }

    const video = shell.querySelector("video");
    const button = shell.querySelector("[data-play-button]");
    const note = shell.querySelector("[data-player-note]");
    const source = shell.dataset.videoUrl;
    let started = false;

    function setNote(message) {
        if (note) {
            note.textContent = message;
        }
    }

    function startPlayer() {
        if (!video || !source || started) {
            return;
        }

        started = true;
        video.controls = true;
        shell.classList.add("is-playing");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            setNote("正在使用浏览器原生 HLS 播放。");
            video.play().catch(() => setNote("请再次点击视频画面开始播放。"));
            return;
        }

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setNote("HLS 播放源已加载。");
                video.play().catch(() => setNote("请再次点击视频画面开始播放。"));
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data && data.fatal) {
                    setNote("播放源暂时无法加载，请稍后重试。 ");
                }
            });
            return;
        }

        setNote("当前浏览器不支持 HLS 播放。 ");
    }

    if (button) {
        button.addEventListener("click", startPlayer);
    }

    if (video) {
        video.addEventListener("click", startPlayer);
    }
}

ready(() => {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
});
