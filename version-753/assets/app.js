(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startHeroTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5000);
  }

  var previousHero = document.querySelector('.hero-arrow.prev');
  var nextHero = document.querySelector('.hero-arrow.next');

  if (previousHero) {
    previousHero.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      startHeroTimer();
    });
  }

  if (nextHero) {
    nextHero.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      startHeroTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      startHeroTimer();
    });
  });

  startHeroTimer();

  var filterInput = document.querySelector('.page-filter-input');
  var filterScope = document.querySelector('.filter-scope');
  var selectedYear = 'all';

  function filterCards() {
    if (!filterScope) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var yearMatched = selectedYear === 'all' || text.indexOf(selectedYear) !== -1 || card.textContent.indexOf(selectedYear) !== -1;
      var queryMatched = !query || text.indexOf(query) !== -1 || card.textContent.toLowerCase().indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !(yearMatched && queryMatched));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]')).forEach(function (button) {
    button.addEventListener('click', function () {
      selectedYear = button.getAttribute('data-filter-year') || 'all';
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]')).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });

  function initPlayer() {
    var playButton = document.querySelector('.play-button');
    var video = document.querySelector('.hls-player');

    if (!playButton || !video) {
      return;
    }

    var status = document.querySelector('.player-status');
    var box = document.querySelector('.player-box');
    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    playButton.addEventListener('click', function () {
      if (!source) {
        setStatus('当前视频源不可用');
        return;
      }

      setStatus('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
          video.play().catch(function () {
            setStatus('请再次点击播放器开始播放');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放遇到网络或媒体错误，正在尝试恢复');
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪');
          video.play().catch(function () {
            setStatus('请再次点击播放器开始播放');
          });
        }, { once: true });
      } else {
        setStatus('当前浏览器不支持 HLS 播放');
      }

      if (box) {
        box.classList.add('is-playing');
      }
    });
  }

  initPlayer();

  function buildSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card normal">' +
      '<a class="poster-link" href="' + escapeHtml(item.url) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '</a>' +
      '<div class="movie-info">' +
      '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
      '<p class="movie-line">' + escapeHtml(item.oneLine || '') + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  var searchForm = document.getElementById('site-search-form');
  var searchInput = document.getElementById('site-search-input');
  var searchResults = document.getElementById('search-results');
  var searchCount = document.getElementById('search-count');

  function runSearch(items, query) {
    var keyword = (query || '').trim().toLowerCase();

    if (!keyword) {
      searchResults.innerHTML = '';
      searchCount.textContent = '请输入关键词开始搜索。';
      return;
    }

    var results = items.filter(function (item) {
      return item.search.indexOf(keyword) !== -1;
    }).slice(0, 120);

    searchResults.innerHTML = results.map(buildSearchCard).join('');
    searchCount.textContent = '找到 ' + results.length + ' 个相关结果' + (results.length === 120 ? '，已显示前 120 个。' : '。');
  }

  if (searchForm && searchInput && searchResults) {
    function bindSearch(items) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      searchInput.value = initialQuery;
      runSearch(items, initialQuery);

      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = searchInput.value || '';
        var url = new URL(window.location.href);
        url.searchParams.set('q', value);
        window.history.replaceState(null, '', url.toString());
        runSearch(items, value);
      });
    }

    if (Array.isArray(window.SEARCH_INDEX)) {
      bindSearch(window.SEARCH_INDEX);
    } else {
      fetch('assets/search-index.json')
        .then(function (response) {
          return response.json();
        })
        .then(bindSearch)
        .catch(function () {
          searchCount.textContent = '搜索索引加载失败，请刷新页面后重试。';
        });
    }
  }
})();
