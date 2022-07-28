export function wait(ms: number) { return new Promise<void>(res => setTimeout(res,ms)) }

export function onDocumentReady(fn: () => any) {
    document.addEventListener("readystatechange", () => document.readyState === "complete" && fn());
}

export function setupNavigation(deltaY: number) {
    const nav = document.getElementById("page-nav");
    const btn = nav.querySelector("button");
    const ctn = document.getElementById("page-content");
    if(!nav || !btn || !ctn) return alert("No page-nav or page-content");

    const OPEN_STATE = "open-page-nav-state";
    if(history.state === OPEN_STATE) history.back();
    window.addEventListener("popstate", closeAction);
    btn.addEventListener("click", toggle);
    let isOpen = false;

    function closeAction() {
        if(!isOpen) return;
        isOpen = false;
        nav.classList.remove("open",);
        btn.classList.remove("active");
        ctn.classList.remove("unfocus");
        ctn.removeEventListener("click",close);
        document.body.classList.remove("has-nav-open");
    }
    function openAction() {
        if(isOpen) return;
        isOpen = true;
        nav.classList.add("open");
        btn.classList.add("active");
        ctn.classList.add("unfocus");
        ctn.addEventListener("click",close);
        document.body.classList.add("has-nav-open");
    }

    function close() { if(history.state === OPEN_STATE) history.back() }
    function toggle() {
        if(history.state === OPEN_STATE) history.back();
        else {
            history.pushState(OPEN_STATE, "");
            openAction();
        }
    }

    window.addEventListener("scroll", throttle(100, onScroll));
    let lastY = window.scrollY;
    function onScroll() {
        let currentY = window.scrollY;
        nav.classList.toggle("down", currentY > deltaY);
        if(Math.abs(currentY - lastY) < 10) return;
        nav.classList.toggle("hide", currentY > lastY);
        lastY = currentY;
    }
}

export function throttle( ms: number, fn: () => any) {
    let will_call = false;
    return function() {
        if(will_call) return;
        will_call = true;
        setTimeout(() => { fn(); will_call = false }, ms);
    }
}

export function frameThrottle(fn: () => any) {
    let req: number;
    function onFrame() { fn(); req=null; }
    return function() {
        if(req) return;
        req = requestAnimationFrame(onFrame);
    }
}

export function watermark(element: HTMLElement) {
    if(!element) return console.log("No water-mark detected");
    window.addEventListener("scroll", frameThrottle(setTrasl));
    function setTrasl() {
        const t = .35 * window.scrollY / window.innerHeight;
        element.style.setProperty("--t", t.toFixed(12));
    }
}

const thememedia = window.matchMedia("(prefers-color-scheme: dark)");

export function setupThemePreference() {
    const btns = document.querySelectorAll('input[type="radio"][name="theme"]') as NodeListOf<HTMLInputElement>;
    const initial = localStorage.getItem("theme");
    if(initial) {
        document.body.setAttribute("data-theme", initial);
        for(var btn of btns) {
            if(btn.value === initial) {
                btn.checked = true;
                break;
            }
        }
    } else { document.body.setAttribute("data-theme", "system"); }
    

    for(var btn of btns) btn.addEventListener("change", onChange);
    function onChange(this: HTMLInputElement) {
        document.body.setAttribute("data-theme", this.value);
        localStorage.setItem("theme", this.value);
        const dark = this.value === "system" ? thememedia.matches : (this.value === "dark");
        window.dispatchEvent(new CustomEvent("PRT:theme", {detail: {dark}}));
    }
}

export function isThemeDark() {
    let theme = localStorage.getItem("theme");
    if(!theme || theme === "system") return thememedia.matches;
    else return theme === "dark";
}

export function NO_FN() {}

interface MouseTRackingOptions<T> {
    move?(x: number, y: number, rect: DOMRect, extra: T): void;
    enter?(extra: T): void;
    leave?(extra: T): void;
    extra: T
}

export function trackmouse<E>(element: HTMLElement, options: MouseTRackingOptions<E>) {
    const onenter = options.enter || NO_FN;
    const onleave = options.leave || NO_FN;
    const onmove = options.move || NO_FN;
    const extra = options.extra;

    element.addEventListener("mouseenter", enter);
    
    let x: number;
    let y: number;
    let req: number = null;

    function enter() {
        req = null;
        element.addEventListener("mousemove", mousemove);
        element.addEventListener("mouseleave", leave, { once: true });
        onenter(extra);
    }
    function signal() {
        const rect = element.getBoundingClientRect();
        onmove(
            x - rect.left - window.scrollX,
            y - rect.top - window.scrollY,
            rect, extra
        );
        req = null;
    }
    function mousemove(ev: MouseEvent) {
        x = ev.pageX;
        y = ev.pageY;
        if(req == null) req = requestAnimationFrame(signal);
    }
    function leave() {
        element.removeEventListener("mousemove", mousemove);
        if(req != null) cancelAnimationFrame(req);
        onleave(extra);
    }
}