<script>
    export let style="";
    export let sideOPacity=0.1;
    export let width=80;
    export let id="svelte-sidebar-swipe";
    export let maxScreenWidth="768";
    export let transitionTime=300;
    let Class=$$props.class;
    import SideBarSwipe from "../index.js";
    swipe=new SideBarSwipe(`#${id}`,{sideOPacity,maxScreenWidth,transitionTime})

</script>

<div {id}>
    <nav {style} {width} class={!!Class?Class:''}>
        <slot></slot>
    </nav>
</div>