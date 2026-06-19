(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var topNav = document.querySelector(".top-nav");

  if (navToggle && topNav) {
    navToggle.addEventListener("click", function () {
      topNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector(".hero");
  if (hero) {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var backgrounds = Array.prototype.slice.call(document.querySelectorAll(".hero-bg"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var current = 0;

    function activateHero(index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      backgrounds.forEach(function (bg, bgIndex) {
        bg.classList.toggle("active", bgIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    if (slides.length > 0) {
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          activateHero(index);
        });
      });
      window.setInterval(function () {
        activateHero(current + 1);
      }, 5200);
    }
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  var filterForm = document.querySelector("[data-filter-form]");
  if (filterForm) {
    var input = filterForm.querySelector("[data-filter-input]");
    var yearSelect = filterForm.querySelector("[data-filter-year]");
    var typeSelect = filterForm.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var count = document.querySelector("[data-filter-count]");
    var reset = filterForm.querySelector("[data-filter-reset]");

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchType = !type || card.getAttribute("data-type").indexOf(type) !== -1;
        var show = matchKeyword && matchYear && matchType;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [input, yearSelect, typeSelect].forEach(function (el) {
      if (el) {
        el.addEventListener("input", applyFilter);
        el.addEventListener("change", applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        filterForm.reset();
        applyFilter();
      });
    }

    applyFilter();
  }

  var searchPage = document.querySelector("[data-search-page]");
  if (searchPage && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var searchInput = searchPage.querySelector("[data-search-input]");
    var resultBox = searchPage.querySelector("[data-search-results]");

    if (searchInput) {
      searchInput.value = query;
    }

    function renderSearch(keyword) {
      var key = normalize(keyword);
      var items = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.category,
          item.genre,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" "));
        return !key || haystack.indexOf(key) !== -1;
      }).slice(0, 120);

      if (!resultBox) {
        return;
      }

      if (items.length === 0) {
        resultBox.innerHTML = '<div class="no-results">没有找到匹配影片，请换一个关键词。</div>';
        return;
      }

      resultBox.innerHTML = items.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + item.url + '">',
          '    <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
          '    <span class="poster-badge">' + item.year + '</span>',
          '  </a>',
          '  <div class="movie-info">',
          '    <div class="movie-meta"><span>' + item.category + '</span><span>' + item.region + '</span></div>',
          '    <h3><a href="' + item.url + '">' + item.title + '</a></h3>',
          '    <p>' + item.oneLine + '</p>',
          '  </div>',
          '</article>'
        ].join("");
      }).join("");
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        renderSearch(searchInput.value);
      });
    }

    renderSearch(query);
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var existing = document.querySelector('script[data-hls-loader="true"]');
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Hls);
        });
        existing.addEventListener("error", reject);
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      script.async = true;
      script.dataset.hlsLoader = "true";
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function startPlayer(panel) {
    var video = panel.querySelector("video");
    var button = panel.querySelector(".play-btn");
    var cover = panel.querySelector(".player-cover");
    var status = panel.querySelector(".player-status");
    var src = panel.getAttribute("data-m3u8");

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    if (!video || !src) {
      setStatus("当前影片暂未绑定播放源。 ");
      return;
    }

    setStatus("正在初始化播放源，请稍候...");

    if (cover) {
      cover.classList.add("hidden");
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().then(function () {
        setStatus("正在播放。 ");
      }).catch(function () {
        setStatus("浏览器阻止了自动播放，请再次点击播放器播放。 ");
      });
      return;
    }

    loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        video._hlsInstance = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(function () {
            setStatus("正在播放。 ");
          }).catch(function () {
            setStatus("播放源已加载，请点击播放器继续播放。 ");
          });
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("播放源连接失败，请稍后刷新重试。 ");
          }
        });
      } else {
        setStatus("当前浏览器不支持 HLS 播放。 ");
      }
    }).catch(function () {
      setStatus("HLS 播放组件加载失败，请检查网络后重试。 ");
      if (button) {
        button.disabled = false;
      }
    });
  }

  document.querySelectorAll(".player-panel").forEach(function (panel) {
    var button = panel.querySelector(".play-btn");
    if (button) {
      button.addEventListener("click", function () {
        button.disabled = true;
        startPlayer(panel);
      });
    }
  });
})();
