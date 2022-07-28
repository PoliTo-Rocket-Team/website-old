import { setupNavigation, setupThemePreference, throttle, frameThrottle } from './utils';

setupThemePreference();
setupNavigation(100);

const FAQs = Array.from(document.querySelectorAll<HTMLElement>(".question"));
let baseTop = pageTopOf(FAQs[0].offsetParent);
window.addEventListener("resize", throttle(100, () => baseTop = pageTopOf(FAQs[0].offsetParent)));
function pageTopOf(el: Element) { return el.getBoundingClientRect().top + window.scrollY; }

let lastScroll = window.scrollY;
let focusedFAQ = nearestAfter(FAQs, 0);
FAQs[focusedFAQ].classList.add("focus");
const focusNearestFAQ = frameThrottle(() => {
    const delta = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    const newFocused = delta > 0 ? nearestAfter(FAQs, focusedFAQ) : nearestBefore(FAQs, focusedFAQ);
    if(focusedFAQ != newFocused) {
        FAQs[focusedFAQ].classList.remove("focus");
        focusedFAQ = newFocused;
        FAQs[focusedFAQ].classList.add("focus");
    }
});

const obs = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) window.addEventListener("scroll", focusNearestFAQ);
    else window.removeEventListener("scroll", focusNearestFAQ);
}), { rootMargin: "-10% 0% -20% 0%" });
obs.observe(document.getElementById("faqs-section"));

function nearestAfter(elements: HTMLElement[], start: number = 0) {
    let i: number;
    let lastDistance = distanceFromCenterScreen(elements[start]);
    let currentDistance: number;
    const len = elements.length;
    for(i = start+1; i<len; i++) {
        currentDistance = distanceFromCenterScreen(elements[i]);
        if(currentDistance > lastDistance) break;
        lastDistance = currentDistance;
    }
    return i-1;
}

function nearestBefore(elements: HTMLElement[], end: number = elements.length-1) {
    let i: number;
    let lastDistance = distanceFromCenterScreen(elements[end]);
    let currentDistance: number;
    for(i = end-1; i >= 0; i--) {
        currentDistance = distanceFromCenterScreen(elements[i]);
        if(currentDistance > lastDistance) break;
        lastDistance = currentDistance;
    }
    return i+1;
}

function distanceFromCenterScreen(el: HTMLElement) {
    return Math.abs(baseTop + el.offsetTop + el.offsetHeight/2 - window.scrollY - window.innerHeight*4/9); 
}

for(var q of FAQs) {
    // obs.observe(q);
    q.addEventListener("click", bringIntoView);
}

function bringIntoView(this: HTMLElement) {
    const rect = this.getBoundingClientRect();
    window.scrollBy({ left: 0, top: rect.top - window.innerHeight/2 + this.clientHeight/2, behavior: "smooth" });
}