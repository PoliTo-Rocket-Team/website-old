(function () {
    'use strict';

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

    watermark(document.querySelector(".water-mark"));

})();
