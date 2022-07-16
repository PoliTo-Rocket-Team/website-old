import { readFile, writeFile } from "fs/promises";
import sass from "sass";
import { rollup, watch as rollup_watch } from "rollup";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import { spawn } from "child_process";
import { config } from "dotenv";

config();
const pathToSass = process.env.SASS;

/**@typedef {{type: "ts"|"scss", file: string, node: boolean}} Entry */
/**@type {{entries: Object.<string,Entry>, profiles: Object.<string,string[]}}*/
const source = JSON.parse(await readFile("./src/config.json"));
const args = process.argv.slice(2);

let watch = false;
let exclusion = false;
let lookAmongProfiles = false;
let entries = new Set();

for(var arg of args) {
    switch(arg) {
        case "-W":
        case "--watch":
            watch = true;
            break;
        case "-E":
        case "--entry":
            lookAmongProfiles = false;
            break;
        case "-P":
        case "--profile":
            lookAmongProfiles = true;
            break;
        case "-X":
        case "--exclusion":
            exclusion = true;
            break;
        default:
            if(lookAmongProfiles) addProfile(arg);
            else addEntry(arg);
    }
}

if(exclusion) {
    let newEntries = new Set();
    for(var key in source.entries) {
        if(entries.has(key)) continue;
        newEntries.add(key);
    }
    entries = newEntries;
}

/**@type{Entry}*/let entry;
let filename;
const simpleTS = [];
const nodedTS = [];
const scss = [];

for(var name of entries) {
    entry = source.entries[name];
    filename = entry.file;
    if(typeof filename !== "string" || filename.length === 0) {
        console.warn(name + " has no file");
        continue;
    }
    switch(entry.type) {
        case "scss":
            scss.push(filename);
            break;
        case "ts":
            (entry.node ? nodedTS : simpleTS).push(filename);
            break;
        default:
            console.warn(name + " has no valid type");
    }
}

if(watch) {
    const stopTS = devTS();
    const stopSCSS = devSCSS();
    process.on("SIGINT", async () => {
        await stopTS();
        await stopSCSS();
        process.exit(0);
    })
} else {
    var name;
    for(name of simpleTS) buildTS(name);
    for(name of nodedTS) buildTS(name,true);
    for(name of scss) buildSCSS(name);
}


function addProfile(name) {
    const es = source.profiles[name];
    if(!es) console.warn(name + " is not a profile");
    else for(var e of es) addEntry(e);
}

function addEntry(name) {
    if(!source.entries[name]) console.warn(name + " is not an entry");
    else entries.add(name);
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

function devSCSS() {
    const len = scss.length;
    if(len === 0) return NO_FN;
    const options = new Array(len+1);
    options[0] = "--watch";
    for(var i=0; i<len; i++) options[i+1] = `src/scss/${scss[i]}.scss:public/css/${scss[i]}.css`; 
    const process = spawn(pathToSass, options);
    process.on("error", err => { console.log("scss error: "+err); })
    process.stdout.setEncoding("utf-8");
    process.stdout.on("data", data => console.log(data.trimEnd()));
    process.stderr.setEncoding("utf8");
    process.stderr.on("data", data => console.error("scss error: "+data));

    return () => new Promise(resolve => {
        console.log("Stopping sass compiler");
        process.kill("SIGINT");
        resolve()
    });
}

function devTS() {
    if(simpleTS.length + nodedTS.length === 0) return NO_FN;

    /**@type {import("rollup").RollupWatcher[]} */
    const watchers = [];

    var name;
    for(name of simpleTS) {
        let watcher = rollup_watch({
            input: `src/ts/${name}.ts`,
            output: {
                format: "iife",
                file: `public/js/${name}.js`
            },
            plugins: [ typescript() ]
        })
        watcher.on("event", onWatchEvent);
        watchers.push(watcher);
    }
    for(name of nodedTS) {
        let watcher = rollup_watch({
            input: `src/ts/${name}.ts`,
            output: {
                format: "iife",
                file: `public/js/${name}.js`
            },
            plugins: [ typescript(), nodeResolve() ]
        })
        watcher.on("event", onWatchEvent);
        watchers.push(watcher);
    }

    return () => {
        console.log("Stopping rollup");
        return Promise.all(watchers.map(w => w.close()))
    }
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

async function NO_FN() {}