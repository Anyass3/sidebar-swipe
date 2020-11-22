## This is a vanilla Javascript Sidebar Swipeable for touch screen devices
[link to demo](https://sidebar-swipe.netlify.app/demo/)


# Installation
### option 1: use the cdn
Add the script to your file

**This is for normal usage below**
```html
<!-- compiled with babel for browser compatibility -->
<script src="https://cdn.jsdelivr.net/npm/sidebar-swipe@0.8.0/dist/lib/index.min.js"></script>
<!-- or -->
<!--  may only be compatible for modern browsers. -->
<script src="https://cdn.jsdelivr.net/npm/sidebar-swipe@0.8.0/dist/lib/mb.index.min.js"></script>
```

### option 2: using npm
```shell
npm install sidebar-swipe
```
then in your file
```javascript
import SideBarSwipe from 'sidebar-swipe'
```
# Usage

### FOR SVELTE
check the example in the svelte repl demo on how to use the svelte component.

the svelte component sample with defaults
```svelte
<SideBarSwipe
    width='80'
    sideOpacity="0.2" 
    maxScreenWidth='768'
    transitionDuration='300'
    transitionTimingFunc='ease'
    right={false}
    >

</SideBarSwipe>
```
    Because for svelte it's a component not just a lib.
[demo for svelte](https://svelte.dev/repl/474bd480f1864a2a8e0de961ba5226e7?version=3.29.7)
### As Custom Elememt
To use as custom element check the code or files "demo/custom" to see the example

the custom element sample with defaults
```html
<sidebar-swipe
    width=80
    sideOpacity="0.2"
    maxScreenWidth=768
    transitionDuration=300
    transitionTimingFunc=ease
    right=false
>
    
</sidebar-swipe>
```
[link to custom Elememt demo](https://sidebar-swipe.netlify.app/demo/custom)


### normal usage
defaults: sidebar left: don't add the right attribute or add right=false attribute

for sidebar right:- add a right or right=true attribute to the side-bar element
```html
<div id="side-bar" style="display: none" right=false>
    <nav width=76>
        <slot></slot>
    </nav>
</div>
```
**NOTE:**

the "style='display: none'" is recommeded

you can use any other html tags instead of nav example div

```html
<script>
"these are the default options"
const options = {sideOpacity:0.2,transitionDuration: 300,maxScreenWidth:786,transitionTimingFunc:'ease'}

const swipe=new SideBarSwipe(selector,options)

'example'
new SideBarSwipe('#side-bar',options)
</script>
```

### opening and closing the sidebar
```javascript
swipe.open() // to open the sidebar
swipe.close() // to close the sidebar
swipe.toggle() //to toggle the open and close 
```
example
```html
<button onclick="swipe.open()"><button>
```

Note: **swipe** is the _swipe_ variable declared with const above.

You might atleast consider changing the maxScreenWidth for which the side bar should apply to match your use case 



**NOTE:**
width is in percentage(%):- it is the width of the sidebar :: defaults 80

sideOpacity: it's the opacity of the remaining width(100-width of sidebar) :: defaults 0.3

maxScreenWidth: It's maximum window.innnerwidth for the browser at which the sidebar should apply and more that the elements within it will be visible but not as a sidebar :: defaults 768

transitionDuration: this is total transition duration for the .open() and .close() of the sidebar but not for swipe :: defaults 300

transitionTimingFunc: It is the timing function of the transition :: defaults 'ease'

right: if true the sidebar will swipe from the right AND if false the sidebar will swipe from the left :: defaults left
