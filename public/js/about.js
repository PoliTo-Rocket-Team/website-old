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
    function NO_FN() { }
    function trackmouse(element, options) {
        const onenter = options.enter || NO_FN;
        const onleave = options.leave || NO_FN;
        const onmove = options.move || NO_FN;
        const extra = options.extra;
        element.addEventListener("mouseenter", enter);
        let x;
        let y;
        let req = null;
        function enter() {
            req = null;
            element.addEventListener("mousemove", mousemove);
            element.addEventListener("mouseleave", leave, { once: true });
            onenter(extra);
        }
        function signal() {
            const rect = element.getBoundingClientRect();
            onmove(x - rect.left - window.scrollX, y - rect.top - window.scrollY, rect, extra);
            req = null;
        }
        function mousemove(ev) {
            x = ev.pageX;
            y = ev.pageY;
            if (req == null)
                req = requestAnimationFrame(signal);
        }
        function leave() {
            element.removeEventListener("mousemove", mousemove);
            if (req != null)
                cancelAnimationFrame(req);
            onleave(extra);
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

    const pies = [
        {
            title: "Members by program",
            slices: [
                { value: 16, label: "Aerospace Engineering", color: "#3bdb84" },
                { value: 1, label: "Electronic Engineering", color: "#dd4991" },
                { value: 3, label: "Mechanical Engineering", color: "#dd0011" },
                { value: 1, label: "Physics Engineering", color: "#2479cf" },
                { value: 1, label: "Other non-Engineering", color: "#e1a463" },
            ],
            rotate: 255,
            threshold: 5,
        },
        {
            title: "Members by level",
            slices: [
                { value: 11, label: "Bachelor's", color: "#4e7bc1" },
                { value: 9, label: "Master's", color: "#e1a463" },
                { value: 1, label: "Ph.D.", color: "#3bdb84" },
            ],
            rotate: 0,
            threshold: 0,
        },
        {
            title: "International students rate",
            slices: [
                { value: 19, label: "Domestic", color: "#dd4991" },
                { value: 2, label: "International", color: "#e1a463" },
            ],
            rotate: 0,
            threshold: 0,
        }
    ];
    /**
     * pastel colors
     * blue: #4e7bc1
     * green: #3bdb84
     * gold: #e1a463
     * pink: #dd4991
     */

    function el(name, attrs, children) {
        const res = document.createElement(name);
        if (attrs)
            for (var key in attrs)
                res.setAttribute(key, attrs[key]);
        if (children)
            res.append(...children);
        return res;
    }
    function text(name, text, attrs) {
        const res = document.createElement(name);
        res.textContent = text;
        if (attrs)
            for (var key in attrs)
                res.setAttribute(key, attrs[key]);
        return res;
    }

    setupNavigation(100);
    setupThemePreference();
    const PIE_RADIUS = 10;
    const PIE_SCALE = 1.1;
    const piesContainer = document.getElementById("pies");
    const floatingLabel = document.getElementById("floating-label");
    piesContainer.append(...pies.map(createPie));
    function createPie(pie) {
        const total = pie.slices.reduce((p, c) => p + c.value, 0);
        return el("div", { class: "pie-chart" }, [
            createPieGraph(pie.slices, pie.rotate / 180 * Math.PI, total, pie.threshold / 100),
            el("div", { class: "aside" }, [
                text("h3", pie.title),
                el("ul", null, pie.slices.map(slice => el("li", {
                    style: `--clr: ${slice.color};`
                }, [
                    text("span", slice.label),
                    text("span", " " + percetageStringOf(slice.value / total), { class: "hidden" })
                ])))
            ])
        ]);
    }
    function createPieGraph(slices, rotate, total, threshold) {
        const svg = createSVG(2.2 * PIE_RADIUS, 2.2 * PIE_RADIUS, 1, "pie-graph");
        const c = (PIE_RADIUS * PIE_SCALE).toString();
        let i;
        const len = slices.length;
        const angles = new Array(len + 1);
        angles[0] = rotate == null ? Math.random() * Math.PI : rotate;
        for (i = 0; i < len; i++) {
            angles[i + 1] = angles[i] + slices[i].value / total * Math.PI * 2;
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
        const percentageTextAttrs = {
            x: c, y: c,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            class: "percentage",
        };
        let x = PIE_RADIUS * (PIE_SCALE + coss[0]);
        let y = PIE_RADIUS * (PIE_SCALE + sins[0]);
        for (i = 0; i < len; i++) {
            p = slices[i].value / total;
            const sliceAttr = {
                class: "pie-slice",
                "data-label": slices[i].label + " - " + percetageStringOf(p),
                style: `--dx: ${Math.cos(medians[i])}; --dy: ${Math.sin(medians[i])}; --p: ${p};`
            };
            const pathAttr = {
                fill: slices[i].color,
                d: `M${c},${c} L${x},${y} A${PIE_RADIUS},${PIE_RADIUS},${p * 360},${+(p > 0.5)},1,${x = PIE_RADIUS * (PIE_SCALE + coss[i + 1])},${y = PIE_RADIUS * (PIE_SCALE + sins[i + 1])} Z`
            };
            setupSlice(svg.appendChild(p < threshold
                ? SVG_el("path", Object.assign(pathAttr, sliceAttr))
                : SVG_el("g", sliceAttr, [
                    SVG_el("path", pathAttr),
                    SVG_el("text", percentageTextAttrs, [percetageStringOf(p)]),
                ])));
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
    function setupSlice(slice) {
        trackmouse(slice, { extra: slice, enter, leave, move });
    }
    function enter(slice) {
        slice.classList.add("active");
        floatingLabel.children.item(0).textContent = slice.getAttribute("data-label");
        floatingLabel.classList.add("show");
    }
    function leave(slice) {
        slice.classList.remove("active");
        floatingLabel.classList.remove("show");
    }
    function move(x, y, rect) {
        const cbcr = piesContainer.getBoundingClientRect();
        floatingLabel.style.setProperty("--mx", (x + rect.left - cbcr.left) + "px");
        floatingLabel.style.setProperty("--my", (y + rect.top - cbcr.top) + "px");
        floatingLabel.style.setProperty("--dl", (x + rect.left) + "px");
    }
    function percetageStringOf(portion) { return (portion * 100).toPrecision(3) + '%'; }

})();
