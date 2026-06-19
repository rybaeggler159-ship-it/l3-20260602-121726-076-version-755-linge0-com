(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-missing");
    });
  });

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  });

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  document.querySelectorAll("[data-global-search]").forEach(function (box) {
    const input = box.querySelector(".global-search-input");
    const results = box.querySelector(".global-search-results");

    if (!input || !results || !window.SITE_SEARCH_DATA) {
      return;
    }

    input.addEventListener("input", function () {
      const query = normalize(input.value);
      results.innerHTML = "";

      if (query.length < 1) {
        results.hidden = true;
        return;
      }

      const matches = window.SITE_SEARCH_DATA.filter(function (item) {
        return normalize(item.title + " " + item.year + " " + item.region + " " + item.type + " " + item.genre).includes(query);
      }).slice(0, 12);

      if (!matches.length) {
        results.hidden = true;
        return;
      }

      matches.forEach(function (item) {
        const link = document.createElement("a");
        link.className = "search-result-item";
        link.href = item.url;
        link.innerHTML = '<span class="search-result-title"></span><span class="search-result-meta"></span>';
        link.querySelector(".search-result-title").textContent = item.title;
        link.querySelector(".search-result-meta").textContent = item.year + " · " + item.region + " · " + item.type;
        results.appendChild(link);
      });

      results.hidden = false;
    });

    document.addEventListener("click", function (event) {
      if (!box.contains(event.target)) {
        results.hidden = true;
      }
    });
  });

  document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
    const scope = panel.closest("section") || document;
    const list = scope.querySelector("[data-card-list]");
    const cards = list ? Array.from(list.querySelectorAll(".movie-card")) : [];
    const searchInput = panel.querySelector("[data-card-search]");
    const selects = Array.from(panel.querySelectorAll("select[data-filter-key]"));
    const empty = panel.querySelector("[data-filter-empty]");

    function apply() {
      const query = normalize(searchInput ? searchInput.value : "");
      let visibleCount = 0;

      cards.forEach(function (card) {
        const searchText = normalize(card.getAttribute("data-search"));
        let visible = !query || searchText.includes(query);

        selects.forEach(function (select) {
          const key = select.getAttribute("data-filter-key");
          const value = normalize(select.value);
          const cardValue = normalize(card.getAttribute("data-" + key));

          if (value && cardValue !== value) {
            visible = false;
          }
        });

        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  });
})();
