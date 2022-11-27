import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path"
import { Builder as HTMLBuilder, createWatcher as createHTMLWatcher } from "functional-html";
import { render } from "posthtml-render";
import sass from "sass";
import { rollup, watch as rollup_watch } from "rollup";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import { spawn } from "child_process";
import { config } from "dotenv";

config();
const pathToSass = process.env.SASS;


const source = JSON.parse(await readFile(resolve("./src/config.json")));
const args = process.argv.slice(2);
const argRE = /(\w+)(?:\[([\w,]+)\])?/;

/**@type {Map<string, Set<string>} */
const selection = new Map();

let watch = false;
let exclusion = false;
for(var arg of args) {
    switch(arg) {
        case "-W":
        case "--watch":
            watch = true;
            break;
        case "-X":
        case "--exclusion":
            exclusion = true;
            break;
        default: {
            const what = argRE.exec(arg);
            if(!what) {
                console.log("Invalid entry");
                continue;
            }
            if(!(what[1] in source)) {
                console.log(`${what[1]} is not a config entry`);
                continue;
            }
            let set = selection.get(what[1]);
            if(!set) selection.set(what[1], set = new Set());
            if(what[2])  what[2].split(',').forEach(v => set.add(v));
        }
    }
}

/**
 * 
 * @param {string} name 
 * @param {object} value 
 * @returns {Record<string, ConfigEntry>}
 */
function correctConfigRecord(name, value) {
    if(!value || value === "auto") return {
        "html": [0, name+".html", false],
        "scss": [1, name+".scss", false],
        "ts": [2, name+".ts", false],
    };
    if(value.html === null) value.html = ["html", name, false];
    if(value.scss === null) value.scss = ["scss", name, false];
    if(value.ts === null) value.ts = ["ts", name, false];
    return value;
}

/**
 * @typedef {{
 * type: "html"|"scss"|"ts",
 * url: string,
 * extra?: boolean
 * }} ConfigEntry
 */

if(watch) develop();
else build();


function build() {
    const htmlb = new HTMLBuilder("./src/html");
    for(var [name, set] of selection.entries()) {
        /**@type {Record<string, ConfigEntry>|"auto"} */
        const config = source[name];
        if(config === "auto") {
            if(set.size === 0) {
                buildHTML(name, false, htmlb);
                buildSCSS(name);
                buildTS(name, false);
                continue;
            }
            if(set.has("html")) buildHTML(name, false, htmlb);
            if(set.has("scss")) buildSCSS(name);
            if(set.has("ts")) buildTS(name, false);
        }
        else {
            for(var key of (set.size ? set : Object.keys(config))) {
                const item = config[key];
                if(item === null) {
                    switch(key) {
                        case "html":
                            buildHTML(name, false, htmlb);
                            break;
                        case "scss":
                            buildSCSS(name);
                            break;
                        case "ts":
                            buildTS(name, false);
                            break;
                        default:
                            console.warn(`There is no fallback for ${name} ${key}`);
                    }
                } else {
                    switch(item[0]) {
                        case 0:
                            buildHTML(item[1], item[2], htmlb);
                            break;
                        case 1:
                            buildSCSS(item[1]);
                            break;
                        case 2:
                            buildTS(item[1], item[2]);
                            break;
                        default:
                            console.warn(`${item[0]} is not a valid type`);
                    }
                }
            }
        }
    }
}

/**
 * 
 * @param {string} name 
 * @param {string} with_props 
 * @param {HTMLBuilder} builder 
 */
async function buildHTML(name, with_props, builder) {
    try {
        let start = performance.now();
        const props = with_props ? JSON.parse(await readFile(resolve(`src/html/${name}.json`), "utf-8")) : {};
        const { ast } = await builder.componentify(name+".html");
        await writeFile(`public/${name}.html`, render(ast(props)), "utf-8");
        console.log(name+".html compiled in "+(performance.now()-start).toFixed(2)+"ms");
    } catch(err) {
        console.error(`Functional html encountered an error in compiling ${name}.html`);
        console.error(err);
    }
}

async function buildSCSS(name) {
    try {
        let start = performance.now();
        let css = sass.compile(`src/scss/${name}.scss`, {style: "compressed"}).css;
        await writeFile(`public/css/${name}.css`, css, "utf-8");
        console.log(name+".css compiled in "+(performance.now()-start).toFixed(2)+"ms");
    } catch(err) {
        console.error(`Sass encountered an error compiling ${name}.scss`);
        console.error(err.message);
    }
}

async function buildTS(name, with_node) {
    const input = `src/ts/${name}.ts`;
    const file = `public/js/${name}.js`;
    const start = performance.now();
    const plugins = [ terser(), typescript() ];
    if(with_node) plugins.push(nodeResolve());
    try {
        const bundle = await rollup({input,plugins});
        await bundle.write({ format: "iife", file });
        await bundle.close();
        console.log(name+".ts (" + (with_node?"with":"without") + " packages) compiled in " + (performance.now()-start).toFixed(2) + "ms");
    } catch(err) {
        console.error(`Rollup encountered an error compiling ${name}.ts: ${err.code}`);
        console.error(err.message);
        if(err.frame) console.error(err.frame);
    }
}


function develop() {
    const watchHTMl = createHTMLWatcher("./src/html");
    const scss_options = ["--watch"];
    const rollups = [];

    for(var [name, set] of selection.entries()) {
        /**@type {Record<string, ConfigEntry>|"auto"} */
        const config = source[name];
        if(config === "auto") {
            if(set.size === 0) {
                devHTML(name, false, watchHTMl);
                scss_options.push(`src/scss/${name}.scss:public/css/${name}.css`);
                rollups.push(devTS(name, false));
                continue;
            }
            if(set.has("html")) devHTML(name, false, watchHTMl);
            else if(set.has("scss")) scss_options.push(`src/scss/${name}.scss:public/css/${name}.css`);
            else if(set.has("ts")) rollups.push(devTS(name, false));
        }
        else {
            for(var key of (set.size ? set : Object.keys(config))) {
                const item = config[key];
                if(item === null) {
                    switch(key) {
                        case "html":
                            devHTML(name, false, watchHTMl);
                            break;
                        case "scss":
                            scss_options.push(`src/scss/${name}.scss:public/css/${name}.css`);
                            break;
                        case "ts":
                            rollups.push(devTS(name, false));
                            break;
                        default:
                            console.warn(`There is no fallback for ${name} ${key}`);
                    }
                } else {
                    switch(item[0]) {
                        case 0:
                            devHTML(item[1], item[2], watchHTMl);
                            break;
                        case 1:
                            scss_options.push(`src/scss/${item[1]}.scss:public/css/${item[1]}.css`);
                            break;
                        case 2:
                            rollups.push(devTS(item[1], item[2]));
                            break;
                        default:
                            console.warn(`${item[0]} is not a valid type`);
                    }
                }
            }
        }
    }

    let scss_process;
    if(scss_options.length > 1) {
        scss_process = spawn(pathToSass, scss_options);
        scss_process.on("error", err => { console.log("scss error: "+err); })
        scss_process.stdout.setEncoding("utf-8");
        scss_process.stdout.on("data", data => console.log(data.trimEnd()));
        scss_process.stderr.setEncoding("utf8");
        scss_process.stderr.on("data", data => console.error("scss error: "+data));
    }

    process.on("SIGINT", async () => {
        if(scss_process) {
            console.log("Stopping sass compiler");
            scss_process.kill("SIGINT");
        }
        if(rollups.length > 0) {
            console.log("Stopping rollup");
            await Promise.all(rollups.map(w => w.close()));
        }
        process.exit(0);
    });
}

async function devHTML(name, with_props, watch) {
    const out = `public/${name}.html`;
    try {
        const props = with_props ? JSON.parse(await readFile(resolve(`src/html/${name}.json`), "utf-8")) : {};
        // console.log(props)
        watch(
            name+".html",
            ast => writeFile(out, render(ast(props)), "utf-8").then(
                () => console.log(`${name}.html rendered`),
                err => console.error(`Error in rendering ${name}.html:\n`, err)
            ),
            errors => console.error(`function html encountered errors in rendering ${name}.html:${errors.map(e => "\n - "+e.message)}`)
        );
    } catch(err) {
        console.error(`Encountered error in starting watcher for ${name}.html`);
        console.error(err);
    }
}

function devTS(name, with_node) {
    let watcher = rollup_watch({
        input: `src/ts/${name}.ts`,
        output: {
            format: "iife",
            file: `public/js/${name}.js`
        },
        plugins: [ typescript(), with_node && nodeResolve() ]
    })
    watcher.on("event", onWatchEvent);
    return watcher
}

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsFolderIndex = path.join(__dirname, "public", "js").length+1;

/**
 * 
 * @param {import("rollup").RollupWatcherEvent} e 
 */
function onWatchEvent(e) {
    switch(e.code) {
        case "BUNDLE_START":
            console.log(e.output[0].slice(jsFolderIndex)+" changed");
            break;
        case "BUNDLE_END":
            console.log(`${e.output[0].slice(jsFolderIndex)} bundled in ${e.duration}ms`);
            e.result.close();
            break;
        case "ERROR":
            console.log("rollup encountered error: "+e.error.code);
            console.log(e.error.message);
            if(e.error.frame) console.log(e.error.frame);
            if(e.result) e.result.close();
            break;
    }
}