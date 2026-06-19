
(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var nav = qs('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    var prev = qs('.hero-control.prev');
    var next = qs('.hero-control.next');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

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

    show(0);
    start();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var input = qs('[data-filter-text]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var categorySelect = qs('[data-filter-category]', panel);
    var cards = qsa('.movie-card[data-title]');
    var empty = qs('.empty-state');

    function value(node) {
      return node ? String(node.value || '').trim().toLowerCase() : '';
    }

    function apply() {
      var text = value(input);
      var type = value(typeSelect);
      var category = value(categorySelect);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;
        if (text && haystack.indexOf(text) === -1) {
          ok = false;
        }
        if (type && String(card.getAttribute('data-type') || '').toLowerCase().indexOf(type) === -1) {
          ok = false;
        }
        if (category && String(card.getAttribute('data-category') || '').toLowerCase() !== category) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, typeSelect, categorySelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var playButton = document.querySelector('.play-button');
    if (!video || !streamUrl) {
      return;
    }

    var loaded = false;

    function prepare() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
