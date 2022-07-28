import { setupNavigation, setupThemePreference, trackmouse } from "./utils";
import { createSVG, SVG_el, randomHEX } from "./assets/SVG-utils";
import { pies, PieSlice } from "./assets/about-stats";

setupNavigation(100);
setupThemePreference();
const PIE_RADIUS = 10;
const PIE_SCALE = 1.1;
const piesContainer = document.getElementById("pies");
const floatingLabel = document.getElementById("floating-label");

piesContainer.appendChild(createPie(pies[0].slices));

function createPie(slices: PieSlice[]) {
    const svg = createSVG(2.2*PIE_RADIUS,2.2*PIE_RADIUS,1,"pie");
    
    let i: number;
    const len = slices.length;
    const angles = new Array(len+1);
    const c = (PIE_RADIUS*PIE_SCALE).toString();

    angles[0] = Math.random()*Math.PI*2;
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
    const labelTextAttrs = { x: c, y: c, class: "label" }
    let x = PIE_RADIUS*(PIE_SCALE+coss[0]);
    let y = PIE_RADIUS*(PIE_SCALE+sins[0]);
    for(i=0; i<len; i++) {
        p = slices[i].portion;
        setupSlice(
            svg.appendChild(
                SVG_el("g", {
                    class: "pie-slice",
                    "data-label":  slices[i].label + " - " + (slices[i].portion*100).toFixed(1) + "%",
                    style: `--dx: ${Math.cos(medians[i])}; --dy: ${Math.sin(medians[i])}; --p: ${p};`
                }, [
                    SVG_el("path", {
                        fill: slices[i].color ? "#"+slices[i].color.toString(16) : randomHEX(),
                        d: `M${c},${c} L${x},${y} A${PIE_RADIUS},${PIE_RADIUS},${p*360},${+(p>0.5)},1,${
                            x = PIE_RADIUS*(PIE_SCALE+coss[i+1])
                        },${
                            y = PIE_RADIUS*(PIE_SCALE+sins[i+1])
                        } Z`
                    }),
                    SVG_el("title", null, [ slices[i].label ]),
                    SVG_el("text", percentageTextAttrs, [ slices[i].portion*100 + '%' ]),
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