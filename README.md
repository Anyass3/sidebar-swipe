## This is a vanilla Javascript Sidebar Swipeable for touch screen devices
[link to demo](https://sidebar-swipe.netlify.app/)

# Installation
### option 1: use the cdn
Add the script to your file
```html
compiled with babel for browser compatibility
<script src="https://cdn.jsdelivr.net/npm/sidebar-swipe@0.4.0/dist/index.min.js"></script>

or may only be compatible for modern browsers.
<script src="https://cdn.jsdelivr.net/npm/sidebar-swipe@0.4.0/dist/mb.index.min.js"></script>
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

defaults: sidebar left
```html
<div id="side-bar" style="display: none">
    <nav style="width:80%">
        <slot></slot>
    </nav>
</div>
```
for sidebar right:- add a right to attribute to the side-bar element
```html
<div id="side-bar" style="display: none" right>
    <nav style="width:80%">
        <slot></slot>
    </nav>
</div>
```
the "style='display: none'" is recommeded

you can use other html tags instead of nav example div

```html
<script>
"these are the default options"
const options = {sideOpacity:0.2,transitionDuration: 300,maxScreenWidth:786,transitionTimingFunc:'ease'}

const swipe=new SideBarSwipe(selector,options)

'example'
new SideBarSwipe('#side-bar',options)
</script>
```

###opening and closing the sidebar
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
You might atleast consider changing the maxScreenWidth for which the side bar should apply to match yyour use case 
