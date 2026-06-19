(function () {
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var minis = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-mini]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
      minis.forEach(function (mini, miniIndex) {
        mini.classList.toggle("is-active", miniIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    minis.forEach(function (mini) {
      mini.addEventListener("mouseenter", function () {
        showSlide(Number(mini.getAttribute("data-hero-mini")) || 0);
        restart();
      });
    });

    restart();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterItems = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));
  var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));

  if (filterInput && filterItems.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      filterInput.value = query;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(filterInput.value);
      var selectValues = selects.map(function (select) {
        return {
          key: select.getAttribute("data-filter-select"),
          value: normalize(select.value)
        };
      });

      filterItems.forEach(function (item) {
        var haystack = normalize(item.getAttribute("data-search"));
        var visible = !keyword || haystack.indexOf(keyword) !== -1;
        selectValues.forEach(function (entry) {
          if (entry.value) {
            visible = visible && normalize(item.getAttribute("data-" + entry.key)) === entry.value;
          }
        });
        item.classList.toggle("is-filter-hidden", !visible);
      });
    }

    filterInput.addEventListener("input", applyFilter);
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
    applyFilter();
  }
}());
