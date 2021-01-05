class SideBarSwipe {
  constructor(
    query,
    {
      sideOpacity = 0.2,
      transitionDuration = 300,
      maxScreenWidth = 768,
      transitionTimingFunc = 'cubic-bezier(0.9, 0.28, 0.08, 1.13)',
    } = {}
  ) {
    const shadow = Array.from(document.querySelectorAll('sidebar-swipe')).filter(
      (e) => e.shadowRoot && e.shadowRoot.querySelector(query)
    );
    this.swipe =
      shadow.length > 0 ? shadow[0].shadowRoot.firstElementChild : document.querySelector(query);

    this.swipe.style.display = 'none';
    // styles
    this.duration = transitionDuration;
    this.timingFn = transitionTimingFunc;

    this.screenWidth = maxScreenWidth;
    //the max screen width in which the sidebar applies
    this.endTranslate = 0;
    this.beforeEndTranslate = 0; //should be abs & represents current translation value
    this.opened = true;
    this.prevcx = 0; // previous clientX useful for touchmove
    this.opacity = sideOpacity;

    this.initStart();

    this.initEvents();
  }
  get right() {
    return (
      this.swipe.hasAttribute('right') &&
      !(this.swipe.getAttribute('right') === 'false' || this.swipe.getAttribute('right') === false)
    );
  }
  set right(val) {
    this.swipe.setAttribute('right', val);
    this.initStart();
  }
  get width() {
    const w = this.swipe.firstElementChild.getAttribute('width');
    return !w ? '80%' : /^[0-9]+$/.test(`${w}`) ? w + '%' : w;
  }
  get applied() {
    return window.innerWidth <= this.screenWidth;
  }
  _navtransition_(val = true) {
    this.swipe.firstElementChild.style.transition = val
      ? `transform ${this.duration}ms ${this.timingFn}`
      : '';
  }
  // methods
  initStart() {
    if (this.applied) {
      this.swipe.style.width = '100%';
      this.swipe.style.position = 'fixed';
      this.swipe.style.overflowY = 'overlay';
      this.swipe.style.height = '100%';
      this.swipe.firstElementChild.style.height = '100%';
      this.swipe.style.transition = 'background .5s ease';
      this.swipe.style.background = 'rgba(0,0,0,0)';
      this.swipe.style.display = 'none';
      this.swipe.firstElementChild.style.width = this.width;
      this.swipe.addEventListener('click', (ev) => {
        if (ev.target === ev.currentTarget) this.close();
      });
      this._navtransition_();
      // this.close()
      this.endTranslate = (this.right ? 1 : -1) * document.body.offsetWidth;
      this.opened = false;
      this.setTransform();
      if (!this.wasApplied) {
        this.swipe.addEventListener('click', (ev) => {
          if (ev.target === ev.currentTarget) this.close();
        });
      }
      this.wasApplied = true;
    } else {
      //will reset styles if current screen availWidth > maxScreenWidth spacified

      this.swipe.style.position = '';
      this.swipe.style.overflowY = '';
      this.swipe.style.height = '';
      this.swipe.firstElementChild.style.height = '';
      this.swipe.style.transition = '';
      this.swipe.style.width = '';
      this.swipe.style.background = '';
      this.swipe.style.display = '';
      this.swipe.style.justifyContent = '';
      this.swipe.firstElementChild.style.width = '';

      this._navtransition_(false);
      this.swipe.firstElementChild.style.transform = '';
      this.initEvents(true);
      if (!this.wasApplied) {
        this.swipe.removeEventListener('click', (ev) => {
          if (ev.target === ev.currentTarget) this.close();
        });
      }
      this.wasApplied = false;
    }
  }
  initEvents(remove = false) {
    // will instantiate the following touch events
    this.swipe[remove ? 'removeEventListener' : 'addEventListener'](
      'touchstart',
      (ev) => this.startFn(ev),
      false
    );
    this.swipe[remove ? 'removeEventListener' : 'addEventListener'](
      'touchmove',
      (ev) => this.moveFn(ev),
      false
    );
    this.swipe[remove ? 'removeEventListener' : 'addEventListener'](
      'touchend',
      (ev) => this.endFn(ev),
      false
    );
    this.swipe[remove ? 'removeEventListener' : 'addEventListener'](
      'touchcancel',
      (ev) => console.log(ev),
      false
    );
  }
  startFn(ev) {
    if (this.applied) {
      this.prevcx = ev.touches[0].clientX;
      this.touchType = 'start';
    }
  }
  moveFn(ev) {
    ev.preventDefault();
    if (this.applied) {
      this._navtransition_(false);
      let cx = ev.touches[0].clientX;
      let toTranslate = this.endTranslate + cx - this.prevcx;
      if (cx > 2 && ((toTranslate < 0 && !this.right) || (toTranslate > 0 && this.right))) {
        this.endTranslate = toTranslate;
        this.beforeEndTranslate = Math.abs(toTranslate);
        this.setTransform();
        this.prevcx = cx;
        this.touchType = 'move';
      }
    }
  }
  endFn(ev) {
    if (this.applied) {
      if (this.touchType === 'move') {
        this._navtransition_();
        (this.beforeEndTranslate / this.swipe.offsetWidth) * 100 > 40 ? this.close() : this.open();
        this.touchType = 'end';
      }
    }
  }

  setTransform() {
    if (this.applied) {
      this.swipe.firstElementChild.style.transform = `translate(${this.endTranslate + 'px'})`;
      const opacity =
        this.opacity -
        (this.beforeEndTranslate / this.swipe.firstElementChild.offsetWidth) * this.opacity; // adjusts side opacity based on beforeEndTranslate(current translate value)
      this.swipe.style.background = `rgba(0,0,0,${opacity})`;
    }
  }
  open() {
    if (this.applied) {
      this.swipe.style.display = 'block';
      this.swipe.firstElementChild.style.float = this.right ? 'right' : 'left';
      setTimeout(() => {
        this.endTranslate = 0;
        this.opened = true;
        this.setTransform();
        this.swipe.style.background = `rgba(0,0,0,${this.opacity})`;
      }, 0.8);
    }
  }
  close() {
    if (this.applied) {
      const width = (this.right ? 1 : -1) * this.swipe.offsetWidth;
      this.endTranslate = width;
      this.opened = false;
      this.setTransform();
      this.swipe.style.background = `rgba(0,0,0,0)`;
      setTimeout(() => (this.swipe.style.display = 'none'), this.duration);
    }
  }
  toggle() {
    if (this.opened) this.close();
    else this.open();
  }
  // static methods
}

export default SideBarSwipe;
