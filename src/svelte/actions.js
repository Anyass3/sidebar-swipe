import { writable as _writable } from 'svelte/store';

const writable = (value) => {
  const { subscribe, ...methods } = _writable(value);

  const get = () => {
    let value;
    subscribe((val) => {
      value = val;
    })();

    return value;
  };

  return {
    subscribe,
    ...methods,
    get,
  };
};
const browser = typeof window !== 'undefined';

class Emitter {
  events = new Map();
  on(event, fn) {
    const fns = this.events.get(event) || [];
    this.events.set(event, fns.concat(fn));
  }
  emit(event, ...data) {
    this.events.get(event).forEach((fn) => fn(...data));
  }
  clear() {
    this.events.clear();
  }
}

const backdrop = (ev) => {
  if (ev.target === ev.currentTarget) close();
};

const $ = new Emitter();

export const opened = writable(false);

export const applied = writable(true);

export const open = () => $.emit('open');

export const close = () => $.emit('close');

export const toggle = () => {
  if (opened.get()) close();
  else open();
};

// action
export default (
  node,
  {
    backdropOpacity = 0.2,
    transitionDuration = 300,
    maxScreenWidth = 768,
    transitionTimingFunc = 'cubic-bezier(0.9, 0.28, 0.08, 1.13)',
    width = '80%',
    right = false,
  } = {}
) => {
  applied.set(window.innerWidth <= maxScreenWidth);
  if (!applied.get()) node.classList.remove('sidebar-swipe-applied');
  width = !width ? '80%' : /^[0-9]+$/.test(`${width}`) ? width + '%' : width;
  // node.style.display = 'none';
  //   setNode(node);
  const timeouts = []; // this is use to store timeout ids for later cleaning

  //the max screen width in which the sidebar applies
  let endTranslate = 0;
  let beforeEndTranslate = 0; //should be math.abs & represents current translation value
  let prevcx = 0; // previous clientX useful for touchmove
  let wasApplied = false;
  let touchType;

  const _navtransition_ = (val = true) => {
    node.firstElementChild.style.transition = val
      ? `transform ${transitionDuration}ms ${transitionTimingFunc}`
      : '';
  };

  const setTransform = () => {
    if (applied.get()) {
      node.firstElementChild.style.transform = `translate(${endTranslate + 'px'})`;
      const opacity =
        backdropOpacity -
        (beforeEndTranslate / node.firstElementChild.offsetWidth) * backdropOpacity; // adjusts side backdropOpacity based on beforeEndTranslate(current translate value)
      node.style.background = `rgba(0,0,0,${backdropOpacity})`;
    }
  };
  const open = () => {
    if (applied.get()) {
      node.firstElementChild.style.float = right ? 'right' : 'left';
      node.classList.remove('closed');
      timeouts.concat(
        setTimeout(() => {
          endTranslate = 0;
          opened.set(true);
          setTransform();
          node.style.background = `rgba(0,0,0,${backdropOpacity})`;
        }, 0.8)
      );
    }
  };

  const close = () => {
    if (applied.get()) {
      endTranslate = (right ? 1 : -1) * node.offsetWidth; //width
      setTransform();
      node.style.background = `rgba(0,0,0,0)`;
      timeouts.concat(
        setTimeout(() => {
          opened.set(false);
          node.classList.add('closed');
        }, transitionDuration)
      );
    }
  };

  $.on('open', open);
  $.on('close', close);

  // mouse events funcs
  const startFn = (ev) => {
    if (applied.get()) {
      prevcx = ev.touches[0].clientX;
      touchType = 'start';
    }
  };
  const moveFn = (ev) => {
    ev.preventDefault();
    if (applied.get()) {
      _navtransition_(false);
      let cx = ev.touches[0].clientX;
      let toTranslate = endTranslate + cx - prevcx;
      if (cx > 2 && ((toTranslate < 0 && !right) || (toTranslate > 0 && right))) {
        endTranslate = toTranslate;
        beforeEndTranslate = Math.abs(toTranslate);
        setTransform();
        prevcx = cx;
        touchType = 'move';
      }
    }
  };
  const endFn = (ev) => {
    if (applied.get()) {
      if (touchType === 'move') {
        _navtransition_();
        (beforeEndTranslate / node.offsetWidth) * 100 > 40 ? close() : open();
        touchType = 'end';
      }
    }
  };

  // methods
  const initEvents = (remove = false) => {
    // needs some cleanig
    // will instantiate the following touch events
    node[remove ? 'removeEventListener' : 'addEventListener'](
      'touchstart',
      (ev) => startFn(ev),
      false
    );
    node[remove ? 'removeEventListener' : 'addEventListener'](
      'touchmove',
      (ev) => moveFn(ev),
      false
    );
    node[remove ? 'removeEventListener' : 'addEventListener']('touchend', (ev) => endFn(ev), false);
    node[remove ? 'removeEventListener' : 'addEventListener'](
      'touchcancel',
      (ev) => console.log(ev),
      false
    );
  };

  const init = () => {
    applied.set(window.innerWidth <= maxScreenWidth);
    if (applied.get()) {
      node.classList.add('sidebar-swipe-applied');
      initEvents();
      node.firstElementChild.style.width = width;
      node.addEventListener('click', backdrop);

      _navtransition_();
      // close()
      endTranslate = (right ? 1 : -1) * document.body.offsetWidth;
      opened.set(false);
      setTransform();
      if (!wasApplied) {
        node.addEventListener('click', backdrop);
      }
      wasApplied = true;
    } else {
      node.classList.remove('sidebar-swipe-applied');
      //will reset styles if current screen availWidth > maxScreenWidth spacified
      node.firstElementChild.style.width = '';

      _navtransition_(false);
      node.firstElementChild.style.transform = '';
      initEvents(true);
      if (!wasApplied) {
        node.removeEventListener('click', backdrop);
      }
      wasApplied = false;
    }
  };

  init();
  window.onresize = init;
  return {
    destroy() {
      window.removeEventListener('resize', init);
      node.removeEventListener('click', backdrop);
      initEvents(true);
      $.clear();
      timeouts.forEach((id) => clearTimeout(id));
    },
  };
};
