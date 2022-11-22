const { writeFile } = require("fs/promises");
const { createWatcher, Builder } = require("functional-html");
const { render: renderast } = require("posthtml-render");


/**
 * @typedef {{
 * value: NonNullable<number>;
 * label: NonNullable<string>;
 * color: NonNullable<string>;
 * }} PieSlice
*/
/**
 * @typedef {{
 * title: NonNullable<string>;
 * slices: NonNullable<PieSlice[]>;
 * threshold: NonNullable<number>;
 * rotate: number;
 * }} Pie
 */
/**@type {Pie[]} */
const pies = [
    {
        title: "Members by program",
        slices: [
            { value: 16, label: "Aerospace Engineering", color: "#3bdb84" },
            { value: 1, label: "Electronic Engineering", color: "#dd4991" },
            { value: 3, label: "Mechanical Engineering", color: "#dd0011" },
            { value: 1, label: "Physics Engineering", color: "#2479cf" },
            { value: 1, label: "Other non-Engineering", color: "#e1a463" },
        ],
        rotate: 255,
        threshold: 5,
    },
    {
        title: "Members by level",
        slices: [
            { value: 11, label: "Bachelor's", color: "#4e7bc1" },
            { value: 9, label: "Master's", color: "#e1a463" },
            { value: 1, label: "Ph.D.", color: "#3bdb84" },
        ],
        rotate: 0,
        threshold: 0,
    },
    {
        title: "International students rate",
        slices: [
            { value: 19, label: "Domestic", color: "#dd4991" },
            { value: 2, label: "International", color: "#e1a463" },
        ],
        rotate: 0,
        threshold: 0,
    }
]

const currentteamdata = {
    pies,
    leads: [
        {
            name: "Fabio Meloni",
            title: "President & Chief Engineer",
            img: "./url/gay.png"
        }
    ],
    operations: [
        {
            name: "Fabio Meloni",
            desc: "President & Chief Engineer"
        }
    ]
};

// const watch = createWatcher("src/html");
// function develop(path, props) {
//     watch(path + ".html", async ast => {
//         try {
//             await writeFile(`public/${path}.html`, renderast(ast(props)), "utf-8");
//             console.log(`>>> ${path}.html rendered`);
//         } catch(err) {
//             console.log("Error in rendering "+path);
//             console.error(err);
//         }
//     }, errs => {
//         console.log(`Errors in compiling ${path}:`);
//         for(var err of errs) console.log(" - " + (err instanceof Error ? err.message : err));
//     });
// }
// develop("about/current-team", currentteamdata);
// develop("about/mission", {});
// develop("projects", {});
// develop("apply", {});


const builder = new Builder("src/html");
async function render(path, props = {}) {
    try {
        const c = await builder.componentify(path + ".html");
        await writeFile(`public/${path}.html`, renderast(c.ast(props)), "utf-8");
        console.log(` > ${path} rendered`);
    } catch(err) {
        console.log("error in rendering "+path);
        console.error(err);
    }
}
render("about/current-team", currentteamdata);
render("about/mission", {});
render("projects", {});
render("apply", {});