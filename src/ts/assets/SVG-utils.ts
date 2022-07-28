const namespaceUriSVG = "http://www.w3.org/2000/svg";

export function createSVG(width: number, height: number, ratio: number, className?: string, children?: SVGElement[]) {
    const svg = document.createElementNS(namespaceUriSVG, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", width*ratio + "em");
    svg.setAttribute("height", height*ratio + "em");
    if(className) svg.setAttribute("class", className);
    if(children) svg.append(...children);
    return svg;
}

interface Attributes {
    [name: string]: string
}

export function SVG_el<N extends keyof SVGElementTagNameMap>(name: N, attrs?: Attributes, children?: (SVGElement|string)[]) {
    const el = document.createElementNS(namespaceUriSVG, name);
    if(attrs) for(var key in attrs) el.setAttribute(key, attrs[key]);
    if(children) el.append(...children);
    return el;
}

export function SVG_g(attrs?: Attributes, children?: SVGElement[]) {
    const g = document.createElementNS(namespaceUriSVG, "g");
    if(attrs) for(var key in attrs) g.setAttribute(key, attrs[key]);
    if(children) g.append(...children);
    return g;
}

export function SVG_title(text: string) {
    const t = document.createElementNS(namespaceUriSVG, "title");
    t.textContent = text;
    return t;
}

export function randomHEX() { return "#"+Math.floor(Math.random()*16777215).toString(16); }

const colors = [ 
    0x93d086, 
    0x7683cb, 
    0x2479cf, 
    0xa22cba, 
    0x36b951, 
    0xdd0011, 
    0xb28c23, 
    0xb0764f, 
    0xbd524b, 
    0xe7a965, 
    0x3bdb84, 
    0xdd4991
];