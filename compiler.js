const { spawn, exec, ChildProcess } = require("child_process");
const rollup = require("rollup");
const sass = require("sass");
const { writeFile } = require("fs/promises");
const { terser } = require("rollup-plugin-terser");
const ts = require("@rollup/plugin-typescript");

require("dotenv").config();
const pathToSass = process.env.SASS;

function develop(name) {
    const watcher = rollup.watch({
        input: `src/ts/${name}.ts`,
        output: {
            format: "iife",
            file: `public/js/${name}.js`
        },
        plugins: [ ts() ]
    });
    watcher.on("event", e => {
        switch(e.code) {
            case "BUNDLE_START":
                console.log("ts: bundle start");
                break;
            case "BUNDLE_END":
                console.log(`ts: bundle ended in ${e.duration} ms\n`);
                e.result.close();
                break;
            case "ERROR":
                console.log("ts: error encountered");
                console.dir(e.error);
                e.result.close();
                break;
        }
    });

    const sass = spawn(pathToSass, [
        "--watch", 
        `src/scss/${name}.scss`,
        `public/css/${name}.css`
    ]);
    outputScss(sass);
    sass.on("error", err => { console.dir(err); })

    return function() {
        console.log("Stopping compiling "+name);
        return [
            watcher.close(),
            new Promise(res => res(sass.kill("SIGINT")))
        ];
    }
}

/** @param {ChildProcess} child */
function outputScss(child) {
    child.stdout.setEncoding("utf-8");
    child.stdout.on("data", data => console.log("scss: "+data));
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", data => console.error("scss: "+data));
}

async function compileTS(name) {
    try {
        const start = performance.now();
        const bundle = await rollup.rollup({
            input: `src/ts/${name}.ts`,
            plugins: [ts(),terser()]
        });
        await bundle.generate({
            file: `public/js/${name}.js`,
            format: "iife"
        });
        await bundle.close();
        console.log(name + ".ts compiled in " + (performance.now()-start).toFixed(2) + " ms");
    } catch(err) {
        console.error(`Error in compiling ${name}.ts`);
        console.error(err);
    }
}

async function compileSCSS(name) {
    try {
        const start = performance.now();
        const { css } = sass.compile(`src/scss/${name}.scss`);
        await writeFile(`public/css/${name}.css`, css, "utf-8");
        console.log(name + ".scss compiled in " + (performance.now()-start).toFixed(2) + " ms");
    } catch (err) {
        console.error(`Error in compiling ${name}.scsss`);
        console.error(err.message);
    }
    // const sass = exec(`sass src/scss/${name}.scss public/css/${name}.css`);
    // sass.on("spawn", () => start = performance.now());
    // sass.stderr.setEncoding("utf8").on("data", data => {
    //     console.error("could not compile scss\n\t" + data);
    //     okay = false;
    // });
    // sass.on("close", () => okay && console.log(`${name}.scss compiled in ${(performance.now()-start).toFixed(2)} ms`));
}

function compile(name) {
    compileTS(name);
    compileSCSS(name);
}

function isPage(name) { return name === "index" || name === "projects" };
function goThroughNames(fn) {
    let name;
    const len = process.argv.length;
    for(var i=3; i<len; i++) {
        name = process.argv[i];
        if(isPage(name)) fn(name);
        else console.warn(name+" is not a valid page");
    }
}

const mode = process.argv[2];
switch(mode) {
    case "-W":
    case "--watch":
    {
        const cbs = [];
        goThroughNames(name => cbs.push(develop(name)));
        process.on("SIGINT", () => Promise.all([].concat(cbs.map(cb => cb()))).finally(() => process.exit(0)));
        break;
    }
    case "-C":
    case "--compile":
        goThroughNames(compile);
        break;
    case "-T":
    case "--three":
        if(process.argv[3] === "rocket") compileTS(process.argv[3]);
        console.warn("Only three.js file is rocket");
    default:
        console.log(mode+" is not a valid operation mode");
        console.error(" > options are -W, --watch, -C, --compile");
}
