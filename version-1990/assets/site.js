(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slider = document.querySelector('.hero-slider');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var next = slider.querySelector('.hero-arrow.next');
        var prev = slider.querySelector('.hero-arrow.prev');
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
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
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function applyFilter(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var yearSelect = scope.querySelector('[data-year-select]');
        var list = document.querySelector('[data-filter-list]');
        var empty = document.querySelector('[data-empty-state]');

        if (!list) {
            return;
        }

        var query = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var visible = 0;

        cards.forEach(function (card) {
            var content = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year')
            ].join(' '));
            var matchesQuery = !query || content.indexOf(query) !== -1;
            var matchesYear = !year || card.getAttribute('data-year') === year;
            var show = matchesQuery && matchesYear;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    var filterScope = document.querySelector('[data-filter-form]');

    if (filterScope) {
        var filterInput = filterScope.querySelector('[data-filter-input]');
        var yearSelect = filterScope.querySelector('[data-year-select]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        var searchBox = document.querySelector('[data-search-query]');

        if (filterInput && initial) {
            filterInput.value = initial;
        }

        if (searchBox && initial) {
            searchBox.value = initial;
        }

        if (filterInput) {
            filterInput.addEventListener('input', function () {
                applyFilter(filterScope);
            });
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', function () {
                applyFilter(filterScope);
            });
        }

        applyFilter(filterScope);
    }

    var player = document.querySelector('.player-shell[data-stream]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-cover');
        var stream = player.getAttribute('data-stream');
        var hlsInstance;
        var ready = false;

        function prepare() {
            if (ready || !video || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                ready = true;
            }
        }

        function play() {
            prepare();

            if (button) {
                button.classList.add('is-hidden');
            }

            if (video) {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
