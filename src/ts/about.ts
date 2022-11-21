import { setupNavigation, setupThemePreference, trackmouse } from "./utils";
import { createSVG, SVG_el } from "./utils/SVG-utils";
import { Pie, PieSlice } from "./utils/about-stats";
import { el, text } from './utils/HTML-utils';

setupNavigation(100);
setupThemePreference();

const PIE_RADIUS = 10;
const PIE_SCALE = 1.1;

const piesContainers = document.querySelectorAll(".pies-container");
piesContainers.forEach(el => {
    const script = el.querySelector("script");
    if(!script) return;
    const label = el.querySelector(".pie-floating-label") as HTMLElement;
    if(!label) return;
    try {
        const data = JSON.parse(script.text);
        el.append.apply(el, data.map(createPie));
        el.querySelectorAll(".pie-slice").forEach(s => setupSlice(
            s as SVGElement, 
            label, 
            el as HTMLElement
        ));
    }
    catch(err) {
        console.log(err);
    }
});

function createPie(pie: Pie) {
    const total = pie.slices.reduce((p,c) => p + c.value, 0);

    return el("div", { class: "pie-chart" }, [
        createPieGraph(pie.slices, pie.rotate/180*Math.PI, total, pie.threshold/100),
        el("div", { class: "aside" }, [
            text("h3", pie.title),
            el("ul", null, pie.slices.map(slice => el("li", {
                style: `--clr: ${slice.color};`
            }, [
                text("span", slice.label),
                text("span", " "+percetageStringOf(slice.value/total), { class: "hidden" })
            ])))
        ])
    ])
}

function createPieGraph(slices: PieSlice[], rotate: number, total: number, threshold: number) {
    const svg = createSVG(2.2*PIE_RADIUS,2.2*PIE_RADIUS,1,"pie-graph");
    
    const c = (PIE_RADIUS*PIE_SCALE).toString();
    
    let i: number;
    const len = slices.length;
    const angles = new Array(len+1);
    angles[0] = rotate == null ? Math.random()*Math.PI : rotate;
    for(i=0; i<len; i++) { angles[i+1] = angles[i] + slices[i].value/total*Math.PI*2; }
    const coss = angles.map(Math.cos);
    const sins = angles.map(Math.sin);
    // medians 
    const medians = new Array(len);
    for(i=0; i<len; i++) {
        medians[i] = (angles[i+1] + angles[i]) * 0.5;
    }
    // colored slices
    let p: number;
    const percentageTextAttrs = {
        x: c, y: c,
        "text-anchor": "middle",
        "dominant-baseline": "central",
        class: "percentage",
    }
    let x = PIE_RADIUS*(PIE_SCALE+coss[0]);
    let y = PIE_RADIUS*(PIE_SCALE+sins[0]);
    for(i=0; i<len; i++) {
        p = slices[i].value/total;
        const sliceAttr = {
            class: "pie-slice",
            "data-label":  slices[i].label + " - " + percetageStringOf(p),
            style: `--dx: ${Math.cos(medians[i])}; --dy: ${Math.sin(medians[i])}; --p: ${p};`
        };
        const pathAttr = {
            fill: slices[i].color,
            d: `M${c},${c} L${x},${y} A${PIE_RADIUS},${PIE_RADIUS},${p*360},${+(p>0.5)},1,${
                x = PIE_RADIUS*(PIE_SCALE+coss[i+1])
            },${
                y = PIE_RADIUS*(PIE_SCALE+sins[i+1])
            } Z`
        };
        svg.appendChild(
            p < threshold 
            ? SVG_el("path", Object.assign(pathAttr, sliceAttr))
            : SVG_el("g", sliceAttr, [
                SVG_el("path", pathAttr),
                SVG_el("text", percentageTextAttrs, [ percetageStringOf(p) ]),
            ])
        );
    }
    // sep lines
    for(i=0; i<len; i++) {
        svg.appendChild(SVG_el("line", {
            x1: c, y1: c,
            x2: (PIE_SCALE*PIE_RADIUS*(1+coss[i])).toString(),
            y2: (PIE_SCALE*PIE_RADIUS*(1+sins[i])).toString(), 
            class: "pie-sep"
        }));
    }

    return svg;
}

interface HoverPieElements {
    slice: SVGElement;
    label: HTMLElement;
    container: HTMLElement;
}

function setupSlice(slice: SVGElement, label: HTMLElement, container: HTMLElement) {
    trackmouse(slice, { extra: {slice, label, container}, enter, leave, move });
}

function enter(e: HoverPieElements) {
    e.slice.classList.add("active");
    e.label.children.item(0).textContent = e.slice.getAttribute("data-label")
    e.label.classList.add("show");
}
function leave(e: HoverPieElements) {
    e.slice.classList.remove("active");
    e.label.classList.remove("show");
}
function move(x: number, y: number, rect: DOMRect, e: HoverPieElements) {
    const cbcr = e.container.getBoundingClientRect();
    e.label.style.setProperty("--mx", (x+rect.left-cbcr.left)+"px");
    e.label.style.setProperty("--my", (y+rect.top-cbcr.top)+"px");
    e.label.style.setProperty("--dl", (x+rect.left)+"px");
}

function percetageStringOf(portion: number) { return (portion*100).toPrecision(3) + '%' }