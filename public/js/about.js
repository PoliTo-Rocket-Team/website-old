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

    const namespaceUriSVG = "http://www.w3.org/2000/svg";
    function createSVG(width, height, ratio, className, children) {
        const svg = document.createElementNS(namespaceUriSVG, "svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("width", width * ratio + "em");
        svg.setAttribute("height", height * ratio + "em");
        if (className)
            svg.setAttribute("class", className);
        if (children)
            svg.append(...children);
        return svg;
    }
    function SVG_el(name, attrs, children) {
        const el = document.createElementNS(namespaceUriSVG, name);
        if (attrs)
            for (var key in attrs)
                el.setAttribute(key, attrs[key]);
        if (children)
            el.append(...children);
        return el;
    }
    function randomHEX() { return "#" + Math.floor(Math.random() * 16777215).toString(16); }

    const pies = [
        {
            title: "Courses of members",
            slices: [
                { portion: .6, label: "Aerospace", color: 0x3bdb84 },
                { portion: .3, label: "Mechanical", color: 0xdd4991 },
                { portion: .1, label: "Others", color: 0xdd0011 },
            ]
        }
    ];

    setupNavigation(100);
    setupThemePreference();
    const PIE_RADIUS = 10;
    const PIE_SCALE = 1.1;
    const piesContainer = document.getElementById("pies");
    piesContainer.appendChild(createPie(pies[0].slices));
    function createPie(slices) {
        const svg = createSVG(2.2 * PIE_RADIUS, 2.2 * PIE_RADIUS, 1, "pie");
        let i;
        const len = slices.length;
        const angles = new Array(len + 1);
        const c = (PIE_RADIUS * PIE_SCALE).toString();
        angles[0] = Math.random() * Math.PI * 2;
        for (i = 0; i < len; i++) {
            angles[i + 1] = angles[i] + slices[i].portion * Math.PI * 2;
        }
        const coss = angles.map(Math.cos);
        const sins = angles.map(Math.sin);
        // medians 
        const medians = new Array(len);
        for (i = 0; i < len; i++) {
            medians[i] = (angles[i + 1] + angles[i]) * 0.5;
        }
        // colored slices
        let p;
        const textAttrs = {
            x: c, y: c,
            "text-anchor": "middle",
            "dominant-baseline": "central",
        };
        let x = PIE_RADIUS * (PIE_SCALE + coss[0]);
        let y = PIE_RADIUS * (PIE_SCALE + sins[0]);
        for (i = 0; i < len; i++) {
            p = slices[i].portion;
            svg.appendChild(SVG_el("g", {
                "data-label": slices[i].label,
                style: `--dx: ${Math.cos(medians[i])}; --dy: ${Math.sin(medians[i])}; --p: ${p};`
            }, [
                SVG_el("path", {
                    fill: slices[i].color ? "#" + slices[i].color.toString(16) : randomHEX(),
                    d: `M${c},${c} L${x},${y} A${PIE_RADIUS},${PIE_RADIUS},${p * 360},${+(p > 0.5)},1,${x = PIE_RADIUS * (PIE_SCALE + coss[i + 1])},${y = PIE_RADIUS * (PIE_SCALE + sins[i + 1])} Z`
                }),
                SVG_el("text", textAttrs, [slices[i].portion * 100 + '%']),
                SVG_el("title", null, [slices[i].label]),
            ]));
        }
        // sep lines
        for (i = 0; i < len; i++) {
            svg.appendChild(SVG_el("line", {
                x1: c, y1: c,
                x2: (PIE_SCALE * PIE_RADIUS * (1 + coss[i])).toString(),
                y2: (PIE_SCALE * PIE_RADIUS * (1 + sins[i])).toString(),
                class: "pie-sep"
            }));
        }
        return svg;
    }

})();
