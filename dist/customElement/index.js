(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SidebarSwipe = {}));
}(this, (function (exports) { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }

    class SideBarSwipe {
        constructor(
          query,
          {
            sideOpacity = 0.2,
            transitionDuration = 300,
            maxScreenWidth = 768,
            transitionTimingFunc='ease'
          } = {},
        ) {
          const shadow=Array.from(document.querySelectorAll("sidebar-swipe")).filter((e)=>e.shadowRoot&&e.shadowRoot.querySelector(query));
          this.swipe = !shadow?document.querySelector(query):shadow[0].shadowRoot.firstElementChild;
          this.swipe.style.display = 'none';
          // styles
          this.duration=transitionDuration;
          this.timingFn=transitionTimingFunc;
      
          this.screenWidth=maxScreenWidth;
            //the max screen width in which the sidebar applies
          this.endTranslate = 0;
          this.beforeEndTranslate = 0; //should be abs & represents current translation value 
          this.opened = true;
          this.prevcx = 0; // previous clientX useful for touchmove
          this.opacity = sideOpacity; 
          
          this.initStart();
      
          this.initEvents();
        }
        get right(){
          return this.swipe.hasAttribute('right')&&!(this.swipe.getAttribute('right')==='false'||this.swipe.getAttribute('right')===false);
        }
        set right(val){
          this.swipe.setAttribute('right',val);
          this.initStart();
        }
        get width(){
          const w=this.swipe.firstElementChild.getAttribute('width');
          return !w?"80%":(/^[0-9]+$/.test(`${w}`)?w+'%':w)
        }
        _navtransition_(val=true){
          this.swipe.firstElementChild.style.transition = val?`transform ${this.duration}ms ${this.timingFn}`:'';
        }
        // methods
        initStart() {
          if (window.innerWidth <= this.screenWidth) {
            this.swipe.style.width = '100%';
            this.swipe.style.position = 'fixed';
            this.swipe.style.height = '100vh';
            this.swipe.style.transition = 'background .5s ease';
            this.swipe.style.background = 'rgba(0,0,0,0)';
            this.swipe.style.display = 'none';
            this.swipe.firstElementChild.style.width=this.width;
            this.swipe.addEventListener('click', (ev) => {
              if (ev.target === ev.currentTarget) this.close();
            });
            this._navtransition_();
            // this.close()
            this.endTranslate = (this.right?1:-1)*document.body.offsetWidth;
            this.opened = false;
            this.setTransform();
          } else {
            //will reset styles if current screen availWidth > maxScreenWidth spacified
              this.swipe.style.position = '';
              this.swipe.style.height = '';
              this.swipe.style.transition = '';
              this.swipe.style.width = '';
              this.swipe.style.background = '';
              this.swipe.style.display = '';
              this.swipe.style.justifyContent='';
              this.swipe.firstElementChild.style.width='';
              this.swipe.removeEventListener('click', (ev) => {
              if (ev.target === ev.currentTarget) this.close();
            });
      
            this._navtransition_(false);
            this.swipe.firstElementChild.style.transform = '';
          }
        }
        initEvents() {
          // will instantiate the following events
          this.swipe.firstElementChild.addEventListener('touchstart', (ev) => this.startFn(ev));
          this.swipe.firstElementChild.addEventListener('touchmove', (ev) => this.moveFn(ev));
          this.swipe.firstElementChild.addEventListener('touchend', (ev) => this.endFn(ev));
          window.addEventListener('resize', () => this.initStart());
        }
        startFn(ev) {
          if (window.innerWidth <= this.screenWidth) {
            this.prevcx = ev.touches[0].clientX;
            this.touchType = 'start';
          }
        }
        moveFn(ev) {
          if (window.innerWidth <= this.screenWidth) {
            this._navtransition_(false);
            let cx = ev.touches[0].clientX;
            let toTranslate = this.endTranslate + cx - this.prevcx;
            if (cx > 2 && ((toTranslate<0 && !this.right)||(toTranslate>0 && this.right))) {
              this.endTranslate = toTranslate;
              this.beforeEndTranslate = Math.abs(toTranslate);
              this.setTransform();
              this.prevcx = cx;
              this.touchType = 'move';
            }
          }
        }
        endFn() {
          if (window.innerWidth <= this.screenWidth) {
            if (this.touchType === 'move') {
    (this.beforeEndTranslate / this.swipe.offsetWidth) * 100 > 40
                ? this.close()
                : this.open();
              this.touchType = 'end';
              this._navtransition_();
            }
          }
        }
      
        setTransform() {
          if (window.innerWidth <= this.screenWidth) {
            this.swipe.firstElementChild.style.transform = `translate(${
          this.endTranslate + 'px'
        })`;
            const opacity =
              this.opacity -
              (this.beforeEndTranslate / this.swipe.firstElementChild.offsetWidth) *
                this.opacity; // adjusts side opacity based on beforeEndTranslate(current translate value)
            this.swipe.style.background = `rgba(0,0,0,${opacity})`;
          }
        }
        open() {
          if (window.innerWidth <= this.screenWidth) {
            this.swipe.style.display = 'flex';
            this.swipe.style.justifyContent = this.right?"flex-end":'';
            setTimeout(() => {
              this.endTranslate = 0;
              this.opened = true;
              this.setTransform();
              this.swipe.style.background = `rgba(0,0,0,${this.opacity})`;
            }, 1);
          }
        }
        close() {
          if (window.innerWidth <= this.screenWidth) {
            const width = (this.right?1:-1)*this.swipe.offsetWidth;
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var instance = (()=>{
        const { subscribe, update }=writable({});
        return {
            subscribe,
            set: (id, ins)=>{
                update((obj)=>{
                    obj[id]=ins;
                    return obj
                });
            },
            get: (id="svelte-sidebar-swipe")=>{
                let val;
                (subscribe((ins)=>{
                    val=ins[id];
                }))();
                return val;
            }
        }
    })();

    /* src/svelte/SideBarSwipe.svelte generated by Svelte v3.29.7 */

    function create_fragment(ctx) {
    	let div;
    	let nav;
    	let slot;
    	let nav_class_value;

    	return {
    		c() {
    			div = element("div");
    			nav = element("nav");
    			slot = element("slot");
    			this.c = noop;
    			attr(nav, "style", /*style*/ ctx[0]);
    			attr(nav, "width", /*width*/ ctx[1]);
    			attr(nav, "right", /*right*/ ctx[2]);
    			attr(nav, "class", nav_class_value = !!/*Class*/ ctx[4] ? /*Class*/ ctx[4] : "");
    			attr(div, "id", /*id*/ ctx[3]);
    			set_style(div, "display", "none");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, nav);
    			append(nav, slot);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*style*/ 1) {
    				attr(nav, "style", /*style*/ ctx[0]);
    			}

    			if (dirty & /*width*/ 2) {
    				attr(nav, "width", /*width*/ ctx[1]);
    			}

    			if (dirty & /*right*/ 4) {
    				attr(nav, "right", /*right*/ ctx[2]);
    			}

    			if (dirty & /*id*/ 8) {
    				attr(div, "id", /*id*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function instance_1($$self, $$props, $$invalidate) {
    	let { style = "" } = $$props;
    	let { width = "" } = $$props;
    	let { right = false } = $$props;
    	let { id = "svelte-sidebar-swipe" } = $$props;
    	let { sideOpacity = 0 } = $$props;
    	let { maxScreenWidth = 0 } = $$props;
    	let { transitionDuration = 0 } = $$props;
    	let { transitionTimingFunc = "" } = $$props;

    	const args = (obj => {
    		let defaults = {};
    		for (let i in obj) if (!!obj[i]) defaults[i] = obj[i];
    		return defaults;
    	})({
    		maxScreenWidth,
    		transitionDuration,
    		sideOpacity,
    		transitionTimingFunc
    	});

    	onMount(() => instance.set(id, new SideBarSwipe(`#${id}`, args)));
    	let Class = $$props.class;

    	$$self.$$set = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("style" in $$new_props) $$invalidate(0, style = $$new_props.style);
    		if ("width" in $$new_props) $$invalidate(1, width = $$new_props.width);
    		if ("right" in $$new_props) $$invalidate(2, right = $$new_props.right);
    		if ("id" in $$new_props) $$invalidate(3, id = $$new_props.id);
    		if ("sideOpacity" in $$new_props) $$invalidate(5, sideOpacity = $$new_props.sideOpacity);
    		if ("maxScreenWidth" in $$new_props) $$invalidate(6, maxScreenWidth = $$new_props.maxScreenWidth);
    		if ("transitionDuration" in $$new_props) $$invalidate(7, transitionDuration = $$new_props.transitionDuration);
    		if ("transitionTimingFunc" in $$new_props) $$invalidate(8, transitionTimingFunc = $$new_props.transitionTimingFunc);
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		style,
    		width,
    		right,
    		id,
    		Class,
    		sideOpacity,
    		maxScreenWidth,
    		transitionDuration,
    		transitionTimingFunc
    	];
    }

    class SideBarSwipe_1 extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes)
    			},
    			instance_1,
    			create_fragment,
    			safe_not_equal,
    			{
    				style: 0,
    				width: 1,
    				right: 2,
    				id: 3,
    				sideOpacity: 5,
    				maxScreenWidth: 6,
    				transitionDuration: 7,
    				transitionTimingFunc: 8
    			}
    		);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return [
    			"style",
    			"width",
    			"right",
    			"id",
    			"sideOpacity",
    			"maxScreenWidth",
    			"transitionDuration",
    			"transitionTimingFunc"
    		];
    	}

    	get style() {
    		return this.$$.ctx[0];
    	}

    	set style(style) {
    		this.$set({ style });
    		flush();
    	}

    	get width() {
    		return this.$$.ctx[1];
    	}

    	set width(width) {
    		this.$set({ width });
    		flush();
    	}

    	get right() {
    		return this.$$.ctx[2];
    	}

    	set right(right) {
    		this.$set({ right });
    		flush();
    	}

    	get id() {
    		return this.$$.ctx[3];
    	}

    	set id(id) {
    		this.$set({ id });
    		flush();
    	}

    	get sideOpacity() {
    		return this.$$.ctx[5];
    	}

    	set sideOpacity(sideOpacity) {
    		this.$set({ sideOpacity });
    		flush();
    	}

    	get maxScreenWidth() {
    		return this.$$.ctx[6];
    	}

    	set maxScreenWidth(maxScreenWidth) {
    		this.$set({ maxScreenWidth });
    		flush();
    	}

    	get transitionDuration() {
    		return this.$$.ctx[7];
    	}

    	set transitionDuration(transitionDuration) {
    		this.$set({ transitionDuration });
    		flush();
    	}

    	get transitionTimingFunc() {
    		return this.$$.ctx[8];
    	}

    	set transitionTimingFunc(transitionTimingFunc) {
    		this.$set({ transitionTimingFunc });
    		flush();
    	}
    }

    customElements.define("sidebar-swipe", SideBarSwipe_1);

    const getSidebar=(e)=>instance.get(e);

    exports.SideBarSwipe = SideBarSwipe_1;
    exports.getSidebar = getSidebar;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
