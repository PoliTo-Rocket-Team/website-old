!function(){"use strict";function e(e,t){let n=!1;return function(){n||(n=!0,setTimeout((()=>{t(),n=!1}),e))}}const t=window.matchMedia("(prefers-color-scheme: dark)");!function(t){const n=document.getElementById("page-nav"),o=n.querySelector("button"),c=document.getElementById("page-content");if(!n||!o||!c)return alert("No page-nav or page-content");const s="open-page-nav-state";history.state===s&&history.back(),window.addEventListener("popstate",(function(){if(!i)return;i=!1,n.classList.remove("open"),o.classList.remove("active"),c.classList.remove("unfocus"),c.removeEventListener("click",a),document.body.classList.remove("has-nav-open")})),o.addEventListener("click",(function(){history.state===s?history.back():(history.pushState(s,""),function(){if(i)return;i=!0,n.classList.add("open"),o.classList.add("active"),c.classList.add("unfocus"),c.addEventListener("click",a),document.body.classList.add("has-nav-open")}())}));let i=!1;function a(){history.state===s&&history.back()}window.addEventListener("scroll",e(100,(function(){let e=window.scrollY;if(n.classList.toggle("down",e>t),Math.abs(e-d)<10)return;n.classList.toggle("hide",e>d),d=e})));let d=window.scrollY;function r(){this.checked?document.body.addEventListener("click",u):document.body.removeEventListener("click",u)}function u(e){const t=document.querySelector(".link-combo > input:checked");t&&(t.parentElement.contains(e.target)||(document.querySelector(".link-combo > input").checked=!1,document.body.removeEventListener("click",u)))}document.querySelectorAll(".link-combo > input").forEach((e=>{e.checked=!1,e.addEventListener("change",r)}))}(100),function(){const e=document.querySelectorAll('input[type="radio"][name="theme"]'),n=localStorage.getItem("theme");if(n){for(var o of(document.body.setAttribute("data-theme",n),e))if(o.value===n){o.checked=!0;break}}else document.body.setAttribute("data-theme","system");for(var o of e)o.addEventListener("change",c);function c(){document.body.setAttribute("data-theme",this.value),localStorage.setItem("theme",this.value);const e="system"===this.value?t.matches:"dark"===this.value;window.dispatchEvent(new CustomEvent("PRT:theme",{detail:{dark:e}}))}}();const n=document.getElementById("see-more"),o=document.querySelector("main");let c;function s(){const e=document.documentElement.clientHeight;e!==c&&(c=e,document.body.style.setProperty("--window-height",window.innerHeight+"px"))}document.querySelector("header"),n.addEventListener("click",(e=>{o.scrollIntoView({behavior:"smooth"})})),window.addEventListener("resize",e(100,s)),s()}();
