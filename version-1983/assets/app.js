(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      event.preventDefault();
      var target = form.getAttribute('action') || 'search.html';
      var value = input.value.trim();
      window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
    });
  });

  var searchInput = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-no-result]');

  var applyFilter = function () {
    if (!cards.length) {
      return;
    }
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || ''
      ].join(' ').toLowerCase();
      var ok = true;
      if (q && haystack.indexOf(q) === -1) {
        ok = false;
      }
      if (type && (card.getAttribute('data-type') || '').indexOf(type) === -1) {
        ok = false;
      }
      if (year && (card.getAttribute('data-year') || '').indexOf(year) === -1) {
        ok = false;
      }
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-show', visible === 0);
    }
  };

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
    searchInput.addEventListener('input', applyFilter);
  }
  if (typeSelect) {
    typeSelect.addEventListener('change', applyFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }
  applyFilter();
})();
