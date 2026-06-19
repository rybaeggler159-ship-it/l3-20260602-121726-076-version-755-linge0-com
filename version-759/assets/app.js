function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const previous = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let index = slides.findIndex(function (slide) {
    return slide.classList.contains("active");
  });
  if (index < 0) {
    index = 0;
  }
  function show(target) {
    index = (target + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
      dot.setAttribute("aria-selected", dotIndex === index ? "true" : "false");
    });
  }
  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
    });
  });
  if (previous) {
    previous.addEventListener("click", function () {
      show(index - 1);
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
    });
  }
  if (slides.length > 1) {
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }
}

function initFilters() {
  const blocks = Array.from(document.querySelectorAll("[data-filter-block]"));
  blocks.forEach(function (block) {
    const input = block.querySelector("[data-search-input]");
    const select = block.querySelector("[data-sort-select]");
    const section = block.closest("section") || document;
    const grid = section.querySelector("[data-movie-grid]");
    const empty = section.querySelector("[data-empty-state]");
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
    function apply() {
      const query = input ? input.value.trim().toLowerCase() : "";
      const sort = select ? select.value : "year-desc";
      const sorted = cards.slice().sort(function (a, b) {
        const yearA = Number(a.dataset.year || 0);
        const yearB = Number(b.dataset.year || 0);
        const titleA = a.dataset.title || "";
        const titleB = b.dataset.title || "";
        if (sort === "year-asc") {
          return yearA - yearB || titleA.localeCompare(titleB, "zh-CN");
        }
        if (sort === "title-asc") {
          return titleA.localeCompare(titleB, "zh-CN");
        }
        return yearB - yearA || titleA.localeCompare(titleB, "zh-CN");
      });
      let visible = 0;
      sorted.forEach(function (card) {
        const matched = !query || (card.dataset.search || "").toLowerCase().includes(query);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
        grid.appendChild(card);
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  });
}

function initializeVideoPlayer(videoId, buttonId, overlayId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const overlay = document.getElementById(overlayId);
  if (!video || !button || !overlay || !streamUrl) {
    return;
  }
  let ready = false;
  function attachStream() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }
  function start() {
    attachStream();
    overlay.classList.add("is-hidden");
    video.controls = true;
    video.play().catch(function () {});
  }
  button.addEventListener("click", start);
  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!ready) {
      start();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initMenu();
  initHero();
  initFilters();
});
