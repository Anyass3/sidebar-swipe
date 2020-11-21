
import {writable} from "svelte/store"

export default (function buildStore(){
    let defaults = {}
    const { subscribe, set } =writable(defaults)
    return {
        subscribe,
        set: (obj)=>{
            let changed=false;
            for(let i in obj)
                 if(!!obj[i]) {
                     defaults[i]=obj[i]
                     changed=true
                };
                if(changed)set(defaults)
        }
    }
})()