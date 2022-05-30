const see_more = document.getElementById("see-more") as HTMLButtonElement;
const header = document.querySelector("header") as HTMLElement;
const main = document.querySelector("main") as HTMLElement;

see_more.addEventListener("click", e => {
    main.scrollIntoView({ behavior: "smooth" }); 
});