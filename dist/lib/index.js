"use strict";

var _store = require("svelte/store");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var Writable = function Writable(value) {
  var _writable = (0, _store.writable)(value),
      subscribe = _writable.subscribe,
      methods = _objectWithoutProperties(_writable, ["subscribe"]);

  var get = function get() {
    var value;
    subscribe(function (val) {
      value = val;
    })();
    return value;
  };

  return Object.assign({
    subscribe: subscribe
  }, methods, {
    get: get
  });
};

var SideBarSwipe = /*#__PURE__*/function () {
  function SideBarSwipe(query) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$sideOpacity = _ref.sideOpacity,
        sideOpacity = _ref$sideOpacity === void 0 ? 0.2 : _ref$sideOpacity,
        _ref$transitionDurati = _ref.transitionDuration,
        transitionDuration = _ref$transitionDurati === void 0 ? 300 : _ref$transitionDurati,
        _ref$maxScreenWidth = _ref.maxScreenWidth,
        maxScreenWidth = _ref$maxScreenWidth === void 0 ? 768 : _ref$maxScreenWidth,
        _ref$transitionTiming = _ref.transitionTimingFunc,
        transitionTimingFunc = _ref$transitionTiming === void 0 ? 'cubic-bezier(0.9, 0.28, 0.08, 1.13)' : _ref$transitionTiming;

    _classCallCheck(this, SideBarSwipe);

    var shadow = Array.from(document.querySelectorAll('sidebar-swipe')).filter(function (e) {
      return e.shadowRoot && e.shadowRoot.querySelector(query);
    });
    this.swipe = shadow.length > 0 ? shadow[0].shadowRoot.firstElementChild : document.querySelector(query);
    this.swipe.style.display = 'none'; // styles

    this.duration = transitionDuration;
    this.timingFn = transitionTimingFunc;
    this.screenWidth = maxScreenWidth; //the max screen width in which the sidebar applies

    this.endTranslate = 0;
    this.beforeEndTranslate = 0; //should be abs & represents current translation value

    this.opened = Writable(true);
    this.prevcx = 0; // previous clientX useful for touchmove

    this.opacity = sideOpacity;
    this.initStart();
    this.initEvents();
  }

  _createClass(SideBarSwipe, [{
    key: "_navtransition_",
    value: function _navtransition_() {
      var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.swipe.firstElementChild.style.transition = val ? "transform ".concat(this.duration, "ms ").concat(this.timingFn) : '';
    } // methods

  }, {
    key: "initStart",
    value: function initStart() {
      var _this = this;

      if (this.applied) {
        this.swipe.style.width = '100%';
        this.swipe.style.position = 'fixed';
        this.swipe.style.overflowY = 'overlay';
        this.swipe.style.height = '100%';
        this.swipe.firstElementChild.style.minHeight = '100%';
        this.swipe.style.transition = 'background .5s ease';
        this.swipe.style.background = 'rgba(0,0,0,0)';
        this.swipe.style.display = 'none';
        this.swipe.firstElementChild.style.width = this.width;
        this.swipe.addEventListener('click', function (ev) {
          if (ev.target === ev.currentTarget) _this.close();
        });

        this._navtransition_(); // this.close()


        this.endTranslate = (this.right ? 1 : -1) * document.body.offsetWidth;
        this.opened.set(false);
        this.setTransform();

        if (!this.wasApplied) {
          this.swipe.addEventListener('click', function (ev) {
            if (ev.target === ev.currentTarget) _this.close();
          });
        }

        this.wasApplied = true;
      } else {
        //will reset styles if current screen availWidth > maxScreenWidth spacified
        this.swipe.style.position = '';
        this.swipe.style.overflowY = '';
        this.swipe.style.height = '';
        this.swipe.firstElementChild.style.minHeight = '';
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
          this.swipe.removeEventListener('click', function (ev) {
            if (ev.target === ev.currentTarget) _this.close();
          });
        }

        this.wasApplied = false;
      }
    }
  }, {
    key: "initEvents",
    value: function initEvents() {
      var _this2 = this;

      var remove = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      // will instantiate the following touch events
      this.swipe[remove ? 'removeEventListener' : 'addEventListener']('touchstart', function (ev) {
        return _this2.startFn(ev);
      }, false);
      this.swipe[remove ? 'removeEventListener' : 'addEventListener']('touchmove', function (ev) {
        return _this2.moveFn(ev);
      }, false);
      this.swipe[remove ? 'removeEventListener' : 'addEventListener']('touchend', function (ev) {
        return _this2.endFn(ev);
      }, false);
      this.swipe[remove ? 'removeEventListener' : 'addEventListener']('touchcancel', function (ev) {
        return console.log(ev);
      }, false);
    }
  }, {
    key: "startFn",
    value: function startFn(ev) {
      if (this.applied) {
        this.prevcx = ev.touches[0].clientX;
        this.touchType = 'start';
      }
    }
  }, {
    key: "moveFn",
    value: function moveFn(ev) {
      ev.preventDefault();

      if (this.applied) {
        this._navtransition_(false);

        var cx = ev.touches[0].clientX;
        var toTranslate = this.endTranslate + cx - this.prevcx;

        if (cx > 2 && (toTranslate < 0 && !this.right || toTranslate > 0 && this.right)) {
          this.endTranslate = toTranslate;
          this.beforeEndTranslate = Math.abs(toTranslate);
          this.setTransform();
          this.prevcx = cx;
          this.touchType = 'move';
        }
      }
    }
  }, {
    key: "endFn",
    value: function endFn(ev) {
      if (this.applied) {
        if (this.touchType === 'move') {
          this._navtransition_();

          this.beforeEndTranslate / this.swipe.offsetWidth * 100 > 40 ? this.close() : this.open();
          this.touchType = 'end';
        }
      }
    }
  }, {
    key: "setTransform",
    value: function setTransform() {
      if (this.applied) {
        this.swipe.firstElementChild.style.transform = "translate(".concat(this.endTranslate + 'px', ")");
        var opacity = this.opacity - this.beforeEndTranslate / this.swipe.firstElementChild.offsetWidth * this.opacity; // adjusts side opacity based on beforeEndTranslate(current translate value)

        this.swipe.style.background = "rgba(0,0,0,".concat(opacity, ")");
      }
    }
  }, {
    key: "open",
    value: function open() {
      var _this3 = this;

      if (this.applied) {
        this.swipe.style.display = 'block';
        this.swipe.firstElementChild.style["float"] = this.right ? 'right' : 'left';
        this.swipe.firstElementChild.classList.add('sb-opened');
        setTimeout(function () {
          _this3.endTranslate = 0;

          _this3.opened.set(true);

          _this3.setTransform();

          _this3.swipe.style.background = "rgba(0,0,0,".concat(_this3.opacity, ")");
        }, 0.8);
      }
    }
  }, {
    key: "close",
    value: function close() {
      var _this4 = this;

      if (this.applied) {
        var width = (this.right ? 1 : -1) * this.swipe.offsetWidth;
        this.endTranslate = width;
        this.opened.set(false);
        this.setTransform();
        this.swipe.style.background = "rgba(0,0,0,0)";
        setTimeout(function () {
          _this4.swipe.style.display = 'none';

          _this4.swipe.firstElementChild.classList.remove('sb-opened');
        }, this.duration);
      }
    }
  }, {
    key: "toggle",
    value: function toggle() {
      if (this.opened.get()) this.close();else this.open();
    } // static methods

  }, {
    key: "right",
    get: function get() {
      return this.swipe.hasAttribute('right') && !(this.swipe.getAttribute('right') === 'false' || this.swipe.getAttribute('right') === false);
    },
    set: function set(val) {
      this.swipe.setAttribute('right', val);
      this.initStart();
    }
  }, {
    key: "width",
    get: function get() {
      var w = this.swipe.firstElementChild.getAttribute('width');
      return !w ? '80%' : /^[0-9]+$/.test("".concat(w)) ? w + '%' : w;
    }
  }, {
    key: "applied",
    get: function get() {
      return window.innerWidth <= this.screenWidth;
    }
  }]);

  return SideBarSwipe;
}();
