import { setupNavigation, setupThemePreference, throttle } from './utils';

setupNavigation("main-nav", 100);
setupThemePreference();

const see_more = document.getElementById("see-more") as HTMLButtonElement;
const main = document.querySelector("main") as HTMLElement;

see_more.addEventListener("click", e => {
    main.scrollIntoView({ behavior: "smooth" }); 
});

let lastDocHeight: number;
const timeline_now = document.getElementById("timeline-now") as HTMLDivElement;
function setTimelineTop() {
    const currentHeight = document.documentElement.clientHeight;
    if(currentHeight === lastDocHeight) return;
    lastDocHeight = currentHeight;
    timeline_now.style.setProperty("--top", window.innerHeight/2 + "px")
}
window.addEventListener("resize", throttle(100, setTimelineTop));
setTimelineTop();