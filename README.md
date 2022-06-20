# PoliTo Rocket Team Website

Files of the PRT website, written in html, typescript, and scss.

## File structure

 - `src/`: typescript and scss source files
 - `public/`: public files exposed by netlify to the users

## Contribute

Since typescript and scss must be compiled, a bundler ([rollup](https://www.rollupjs.org/guide/en/)) is used, along with [sass](https://sass-lang.com/) compiler. The [pnpm](https://pnpm.io/) package manager is used instead of npm ([why?](https://pnpm.io/pnpm-vs-npm)). Thus, in order to contribute, follow the steps:
 1. set this repo as git remote origin
 2. checkout to the remote branch you want to work on, and pull
 3. run `pnpm install` to install all required packages
 4. set "SASS" entry in `.env` file to the path to sass compiler

If you're using vscode and [live server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, set its root settings to `/public`.

## Build and develop

The `compiler.js` node script compiles (and watches) ts and scss files of pages. It can be invoked in one of the following ways:

    node compiler <command> <...names>
    npm run <command> <...names>
    pnpm <command> <...names>

| command | description | extras |
| :-----: | --- | --- |
| `build` | build the list of names (both .ts and .scss) | |
| `dev`   | watch and compile live the list of name (both .ts and .scss) | "SASS" entry of `.env` file must be the path to sass compiler  |
| `three` | build list of names that use [three.js](https://threejs.org/) | it usually takes more time to compile |

> To locate sass executable on windows, you can run `where sass` on cmd. The path usually is `C:\Users\<username>\AppData\Roaming\npm\sass.CMD`

### Examples
 - `pnpm dev index` will watch and compile live index.js and index.css from index.ts and index.scss
 - `pnpm build index projects` compiles .js and .css files for inde and projects pages
 - `pnpm three rocket` builds rocket.js from rocket.ts