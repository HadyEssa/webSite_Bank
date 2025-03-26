"use strict";

class UI {
  // Cached DOM elements
  static DOM = {
    modal: document.querySelector('.modal'),
    overlay: document.querySelector('.overlay'),
    btnCloseModal: document.querySelector('.btn--close-modal'),
    btnsOpenModal: document.querySelectorAll('.btn--show-modal'),
    btnScrollTo: document.querySelector('.btn--scroll-to'),
    section1: document.querySelector('#section--1'),
    nav: document.querySelector('.nav'),
    navLinks: document.querySelector('.nav__links'),
    tabs: document.querySelectorAll('.operations__tab'),
    tabsContainer: document.querySelector('.operations__tab-container'),
    tabsContent: document.querySelectorAll('.operations__content'),
    header: document.querySelector('.header'),
    sections: document.querySelectorAll('.section'),
    lazyImages: document.querySelectorAll('img[data-src]'),
    slides: document.querySelectorAll('.slide'),
    btnLeft: document.querySelector('.slider__btn--left'),
    btnRight: document.querySelector('.slider__btn--right'),
    dotContainer: document.querySelector('.dots')
  };

  // Modal Window
  static modalHandler = {
    open(e) {
      e.preventDefault();
      UI.DOM.modal.classList.remove("hidden");
      UI.DOM.overlay.classList.remove("hidden");
    },
    close() {
      UI.DOM.modal.classList.add("hidden");
      UI.DOM.overlay.classList.add("hidden");
    }
  };

  // Smooth Scrolling
  static scrollToSection(e) {
    e.preventDefault();
    if (!e.target.classList.contains("nav__link")) return;
    document.querySelector(e.target.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  }

  // Tabbed Component
  static handleTabs(e) {
    const clicked = e.target.closest(".operations__tab");
    if (!clicked) return;

    UI.DOM.tabs.forEach(t => t.classList.remove("operations__tab--active"));
    UI.DOM.tabsContent.forEach(c => c.classList.remove("operations__content--active"));

    clicked.classList.add("operations__tab--active");
    document.querySelector(`.operations__content--${clicked.dataset.tab}`)
      .classList.add("operations__content--active");
  }

  // Navigation Hover
  static handleHover = (opacity) => (e) => {
    if (!e.target.classList.contains('nav__link')) return;
    const link = e.target;
    const siblings = UI.DOM.nav.querySelectorAll('.nav__link');
    const logo = UI.DOM.nav.querySelector('img');

    siblings.forEach(el => el !== link && (el.style.opacity = opacity));
    logo.style.opacity = opacity;
  };

  // Sticky Navigation
  static stickyNav = ([entry]) => {
    UI.DOM.nav.classList.toggle('sticky', !entry.isIntersecting);
  };

  // Reveal Sections
  static revealSection = ([entry], observer) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.remove('section--hidden');
    observer.unobserve(entry.target);
  };

  // Lazy Loading Images
  static loadImg = ([entry], observer) => {
    if (!entry.isIntersecting) return;
    entry.target.src = entry.target.dataset.src;
    entry.target.addEventListener('load', () => 
      entry.target.classList.remove('lazy-img'), { once: true });
    observer.unobserve(entry.target);
  };

  // Initialize observers
  static initObservers() {
    const navHeight = UI.DOM.nav.getBoundingClientRect().height;
    
    new IntersectionObserver(UI.stickyNav, {
      root: null,
      threshold: 0,
      rootMargin: `-${navHeight}px`
    }).observe(UI.DOM.header);

    const sectionObserver = new IntersectionObserver(UI.revealSection, {
      root: null,
      threshold: 0.15
    });
    UI.DOM.sections.forEach(section => {
      sectionObserver.observe(section);
      section.classList.add('section--hidden');
    });

    const imgObserver = new IntersectionObserver(UI.loadImg, {
      root: null,
      threshold: 0,
      rootMargin: '200px'
    });
    UI.DOM.lazyImages.forEach(img => imgObserver.observe(img));
  }

  // Event Listeners
  static initEventListeners() {
    UI.DOM.btnsOpenModal.forEach(btn => 
      btn.addEventListener("click", UI.modalHandler.open));
    UI.DOM.btnCloseModal.addEventListener("click", UI.modalHandler.close);
    UI.DOM.overlay.addEventListener("click", UI.modalHandler.close);
    
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !UI.DOM.modal.classList.contains("hidden")) {
        UI.modalHandler.close();
      }
    });

    UI.DOM.btnScrollTo.addEventListener("click", () => 
      UI.DOM.section1.scrollIntoView({ behavior: "smooth" }));
    
    UI.DOM.navLinks.addEventListener("click", UI.scrollToSection);
    UI.DOM.tabsContainer.addEventListener("click", UI.handleTabs);
    
    UI.DOM.nav.addEventListener('mouseover', UI.handleHover(0.5));
    UI.DOM.nav.addEventListener('mouseout', UI.handleHover(1));
  }
}

class Slider {
  constructor() {
    this.curSlide = 0;
    this.maxSlide = UI.DOM.slides.length;
    this.init();
    this.addEventListeners();
  }

  createDots() {
    UI.DOM.dotContainer.innerHTML = Array.from(
      { length: this.maxSlide },
      (_, i) => `<button class="dots__dot" data-slide="${i}"></button>`
    ).join('');
  }

  goToSlide(slide) {
    UI.DOM.slides.forEach((s, i) => 
      s.style.transform = `translateX(${100 * (i - slide)}%)`);
  }

  activateDot(slide) {
    const dots = UI.DOM.dotContainer.querySelectorAll('.dots__dot');
    dots.forEach(dot => dot.classList.remove('dots__dot--active'));
    dots[slide].classList.add('dots__dot--active');
  }

  nextSlide() {
    this.curSlide = (this.curSlide + 1) % this.maxSlide;
    this.goToSlide(this.curSlide);
    this.activateDot(this.curSlide);
  }

  prevSlide() {
    this.curSlide = (this.curSlide - 1 + this.maxSlide) % this.maxSlide;
    this.goToSlide(this.curSlide);
    this.activateDot(this.curSlide);
  }

  init() {
    this.goToSlide(0);
    this.createDots();
    this.activateDot(0);
  }

  addEventListeners() {
    UI.DOM.btnRight.addEventListener('click', () => this.nextSlide());
    UI.DOM.btnLeft.addEventListener('click', () => this.prevSlide());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });

    UI.DOM.dotContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('dots__dot')) return;
      const slide = +e.target.dataset.slide;
      this.goToSlide(slide);
      this.activateDot(slide);
    });
  }
}

// Initialize
UI.initEventListeners();
UI.initObservers();
new Slider();
