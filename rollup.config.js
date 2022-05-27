import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
    input: "src/index.ts",
    output: {
        file: "public/js/index.js",
        format: "iife"
    },
    plugins: [
        typescript(),
        nodeResolve(),
        production && terser()
    ]
}