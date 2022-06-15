(function () {
    'use strict';

    function setupNavigation(identifier, deltaY) {
        const nav = document.getElementById(identifier);
        const btn = document.querySelector(`[data-nav-btn="${identifier}"]`);
        if (!nav || !btn)
            return alert("No navbar with identifier " + identifier);
        const closers = document.querySelectorAll(`[data-nav-closer~="${identifier}"]`);
        const OPEN_STATE = "open-state-" + identifier;
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
    function frameThrottle(fn) {
        let req;
        function onFrame() { fn(); req = null; }
        return function () {
            if (req)
                return;
            req = requestAnimationFrame(onFrame);
        };
    }
    function watermark(element) {
        if (!element)
            return console.log("No water-mark detected");
        window.addEventListener("scroll", frameThrottle(setTrasl));
        function setTrasl() {
            const t = .35 * window.scrollY / window.innerHeight;
            element.style.setProperty("--t", t.toFixed(12));
        }
    }
    function setupThemePreference() {
        const btns = document.querySelectorAll('input[type="radio"][name="theme"]');
        let initial = localStorage.getItem("theme");
        if (initial) {
            document.body.setAttribute("data-theme", initial);
            for (var btn of btns) {
                if (btn.value === initial) {
                    btn.checked = true;
                    break;
                }
            }
        }
        for (var btn of btns)
            btn.addEventListener("change", onChange);
        function onChange() {
            document.body.setAttribute("data-theme", this.value);
            localStorage.setItem("theme", this.value);
        }
    }

    watermark(document.querySelector(".water-mark"));
    setupNavigation("main-nav", 70);
    setupThemePreference();

})();
