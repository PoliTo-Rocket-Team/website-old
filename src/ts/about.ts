import { setupNavigation, setupThemePreference, trackmouse } from "./utils";
import { createSVG, SVG_el, randomHEX } from "./assets/SVG-utils";
import { Pie, pies, PieSlice } from "./assets/about-stats";
import { el, text } from './assets/HTML-utils';

setupNavigation(100);
setupThemePreference();
const PIE_RADIUS = 10;
const PIE_SCALE = 1.1;
const piesContainer = document.getElementById("pies");
const floatingLabel = document.getElementById("floating-label");

piesContainer.append(...pies.map(createPie));

function createPie(pie: Pie) {
    return el("div", { class: "pie-chart" }, [
        createPieGraph(pie.slices, pie.rotate),
        el("div", { class: "aside" }, [
            text("h3", pie.title),
            el("ul", null, pie.slices.map(slice => el("li", {
                style: `--clr: ${colorNum2Str(slice.color)};`
            }, [
                text("span", slice.label),
                text("span", " "+percetageOf(slice), { class: "hidden" })
            ])))
        ])
    ])
}

function createPieGraph(slices: PieSlice[], rotate: number) {
    const svg = createSVG(2.2*PIE_RADIUS,2.2*PIE_RADIUS,1,"pie-graph");
    
    let i: number;
    const len = slices.length;
    const angles = new Array(len+1);
    const c = (PIE_RADIUS*PIE_SCALE).toString();

    angles[0] = rotate == null ? Math.random()*Math.PI : rotate;
    for(i=0; i<len; i++) { angles[i+1] = angles[i] + slices[i].portion*Math.PI*2; }
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
        p = slices[i].portion;
        setupSlice(
            svg.appendChild(
                SVG_el("g", {
                    class: "pie-slice",
                    "data-label":  slices[i].label + " - " + percetageOf(slices[i]),
                    style: `--dx: ${Math.cos(medians[i])}; --dy: ${Math.sin(medians[i])}; --p: ${p};`
                }, [
                    SVG_el("path", {
                        fill: colorNum2Str(slices[i].color),
                        d: `M${c},${c} L${x},${y} A${PIE_RADIUS},${PIE_RADIUS},${p*360},${+(p>0.5)},1,${
                            x = PIE_RADIUS*(PIE_SCALE+coss[i+1])
                        },${
                            y = PIE_RADIUS*(PIE_SCALE+sins[i+1])
                        } Z`
                    }),
                    SVG_el("text", percentageTextAttrs, [ percetageOf(slices[i]) ]),
                    // SVG_el("text", labelTextAttrs, [ slices[i].label + " - " + slices[i].portion*100 + '%' ]),
                ])
            )
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

function setupSlice(slice: SVGElement) {
    trackmouse(slice, { extra: slice, enter, leave, move });
}

function enter(slice: SVGElement) {
    slice.classList.add("active");
    floatingLabel.textContent = slice.getAttribute("data-label")
    floatingLabel.classList.add("show");
}
function leave(slice: SVGElement) {
    slice.classList.remove("active");
    floatingLabel.classList.remove("show");
}
function move(x: number, y: number, rect: DOMRect, slice: SVGElement) {
    const cbcr = piesContainer.getBoundingClientRect();
    floatingLabel.style.setProperty("--mx", (x+rect.left-cbcr.left)+"px");
    floatingLabel.style.setProperty("--my", (y+rect.top-cbcr.top)+"px");
}

function colorNum2Str(clr: number) { return '#' + clr.toString(16) }
function percetageOf(slice: PieSlice) { return (slice.portion*100).toPrecision(3) + '%' }