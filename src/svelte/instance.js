
import {writable} from "svelte/store"

export default (()=>{
    const { subscribe, update }=writable({})
    return {
        subscribe,
        set: (id, ins)=>{
            update((obj)=>{
                obj[id]=ins
                return obj
            })
        },
        get: (id="svelte-sidebar-swipe")=>{
            let val;
            (subscribe((ins)=>{
                val=ins[id]
            }))();
            return val;
        }
    }
})()