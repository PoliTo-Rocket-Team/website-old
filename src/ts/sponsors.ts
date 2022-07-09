import { setupThemePreference, setupNavigation } from './utils';

setupThemePreference()
setupNavigation("main-nav", 80);

// const cards = document.querySelectorAll<HTMLElement>(".card");
// for(var card of cards) {
//     card.addEventListener("mouseenter", mouseenter);
//     card.addEventListener("mouseleave", mouseleave);
// }

// function smooth(el: HTMLElement) {
//     el.classList.add("smooth");
//     setTimeout(() => el.classList.remove("smooth"), 250);
// }

// function mouseenter(this: HTMLElement, ev: MouseEvent) {
//     smooth(this);
//     setmovement.call(this, ev);
//     this.addEventListener("mousemove", setmovement);
// }

// function mouseleave(this: HTMLElement, ev: MouseEvent) {
//     smooth(this);
//     this.removeEventListener("mousemove", setmovement);
//     this.style.setProperty("--x", "0");
//     this.style.setProperty("--y", "0");
// }

// function setmovement(this: HTMLElement, ev: MouseEvent) {
//     const h = this.clientHeight;
//     const w = this.clientWidth;
//     const x = ev.pageX - this.offsetLeft;
//     const y = ev.pageY - this.offsetTop;
//     // console.log(ev.offsetX, ev.offsetY, " in ", w, h);
//     this.style.setProperty("--x", (2*x/w - 1).toFixed(4));
//     this.style.setProperty("--y", (2*y/h - 1).toFixed(4));
// }