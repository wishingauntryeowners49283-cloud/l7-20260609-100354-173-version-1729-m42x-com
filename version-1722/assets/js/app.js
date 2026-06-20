(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var root = panel.parentElement;
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        var yearButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year]'));
        var year = 'all';

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var itemYear = card.getAttribute('data-year') || '';
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var yearMatch = year === 'all' || itemYear === year;

                card.classList.toggle('hidden', !(keywordMatch && yearMatch));
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query) {
                input.value = query;
            }

            input.addEventListener('input', applyFilter);
        }

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                year = button.getAttribute('data-filter-year') || 'all';

                yearButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });

                applyFilter();
            });
        });

        applyFilter();
    });

    document.querySelectorAll('.player-wrap').forEach(function (wrap) {
        var video = wrap.querySelector('video[data-stream]');
        var button = wrap.querySelector('[data-play-button]');
        var attached = false;

        if (!video) {
            return;
        }

        function attach() {
            var streamUrl = video.getAttribute('data-stream');

            if (!streamUrl || attached) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = streamUrl;
            }

            attached = true;
        }

        function play() {
            attach();
            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('play', function () {
            wrap.classList.add('playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                wrap.classList.remove('playing');
            }
        });

        video.addEventListener('ended', function () {
            wrap.classList.remove('playing');
        });
    });
})();
