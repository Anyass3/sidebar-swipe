<script>
import { onMount } from "svelte";

import SideBarSwipe from "../index";
import instance from "./instance";


export let style="";
export let width='';
export let right=false;
export let id="svelte-sidebar-swipe";


export let sideOpacity=0;
export let maxScreenWidth=0;
export let transitionDuration=0;
export let transitionTimingFunc='';

const args=((obj)=>{
    let defaults={}
    for(let i in obj)if(!!obj[i])defaults[i]=obj[i]
    return defaults
    })({
    maxScreenWidth,
    transitionDuration,
    sideOpacity,
    transitionTimingFunc
})
onMount(()=>instance.set(id,new SideBarSwipe(`#${id}`,args)))
let Class=$$props.class;
</script>

<div {id} style="display:none">
    <nav {style} {width} {right} class={!!Class?Class:''}>
        <slot></slot>
    </nav>
</div>