<script>
  import sidebar from './actions';
  export let style = '';
  export let width = '';
  export let right = false;
  export let id = 'svelte-sidebar-swipe';

  export let backdropOpacity;
  export let maxScreenWidth;
  export let transitionDuration;
  export let transitionTimingFunc;

  const options = {
    maxScreenWidth,
    transitionDuration,
    backdropOpacity,
    transitionTimingFunc,
    width,
    right,
  };
  let Class = $$props.class;
</script>

<div {id} use:sidebar={options} class="sidebar-swipe-applied">
  <nav {style} class={!!Class ? Class : ''}>
    <slot />
  </nav>
</div>

<style>
  :global(.sidebar-swipe-applied) {
    width: 100%;
    position: fixed;
    overflow-y: overlay;
    height: 100%;
    transition: background 0.5s ease;
    background: rgba(128, 98, 98, 0);
    display: none;
  }
  :global(.sidebar-swipe-applied :first-child) {
    min-height: 100%;
  }
  :global(.sidebar-swipe-applied.sb-opened) {
    display: block;
  }
</style>
