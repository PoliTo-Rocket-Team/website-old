import { setupNavigation, setupThemePreference } from './utils';

setupNavigation("main-nav");
setupThemePreference();

const see_more = document.getElementById("see-more") as HTMLButtonElement;
const main = document.querySelector("main") as HTMLElement;

see_more.addEventListener("click", e => {
    main.scrollIntoView({ behavior: "smooth" }); 
});

function throttle(fn: () => any, ms: number) {
    let will_call = false;
    return function() {
        if(will_call) return;
        will_call = true;
        setTimeout(() => { fn(); will_call = false });
    }
}

let lastDocHeight: number;
const timeline_now = document.getElementById("timeline-now") as HTMLDivElement;
function setTimelineTop() {
    const currentHeight = document.documentElement.clientHeight;
    if(currentHeight === lastDocHeight) return;
    lastDocHeight = currentHeight;
    timeline_now.style.setProperty("--top", window.innerHeight/2 + "px")
}
window.addEventListener("resize", throttle(setTimelineTop, 200));
setTimelineTop();