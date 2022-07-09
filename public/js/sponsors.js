(function () {
    'use strict';

    function setupNavigation(identifier, deltaY) {
        const nav = document.getElementById(identifier);
        const btn = document.querySelector(`[data-nav-btn="${identifier}"]`);
        if (!nav || !btn)
            return alert("No navbar with identifier " + identifier);
        const closers = document.querySelectorAll(`[data-nav-closer~="${identifier}"]`);
        const OPEN_STATE = "open-state-" + identifier;
        if (history.state === OPEN_STATE)
            history.back();
        window.addEventListener("popstate", closeAction);
        btn.addEventListener("click", toggle);
        let isOpen = false;
        function closeAction() {
            if (!isOpen)
                return;
            isOpen = false;
            nav.classList.remove("open");
            btn.classList.remove("active");
            document.body.classList.remove("has-nav-open");
            for (var el of closers) {
                el.classList.remove("has-nav-open");
                el.removeEventListener("click", close);
            }
        }
        function openAction() {
            if (isOpen)
                return;
            isOpen = true;
            nav.classList.add("open");
            btn.classList.add("active");
            document.body.classList.add("has-nav-open");
            for (var el of closers) {
                el.classList.add("has-nav-open");
                el.addEventListener("click", close);
            }
        }
        function close() { if (history.state === OPEN_STATE)
            history.back(); }
        function toggle() {
            if (history.state === OPEN_STATE)
                history.back();
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
            if (Math.abs(currentY - lastY) < 10)
                return;
            nav.classList.toggle("hide", currentY > lastY);
            lastY = currentY;
        }
    }
    function throttle(ms, fn) {
        let will_call = false;
        return function () {
            if (will_call)
                return;
            will_call = true;
            setTimeout(() => { fn(); will_call = false; }, ms);
        };
    }
    const thememedia = window.matchMedia("(prefers-color-scheme: dark)");
    function setupThemePreference() {
        const btns = document.querySelectorAll('input[type="radio"][name="theme"]');
        const initial = localStorage.getItem("theme");
        if (initial) {
            document.body.setAttribute("data-theme", initial);
            for (var btn of btns) {
                if (btn.value === initial) {
                    btn.checked = true;
                    break;
                }
            }
        }
        else {
            document.body.setAttribute("data-theme", "system");
        }
        for (var btn of btns)
            btn.addEventListener("change", onChange);
        function onChange() {
            document.body.setAttribute("data-theme", this.value);
            localStorage.setItem("theme", this.value);
            const dark = this.value === "system" ? thememedia.matches : (this.value === "dark");
            window.dispatchEvent(new CustomEvent("PRT:theme", { detail: { dark } }));
        }
    }

    setupThemePreference();
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

})();
