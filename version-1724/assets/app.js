(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle('is-active', currentIndex === activeIndex);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle('is-active', currentIndex === activeIndex);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        setActive(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setActive(index);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        setActive(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(activeIndex + 1);
        startTimer();
      });
    }

    startTimer();
  }

  function setupCategoryFilters() {
    var grid = document.querySelector('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var searchInput = document.querySelector('[data-filter-search]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var countNode = document.querySelector('[data-filter-count]');
    var noResults = document.querySelector('[data-no-results]');

    function includesText(card, keyword) {
      if (!keyword) {
        return true;
      }

      var content = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre
      ].join(' ').toLowerCase();

      return content.indexOf(keyword) !== -1;
    }

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matched = includesText(card, keyword);
        matched = matched && (!year || card.dataset.year === year);
        matched = matched && (!type || card.dataset.type === type);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }

      if (noResults) {
        noResults.hidden = visible !== 0;
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var button = document.querySelector('[data-global-search-button]');
    var resultsNode = document.querySelector('[data-search-results]');
    var hintNode = document.querySelector('[data-search-hint]');

    if (!input || !resultsNode || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function render(items, query) {
      var html = items.slice(0, 80).map(function (item) {
        var tags = item.tags.slice(0, 4).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
          '<article class="search-result-card">' +
          '  <a href="' + item.url + '">' +
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + ' 海报" loading="lazy">' +
          '    <div>' +
          '      <h2>' + escapeHtml(item.title) + '</h2>' +
          '      <p>' + escapeHtml(item.description) + '</p>' +
          '      <div class="rank-tags">' +
          '        <span>' + escapeHtml(item.year) + '</span>' +
          '        <span>' + escapeHtml(item.type) + '</span>' +
          '        <span>' + escapeHtml(item.category) + '</span>' +
                   tags +
          '      </div>' +
          '    </div>' +
          '  </a>' +
          '</article>';
      }).join('');

      resultsNode.innerHTML = html;

      if (hintNode) {
        if (!query) {
          hintNode.textContent = '已展示部分影片，可输入关键词继续筛选。';
        } else if (items.length === 0) {
          hintNode.textContent = '没有找到匹配的影片。';
        } else {
          hintNode.textContent = '找到 ' + items.length + ' 部匹配影片，当前显示前 ' + Math.min(80, items.length) + ' 部。';
        }
      }
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function search() {
      var query = input.value.trim();
      var keyword = normalize(query);
      var items = window.SEARCH_INDEX.filter(function (item) {
        if (!keyword) {
          return true;
        }

        var content = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          item.description,
          item.tags.join(' ')
        ].join(' ');

        return normalize(content).indexOf(keyword) !== -1;
      });

      render(items, query);
    }

    input.addEventListener('input', search);

    if (button) {
      button.addEventListener('click', search);
    }

    search();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCategoryFilters();
    setupGlobalSearch();
  });
}());
