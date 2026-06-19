document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var featureImage = document.querySelector(".hero-feature img");
  var featureTitle = document.querySelector(".hero-feature h2 a");
  var featureText = document.querySelector(".hero-feature p");
  var featureLink = document.querySelector(".hero-feature .btn");
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("active", current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("active", current === heroIndex);
    });
    var active = slides[heroIndex];
    if (featureImage && active) {
      featureImage.src = active.getAttribute("data-cover");
      featureImage.alt = active.getAttribute("data-title");
    }
    if (featureTitle && active) {
      featureTitle.textContent = active.getAttribute("data-title");
      featureTitle.href = active.getAttribute("data-href");
    }
    if (featureText && active) {
      featureText.textContent = active.getAttribute("data-text");
    }
    if (featureLink && active) {
      featureLink.href = active.getAttribute("data-href");
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showHero(index);
    });
  });

  if (slides.length) {
    showHero(0);
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var backTop = document.querySelector(".back-top");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 360);
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var filterForm = document.querySelector(".filter-bar");
  if (filterForm) {
    var keyword = filterForm.querySelector(".filter-input");
    var year = filterForm.querySelector(".filter-select");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    function runFilter() {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      cards.forEach(function (card) {
        var hitText = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();
        var hitYear = !y || card.getAttribute("data-year") === y;
        var hitKeyword = !q || hitText.indexOf(q) !== -1;
        card.style.display = hitYear && hitKeyword ? "" : "none";
      });
    }
    if (keyword) {
      keyword.addEventListener("input", runFilter);
    }
    if (year) {
      year.addEventListener("change", runFilter);
    }
  }
});
