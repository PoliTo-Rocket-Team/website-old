!function(){"use strict";function t(t,e){let n=!1;return function(){n||(n=!0,setTimeout((()=>{e(),n=!1}),t))}}const e=window.matchMedia("(prefers-color-scheme: dark)");!function(){const t=document.querySelectorAll('input[type="radio"][name="theme"]'),n=localStorage.getItem("theme");if(n){for(var o of(document.body.setAttribute("data-theme",n),t))if(o.value===n){o.checked=!0;break}}else document.body.setAttribute("data-theme","system");for(var o of t)o.addEventListener("change",s);function s(){document.body.setAttribute("data-theme",this.value),localStorage.setItem("theme",this.value);const t="system"===this.value?e.matches:"dark"===this.value;window.dispatchEvent(new CustomEvent("PRT:theme",{detail:{dark:t}}))}}(),function(e){const n=document.getElementById("page-nav"),o=n.querySelector("button"),s=document.getElementById("page-content");if(!n||!o||!s)return alert("No page-nav or page-content");const i="open-page-nav-state";history.state===i&&history.back(),window.addEventListener("popstate",(function(){if(!c)return;c=!1,n.classList.remove("open"),o.classList.remove("active"),s.classList.remove("unfocus"),s.removeEventListener("click",r),document.body.classList.remove("has-nav-open")})),o.addEventListener("click",(function(){history.state===i?history.back():(history.pushState(i,""),function(){if(c)return;c=!0,n.classList.add("open"),o.classList.add("active"),s.classList.add("unfocus"),s.addEventListener("click",r),document.body.classList.add("has-nav-open")}())}));let c=!1;function r(){history.state===i&&history.back()}window.addEventListener("scroll",t(100,(function(){let t=window.scrollY;if(n.classList.toggle("down",t>e),Math.abs(t-a)<10)return;n.classList.toggle("hide",t>a),a=t})));let a=window.scrollY}(100);const n=Array.from(document.querySelectorAll(".question"));let o=s(n[0].offsetParent);function s(t){return t.getBoundingClientRect().top+window.scrollY}window.addEventListener("resize",t(100,(()=>o=s(n[0].offsetParent))));let i=window.scrollY,c=l(n,0);n[c].classList.add("focus");const r=function(t){let e;function n(){t(),e=null}return function(){e||(e=requestAnimationFrame(n))}}((()=>{const t=window.scrollY-i;i=window.scrollY;const e=t>0?l(n,c):function(t,e=t.length-1){let n,o,s=d(t[e]);for(n=e-1;n>=0&&(o=d(t[n]),!(o>s));n--)s=o;return n+1}(n,c);c!=e&&(n[c].classList.remove("focus"),c=e,n[c].classList.add("focus"))})),a=new IntersectionObserver((t=>t.forEach((t=>{t.isIntersecting?window.addEventListener("scroll",r):window.removeEventListener("scroll",r)}))),{rootMargin:"-10% 0% -20% 0%"});function l(t,e=0){let n,o,s=d(t[e]);const i=t.length;for(n=e+1;n<i&&(o=d(t[n]),!(o>s));n++)s=o;return n-1}function d(t){return Math.abs(o+t.offsetTop+t.offsetHeight/2-window.scrollY-4*window.innerHeight/9)}for(var u of(a.observe(document.getElementById("faqs-section")),n))u.addEventListener("click",f);function f(){const t=this.getBoundingClientRect();window.scrollBy({left:0,top:t.top-window.innerHeight/2+this.clientHeight/2,behavior:"smooth"})}}();