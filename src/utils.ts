export function wait(ms: number) { return new Promise<void>(res => setTimeout(res,ms)) }

export function navSetup(identifier: string) {
    const btn = document.querySelector(`[data-nav-btn="${identifier}"]`);
    const nav = document.querySelector(`[data-nav="${identifier}"]`);
    if(!nav || !btn) return alert("No navbar with identifier " + identifier);

    document.body.setAttribute("data-nav-open", "false");
    const contents = document.querySelectorAll<HTMLElement>(`[data-nav-closer~="${identifier}"]`);
    const OPEN_STATE = "open-state-" + identifier;
    window.addEventListener("popstate", closeAction);
    btn.addEventListener("click", toggle);
    let isOpen = false;

    function closeAction() {
        if(!isOpen) return;
        isOpen = false;
        nav.classList.remove("open",);
        btn.classList.remove("active");
        document.body.classList.remove("has-nav-open");
        for(var el of contents) {
            el.classList.remove("has-nav-open");
            el.removeEventListener("click", close);
        }
    }
    function openAction() {
        if(isOpen) return;
        isOpen = true;
        nav.classList.add("open",);
        btn.classList.add("active");
        document.body.classList.add("has-nav-open");
        for(var el of contents) {
            el.classList.add("has-nav-open");
            el.addEventListener("click", close);
        }
    }

    function close() { if(history.state === OPEN_STATE) history.back() }
    function toggle() {
        if(history.state === OPEN_STATE) history.back();
        else {
            history.pushState(OPEN_STATE, "");
            openAction();
        }
    }
}