import { setupNavigation, setupThemePreference, throttle } from './utils';

setupNavigation(100);
setupThemePreference();

const see_more = document.getElementById("see-more") as HTMLButtonElement;
const main = document.querySelector("main") as HTMLElement;
const header = document.querySelector("header");

see_more.addEventListener("click", e => {
    main.scrollIntoView({ behavior: "smooth" }); 
});

let lastDocHeight: number;
function setWindowHeight() {
    const currentHeight = document.documentElement.clientHeight;
    if(currentHeight === lastDocHeight) return;
    lastDocHeight = currentHeight;
    document.body.style.setProperty("--window-height", window.innerHeight + 'px');
}
window.addEventListener("resize", throttle(100, setWindowHeight));
setWindowHeight();