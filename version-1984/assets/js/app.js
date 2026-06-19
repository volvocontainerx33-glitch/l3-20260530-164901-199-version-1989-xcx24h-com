(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    var query = normalize(searchInputs.length ? searchInputs[0].value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var category = card.getAttribute('data-category') || 'all';
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesFilter = activeFilter === 'all' || activeFilter === category;
      var shouldShow = matchesQuery && matchesFilter;

      card.style.display = shouldShow ? '' : 'none';

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-button') || 'all';

      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      applyFilters();
    });
  });

  if (cards.length) {
    applyFilters();
  }
})();
