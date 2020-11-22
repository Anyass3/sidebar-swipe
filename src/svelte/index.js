import SideBarSwipe from './SideBarSwipe.svelte';
import instance from "./instance";

const getSidebar=(e)=>instance.get(e)
export { SideBarSwipe, getSidebar }