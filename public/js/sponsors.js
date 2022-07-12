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
    function NO_FN() { }
    function trackmouse(element, options) {
        const onenter = options.enter || NO_FN;
        const onleave = options.leave || NO_FN;
        const onmove = options.move || NO_FN;
        const extra = options.extra;
        element.addEventListener("mouseenter", enter);
        function enter() {
            element.addEventListener("mousemove", mousemove);
            element.addEventListener("mouseleave", leave, { once: true });
            onenter(extra);
        }
        let x;
        let y;
        let req;
        function signal() {
            const rect = element.getBoundingClientRect();
            onmove(x - rect.left - window.scrollX, y - rect.top - window.scrollY, rect, extra);
            req = null;
        }
        function mousemove(ev) {
            x = ev.pageX;
            y = ev.pageY;
            if (!req)
                req = requestAnimationFrame(signal);
        }
        function leave() {
            element.removeEventListener("mousemove", mousemove);
            cancelAnimationFrame(req);
            onleave(extra);
        }
    }

    setupThemePreference();
    setupNavigation("main-nav", 80);
    class Position {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        set(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
        eq(other) {
            this.x = other.x;
            this.y = other.y;
            return this;
        }
        add(other) {
            this.x += other.x;
            this.y += other.y;
            return this;
        }
        sub(other) {
            this.x -= other.x;
            this.y -= other.y;
            return this;
        }
        mul(k) {
            this.x *= k;
            this.y *= k;
            return this;
        }
        toString() {
            return `(${this.x}, ${this.y})`;
        }
        static distance(a, b) {
            return Math.hypot(a.x - b.x, a.y - b.y);
        }
    }
    function nofn() { }
    function spring(k, threshold = 0.01) {
        const current = new Position();
        const final = new Position();
        const temp = new Position();
        let req;
        const cbs = { move: nofn, end: nofn };
        return { aim, set, on };
        function move(time) {
            temp.eq(final).sub(current).mul(k);
            current.add(temp);
            // console.log("%cmove to "+current, "color: #bbbb11;");
            cbs.move(current.x, current.y);
            if (Position.distance(final, current) < threshold) {
                // console.log("%calmost at "+final, "color: green;");
                req = null;
                cbs.end(final.x, final.y);
            }
            else
                req = requestAnimationFrame(move);
        }
        function aim(x, y) {
            final.set(x, y);
            if (req)
                return;
            performance.now();
            req = requestAnimationFrame(move);
        }
        function set(x, y) {
            final.set(x, y);
            current.set(x, y);
            if (req) {
                cancelAnimationFrame(req);
                req = null;
            }
            cbs.end(x, y);
        }
        function on(event, fn) {
            cbs[event] = fn || nofn;
        }
    }
    class Pool {
        constructor(creator, size = 1) {
            this.available = 0;
            this.pool = [];
            this.creator = creator;
            this.pool = new Array(size);
            this.available = (1 << size) - 1;
            for (var i = 0; i < size; i++)
                this.pool[i] = creator();
        }
        get() {
            if (this.available === 0) {
                const res = this.creator();
                this.pool.push(res);
                return res;
            }
            else {
                const len = this.pool.length;
                let mask;
                for (var i = 0; i < len; i++) {
                    mask = 1 << i;
                    if (this.available & mask) {
                        //console.log("lending "+i+" - "+this.state());
                        this.available -= mask;
                        return this.pool[i];
                    }
                }
            }
        }
        free(obj) {
            const i = this.pool.indexOf(obj);
            if (i === -1)
                return;
            const mask = 1 << i;
            if (this.available & mask)
                return void console.log("wtf");
            this.available += (1 << i);
        }
        state() { return this.available.toString(2).padStart(this.pool.length); }
    }
    const cards = document.querySelectorAll(".card");
    const spring_pool = new Pool(() => {
        console.log("spring created");
        return spring(0.075, 0.0001);
    });
    for (var card of cards)
        trackmouse(card, {
            extra: { card, spring: null },
            enter, move, leave
        });
    function enter(cs) {
        if (!cs.spring)
            cs.spring = spring_pool.get();
        cs.spring.on("end", null);
        cs.spring.on("move", (x, y) => {
            cs.card.style.setProperty("--x", x.toFixed(4));
            cs.card.style.setProperty("--y", y.toFixed(4));
        });
    }
    function move(x, y, r, cs) {
        cs.spring.aim(2 * x / r.width - 1, 2 * y / r.height - 1);
        // console.log(x,y);
    }
    function leave(cs) {
        cs.spring.aim(0, 0);
        cs.spring.on("end", () => {
            cs.spring.on("end", null);
            spring_pool.free(cs.spring);
            cs.spring = null;
        });
    }

})();
