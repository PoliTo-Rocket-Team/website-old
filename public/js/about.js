!function(){"use strict";const e=window.matchMedia("(prefers-color-scheme: dark)");function t(){}const n="http://www.w3.org/2000/svg";function o(e,t,o){const c=document.createElementNS(n,e);if(t)for(var s in t)c.setAttribute(s,t[s]);return o&&c.append(...o),c}function c(e,t,n){const o=document.createElement(e);if(t)for(var c in t)o.setAttribute(c,t[c]);return n&&o.append(...n),o}function s(e,t,n){const o=document.createElement(e);if(o.textContent=t,n)for(var c in n)o.setAttribute(c,n[c]);return o}!function(e){const t=document.getElementById("page-nav"),n=t.querySelector("button"),o=document.getElementById("page-content");if(!t||!n||!o)return alert("No page-nav or page-content");const c="open-page-nav-state";history.state===c&&history.back(),window.addEventListener("popstate",(function(){if(!s)return;s=!1,t.classList.remove("open"),n.classList.remove("active"),o.classList.remove("unfocus"),o.removeEventListener("click",i),document.body.classList.remove("has-nav-open")})),n.addEventListener("click",(function(){history.state===c?history.back():(history.pushState(c,""),function(){if(s)return;s=!0,t.classList.add("open"),n.classList.add("active"),o.classList.add("unfocus"),o.addEventListener("click",i),document.body.classList.add("has-nav-open")}())}));let s=!1;function i(){history.state===c&&history.back()}window.addEventListener("scroll",function(e,t){let n=!1;return function(){n||(n=!0,setTimeout((()=>{t(),n=!1}),e))}}(100,(function(){let n=window.scrollY;if(t.classList.toggle("down",n>e),Math.abs(n-a)<10)return;t.classList.toggle("hide",n>a),a=n})));let a=window.scrollY;function l(){this.checked?document.body.addEventListener("click",r):document.body.removeEventListener("click",r)}function r(e){const t=document.querySelector(".link-combo > input:checked");t&&(t.parentElement.contains(e.target)||(document.querySelector(".link-combo > input").checked=!1,document.body.removeEventListener("click",r)))}document.querySelectorAll(".link-combo > input").forEach((e=>{e.checked=!1,e.addEventListener("change",l)}))}(100),function(){const t=document.querySelectorAll('input[type="radio"][name="theme"]'),n=localStorage.getItem("theme");if(n){for(var o of(document.body.setAttribute("data-theme",n),t))if(o.value===n){o.checked=!0;break}}else document.body.setAttribute("data-theme","system");for(var o of t)o.addEventListener("change",c);function c(){document.body.setAttribute("data-theme",this.value),localStorage.setItem("theme",this.value);const t="system"===this.value?e.matches:"dark"===this.value;window.dispatchEvent(new CustomEvent("PRT:theme",{detail:{dark:t}}))}}();const i=10,a=1.1;function l(e){const t=e.slices.reduce(((e,t)=>e+t.value),0);return c("div",{class:"pie-chart"},[r(e.slices,e.rotate/180*Math.PI,t,e.threshold/100),c("div",{class:"aside"},[s("h3",e.title),c("ul",null,e.slices.map((e=>c("li",{style:`--clr: ${e.color};`},[s("span",e.label),s("span"," "+p(e.value/t),{class:"hidden"})]))))])])}function r(e,t,c,s){const l=function(e,t,o,c,s){const i=document.createElementNS(n,"svg");return i.setAttribute("viewBox",`0 0 ${e} ${t}`),i.setAttribute("width",e*o+"em"),i.setAttribute("height",t*o+"em"),c&&i.setAttribute("class",c),s&&i.append(...s),i}(22,22,1,"pie-graph"),r=11..toString();let u;const d=e.length,m=new Array(d+1);for(m[0]=null==t?Math.random()*Math.PI:t,u=0;u<d;u++)m[u+1]=m[u]+e[u].value/c*Math.PI*2;const h=m.map(Math.cos),f=m.map(Math.sin),v=new Array(d);for(u=0;u<d;u++)v[u]=.5*(m[u+1]+m[u]);let y;const b={x:r,y:r,"text-anchor":"middle","dominant-baseline":"central",class:"percentage"};let g=i*(a+h[0]),L=i*(a+f[0]);for(u=0;u<d;u++){y=e[u].value/c;const t={class:"pie-slice","data-label":e[u].label+" - "+p(y),style:`--dx: ${Math.cos(v[u])}; --dy: ${Math.sin(v[u])}; --p: ${y};`},n={fill:e[u].color,d:`M${r},${r} L${g},${L} A10,10,${360*y},${+(y>.5)},1,${g=i*(a+h[u+1])},${L=i*(a+f[u+1])} Z`};l.appendChild(y<s?o("path",Object.assign(n,t)):o("g",t,[o("path",n),o("text",b,[p(y)])]))}for(u=0;u<d;u++)l.appendChild(o("line",{x1:r,y1:r,x2:(11*(1+h[u])).toString(),y2:(11*(1+f[u])).toString(),class:"pie-sep"}));return l}function u(e){e.slice.classList.add("active"),e.label.children.item(0).textContent=e.slice.getAttribute("data-label"),e.label.classList.add("show")}function d(e){e.slice.classList.remove("active"),e.label.classList.remove("show")}function m(e,t,n,o){const c=o.container.getBoundingClientRect();o.label.style.setProperty("--mx",e+n.left-c.left+"px"),o.label.style.setProperty("--my",t+n.top-c.top+"px"),o.label.style.setProperty("--dl",e+n.left+"px")}function p(e){return(100*e).toPrecision(3)+"%"}document.querySelectorAll(".pies-container").forEach((e=>{const n=e.querySelector("script");if(!n)return;const o=e.querySelector(".pie-floating-label");if(o)try{const c=JSON.parse(n.text);e.append.apply(e,c.map(l)),e.querySelectorAll(".pie-slice").forEach((n=>function(e,n,o){!function(e,n){const o=n.enter||t,c=n.leave||t,s=n.move||t,i=n.extra;let a,l;e.addEventListener("mouseenter",(function(){r=null,e.addEventListener("mousemove",d),e.addEventListener("mouseleave",m,{once:!0}),o(i)}));let r=null;function u(){const t=e.getBoundingClientRect();s(a-t.left-window.scrollX,l-t.top-window.scrollY,t,i),r=null}function d(e){a=e.pageX,l=e.pageY,null==r&&(r=requestAnimationFrame(u))}function m(){e.removeEventListener("mousemove",d),null!=r&&cancelAnimationFrame(r),c(i)}}(e,{extra:{slice:e,label:n,container:o},enter:u,leave:d,move:m})}(n,o,e)))}catch(e){console.log(e)}}))}();
