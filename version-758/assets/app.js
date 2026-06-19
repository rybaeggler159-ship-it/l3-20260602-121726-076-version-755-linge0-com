(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-menu]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && menu && header) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
      header.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5000);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(heroIndex - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(heroIndex + 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  startHero();

  var searchInput = document.querySelector('[data-search-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var list = document.querySelector('[data-card-list]');
  var empty = document.querySelector('[data-empty]');

  function applyFilter() {
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function applySort() {
    if (!list || !sortSelect) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var value = sortSelect.value;

    cards.sort(function (a, b) {
      if (value === 'title-asc') {
        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
      }
      return (Number(b.getAttribute('data-year')) || 0) - (Number(a.getAttribute('data-year')) || 0);
    });

    cards.forEach(function (card) {
      list.appendChild(card);
    });
    applyFilter();
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }

  var video = document.getElementById('player');
  var cover = document.querySelector('.play-cover');

  function attachStream() {
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.getAttribute('src') !== stream) {
        video.setAttribute('src', stream);
      }
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsReady) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsReady = true;
      }
    } else if (video.getAttribute('src') !== stream) {
      video.setAttribute('src', stream);
    }
  }

  function beginPlay() {
    attachStream();
    if (cover) {
      cover.hidden = true;
    }
    if (video) {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
  }

  if (cover) {
    cover.addEventListener('click', beginPlay);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (cover) {
        cover.hidden = true;
      }
    });
  }
})();
