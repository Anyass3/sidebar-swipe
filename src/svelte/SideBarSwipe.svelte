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

  let cls = '';
  export { cls as class };

  const options = {
    maxScreenWidth,
    transitionDuration,
    backdropOpacity,
    transitionTimingFunc,
    width,
    right,
  };
</script>

<div {id} use:sidebar={options} class="sidebar-swipe-applied closed">
  <nav {style} class={cls}>
    <slot />
  </nav>
</div>

<style>
  .sidebar-swipe-applied {
    width: 100%;
    position: fixed;
    overflow-y: overlay;
    height: 100%;
    transition: background 0.5s ease;
    background: rgba(128, 98, 98, 0);
    display: block;
  }
  .sidebar-swipe-applied :first-child {
    min-height: 100%;
  }
  .sidebar-swipe-applied.closed {
    display: none;
  }
</style>
