import { navSetup } from './utils';

const see_more = document.getElementById("see-more") as HTMLButtonElement;
const header = document.querySelector("header") as HTMLElement;
const main = document.querySelector("main") as HTMLElement;

see_more.addEventListener("click", e => {
    main.scrollIntoView({ behavior: "smooth" }); 
});

const timeline_now = document.getElementById("timeline-now") as HTMLDivElement;
timeline_now.style.setProperty("--top", window.innerHeight/2 + "px")

// let request: number;
// const timeline_track = timeline_now.parentElement;

// function setTimelineNow() {
//     const y = window.scrollY - timeline_track.offsetTop + window.innerHeight/2;
//     timeline_now.style.setProperty("--top", y.toFixed(4) + "px");
//     request = null;
// }

// function trackTimelineScroll() {
//     if(request) return;
//     request = requestAnimationFrame(setTimelineNow);
// }

// const obs = new IntersectionObserver(entries => entries.forEach(entry => {
//     if(entry.isIntersecting) {
//         console.log("intersecting")
//         window.addEventListener("scroll", trackTimelineScroll);
//     }
//     else {
//         console.log("outside");
//         window.removeEventListener("scroll", trackTimelineScroll);
//     }
// }), { rootMargin: "-45% 0% -45% 0%" });
// obs.observe(timeline_track);

// navSetup("main");