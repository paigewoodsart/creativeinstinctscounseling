(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var heroNav = document.getElementById('heroNav');
  var siteNav = document.getElementById('siteNav');
  var hero = document.querySelector('.hero');
  var parallaxBgEls = Array.prototype.slice.call(document.querySelectorAll('.parallax-bg'));
  var parallaxImgEls = Array.prototype.slice.call(document.querySelectorAll('.parallax-img'));

  var ticking = false;

  function updateNav(){
    var heroHeight = hero ? hero.offsetHeight : window.innerHeight;
    var scrollY = window.scrollY || window.pageYOffset;

    if(heroNav){
      var fadeEnd = heroHeight * 0.6;
      var opacity = 1 - Math.min(scrollY / fadeEnd, 1);
      heroNav.style.opacity = opacity;
      heroNav.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';
    }

    if(siteNav){
      if(scrollY > heroHeight * 0.55){
        siteNav.classList.add('is-visible');
      } else {
        siteNav.classList.remove('is-visible');
      }
    }
  }

  function updateParallax(){
    var scrollY = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    parallaxBgEls.forEach(function(el){
      var speed = parseFloat(el.dataset.speed) || 0.2;
      el.style.transform = 'translate3d(0,' + (scrollY * speed) + 'px,0)';
    });

    parallaxImgEls.forEach(function(el){
      var speed = parseFloat(el.dataset.speed) || 0.12;
      var container = el.parentElement;
      var rect = container.getBoundingClientRect();
      var centerOffset = (rect.top + rect.height / 2) - (vh / 2);
      el.style.transform = 'translate3d(0,' + (centerOffset * speed) + 'px,0)';
    });
  }

  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(function(){
        updateNav();
        if(!reduceMotion){ updateParallax(); }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  updateNav();
  if(!reduceMotion){ updateParallax(); }

  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  var mobileMenuClose = document.getElementById('mobileMenuClose');

  function openMobileMenu(){
    if(!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    mobileMenuOverlay.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu(){
    if(!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    mobileMenuOverlay.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if(navToggle && mobileMenu){
    navToggle.addEventListener('click', function(){
      if(mobileMenu.classList.contains('is-open')){
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileMenuClose.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);

    mobileMenu.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ closeMobileMenu(); }
    });

    window.addEventListener('resize', function(){
      if(window.innerWidth > 760){ closeMobileMenu(); }
    });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function(el){ observer.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }
})();
