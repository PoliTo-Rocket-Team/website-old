interface Attributes {
    [name: string]: string
}

export function el<T extends keyof HTMLElementTagNameMap>(name: T, attrs?: Attributes, children?: (string|Node)[] ) {
    const res = document.createElement(name);
    if(attrs) for(var key in attrs) res.setAttribute(key, attrs[key]);
    if(children) res.append(...children);
    return res;
}

export function text<T extends keyof HTMLElementTagNameMap>(name: T, text: string, attrs?: Attributes) {
    const res = document.createElement(name);
    res.textContent = text;
    if(attrs) for(var key in attrs) res.setAttribute(key, attrs[key]);
    return res;
}