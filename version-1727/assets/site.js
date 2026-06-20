(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = qs("[data-menu-button]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var thumbs = qsa("[data-hero-thumb]", hero);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPageFilter() {
    qsa("[data-page-filter]").forEach(function (panel) {
      var input = qs("[data-page-filter-input]", panel);
      var list = qs("[data-filter-list]");
      if (!input || !list) {
        return;
      }
      var cards = qsa("[data-card]", list);
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          card.classList.toggle("is-filter-hidden", keyword && text.indexOf(keyword) === -1);
        });
      });
    });
  }

  function renderSearchCard(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class="movie-card" data-card>" +
      "<a class="movie-poster" href="" + escapeHtml(item.url) + "" aria-label="" + escapeHtml(item.title) + "">" +
      "<img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" loading="lazy">" +
      "<span class="play-dot">▶</span>" +
      "</a>" +
      "<div class="movie-card-body">" +
      "<div class="movie-meta-line"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<h3><a href="" + escapeHtml(item.url) + "">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class="tag-row">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearch() {
    var form = qs("[data-search-form]");
    var results = qs("[data-search-results]");
    var status = qs("[data-search-status]");
    if (!form || !results || !window.SEARCH_INDEX) {
      return;
    }

    function run() {
      var data = new FormData(form);
      var q = String(data.get("q") || "").trim().toLowerCase();
      var region = String(data.get("region") || "");
      var type = String(data.get("type") || "");
      var genre = String(data.get("genre") || "");
      var matched = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" ").toLowerCase();
        if (q && haystack.indexOf(q) === -1) {
          return false;
        }
        if (region && item.region !== region) {
          return false;
        }
        if (type && item.type !== type) {
          return false;
        }
        if (genre && item.genre.indexOf(genre) === -1 && (item.tags || []).indexOf(genre) === -1) {
          return false;
        }
        return true;
      }).slice(0, 96);
      results.innerHTML = matched.map(renderSearchCard).join("");
      if (status) {
        status.textContent = matched.length ? "搜索结果已刷新" : "没有找到匹配影片";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      run();
    });
    qsa("input, select", form).forEach(function (field) {
      field.addEventListener("input", run);
      field.addEventListener("change", run);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initPageFilter();
    initSearch();
  });
})();
