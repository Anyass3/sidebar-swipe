
import {writable} from "svelte/store"

import SideBarSwipe from "../index";
import { get } from "svelte/store";
import params from "./params"

const swipe = (get(writable(()=>{
    let args=get(params)
    return new SideBarSwipe('#svelte-sidebar-swipe',args)
})))

export default swipe