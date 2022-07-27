(function () {
    'use strict';

    function setupNavigation(deltaY) {
        const nav = document.getElementById("page-nav");
        const btn = nav.querySelector("button");
        const ctn = document.getElementById("page-content");
        if (!nav || !btn || !ctn)
            return alert("No page-nav or page-content");
        const OPEN_STATE = "open-page-nav-state";
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
            ctn.classList.remove("unfocus");
            ctn.removeEventListener("click", close);
            document.body.classList.remove("has-nav-open");
        }
        function openAction() {
            if (isOpen)
                return;
            isOpen = true;
            nav.classList.add("open");
            btn.classList.add("active");
            ctn.classList.add("unfocus");
            ctn.addEventListener("click", close);
            document.body.classList.add("has-nav-open");
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
    setupNavigation(100);
    for (var btn of document.querySelectorAll(".question > h3")) {
        btn.setAttribute("aria-expanded", "false");
        btn.addEventListener("click", toggleFAQ);
        btn.addEventListener("keydown", keyboardToggleFAQ);
    }
    function keyboardToggleFAQ(ev) {
        if (ev.key !== "Enter" && ev.key !== " ")
            return;
        ev.preventDefault();
        toggleFAQ.call(this);
    }
    // let lastOpen: HTMLElement;
    function toggleFAQ() {
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

})();
