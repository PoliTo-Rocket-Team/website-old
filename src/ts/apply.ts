import { setupNavigation, setupThemePreference } from './utils';

setupThemePreference();
setupNavigation(100);


for(var btn of document.querySelectorAll<HTMLElement>(".question > h3")) {
    // btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", toggleFAQ)
    btn.addEventListener("keydown", keyboardToggleFAQ);
}

function keyboardToggleFAQ(this: HTMLElement, ev: KeyboardEvent) {
    if(ev.key !== "Enter" && ev.key !== " ") return;
    ev.preventDefault();
    toggleFAQ.call(this);
}

// let lastOpen: HTMLElement;
function toggleFAQ(this: HTMLElement) {
    // if(lastOpen) lastOpen.setAttribute("aria-expanded", "false");
    // if(lastOpen === this) {
    //     lastOpen = null;
    // } else {
    //     this.setAttribute("aria-expanded", "true");
    //     lastOpen = this;
    // }
    const expanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", (!expanded).toString());
}