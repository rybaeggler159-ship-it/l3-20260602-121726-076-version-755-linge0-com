(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function text(value) {
    return (value || '').toString().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initGlobalSearch() {
    Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function initFilters() {
    var filter = document.querySelector('[data-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!filter || !cards.length) {
      return;
    }
    var keyword = filter.querySelector('[data-filter-keyword]');
    var year = filter.querySelector('[data-filter-year]');
    var region = filter.querySelector('[data-filter-region]');
    var type = filter.querySelector('[data-filter-type]');
    var reset = filter.querySelector('[data-filter-reset]');
    var empty = document.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }
    function apply() {
      var q = text(keyword && keyword.value).trim();
      var y = year && year.value ? year.value : '';
      var r = region && region.value ? region.value : '';
      var t = type && type.value ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = text(card.getAttribute('data-search'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (r && cardRegion !== r) {
          ok = false;
        }
        if (t && cardType !== t) {
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
    [keyword, year, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        apply();
      });
    }
    apply();
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('video[data-stream]')).forEach(function (video) {
      var stream = video.getAttribute('data-stream');
      var shell = video.closest('.player-shell');
      var button = shell ? shell.querySelector('[data-play-button]') : null;
      var started = false;
      function attach() {
        if (started || !stream) {
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        attach();
        if (shell) {
          shell.classList.add('playing');
        }
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        attach();
      }, { once: true });
      video.addEventListener('play', function () {
        if (shell) {
          shell.classList.add('playing');
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initFilters();
    initPlayers();
  });
}());
