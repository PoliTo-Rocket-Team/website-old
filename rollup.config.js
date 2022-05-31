import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;
const three = process.env.THREE;

/**@type {import("rollup").RollupOptions} */
const config = three ? {
    input: "src/rocket.ts",
    output: {
        file: "public/js/rocket.js",
        format: "iife"
    },
    plugins: [
        typescript(),
        nodeResolve(),
        production && terser()
    ]
}
: {
    input: "src/index.ts",
    output: {
        file: "public/js/index.js",
        format: "iife",
    },
    plugins: [
        typescript(),
        production && terser()
    ]
}

export default config;