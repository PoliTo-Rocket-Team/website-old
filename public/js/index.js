!function(){"use strict";function e(e,t){let n=!1;return function(){n||(n=!0,setTimeout((()=>{t(),n=!1}),e))}}const t=window.matchMedia("(prefers-color-scheme: dark)");!function(t){const n=document.getElementById("page-nav"),o=n.querySelector("button"),s=document.getElementById("page-content");if(!n||!o||!s)return alert("No page-nav or page-content");const i="open-page-nav-state";history.state===i&&history.back(),window.addEventListener("popstate",(function(){if(!c)return;c=!1,n.classList.remove("open"),o.classList.remove("active"),s.classList.remove("unfocus"),s.removeEventListener("click",a),document.body.classList.remove("has-nav-open")})),o.addEventListener("click",(function(){history.state===i?history.back():(history.pushState(i,""),function(){if(c)return;c=!0,n.classList.add("open"),o.classList.add("active"),s.classList.add("unfocus"),s.addEventListener("click",a),document.body.classList.add("has-nav-open")}())}));let c=!1;function a(){history.state===i&&history.back()}window.addEventListener("scroll",e(100,(function(){let e=window.scrollY;if(n.classList.toggle("down",e>t),Math.abs(e-r)<10)return;n.classList.toggle("hide",e>r),r=e})));let r=window.scrollY}(100),function(){const e=document.querySelectorAll('input[type="radio"][name="theme"]'),n=localStorage.getItem("theme");if(n){for(var o of(document.body.setAttribute("data-theme",n),e))if(o.value===n){o.checked=!0;break}}else document.body.setAttribute("data-theme","system");for(var o of e)o.addEventListener("change",s);function s(){document.body.setAttribute("data-theme",this.value),localStorage.setItem("theme",this.value);const e="system"===this.value?t.matches:"dark"===this.value;window.dispatchEvent(new CustomEvent("PRT:theme",{detail:{dark:e}}))}}();const n=document.getElementById("see-more"),o=document.querySelector("main"),s=document.querySelector("header");let i;n.addEventListener("click",(e=>{o.scrollIntoView({behavior:"smooth"})}));const c=document.getElementById("timeline-now");function a(){const e=document.documentElement.clientHeight;e!==i&&(s.style.setProperty("--h",window.innerHeight+"px"),i=e,c.style.setProperty("--top",window.innerHeight/2+"px"))}window.addEventListener("resize",e(100,a)),a()}();
