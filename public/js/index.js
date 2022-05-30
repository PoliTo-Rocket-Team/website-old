(function () {
    'use strict';

    const see_more = document.getElementById("see-more");
    document.querySelector("header");
    const main = document.querySelector("main");
    see_more.addEventListener("click", e => {
        main.scrollIntoView({ behavior: "smooth" });
    });

})();
