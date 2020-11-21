<script>
    import params from "./params"

    export let style="";
    export let width='';
    export let id="svelte-sidebar-swipe";


    export let sideOpacity=0.9;
    export let maxScreenWidth='';
    export let transitionDuration='';
    export let transitionTimingFunc='';

    $: params.set({
        maxScreenWidth,
        transitionDuration,
        sideOpacity,
        transitionTimingFunc
    })
    let Class=$$props.class;
</script>

<div {id}>
    <nav {style} {width} class={!!Class?Class:''}>
        <slot></slot>
    </nav>
</div>