const see_more = document.getElementById("see-more") as HTMLButtonElement;
const header = document.querySelector("header") as HTMLElement;
const main = document.querySelector("main") as HTMLElement;

see_more.addEventListener("click", e => {
    main.scrollIntoView({ behavior: "smooth" }); 
});

const navbar = document.querySelector("nav") as HTMLElement;
const navbtn = navbar.querySelector(".burger") as HTMLButtonElement;
navbtn.addEventListener("click", () => {
    navbar.classList.toggle("open");
    document.body.classList.toggle("no-scroll");
});