# PoliTo Rocket Team Website

## File structure

 - `src/`: typescript and scss source files
 - `public/`: public files exposed by netlify to the users

## Build and develop

The `compiler.js` node script compiles (and watches) ts and scss files of pages. It can be invoked in one of the following ways:

    node compiler <mode> <...names>
    npm run <script> <...names>
    pnpm <script> <...names>

| mode             | script  | description | extras |
| :--------------: | :-----: | --- | --- |
| `-C` `--compile` | `build` | build the list of names (both .ts and .scss) | |
| `-W` `--watch`   | `dev`   | watch and compile live the list of name (both .ts and .scss) | the path to sass executable must be the entry "SASS" in `.env` file |
| `-T` `--three`   | `three` | build list of names that use three.js (both .ts and .scss) | separated from others since it usually takes more time to compile |

> to locate sass executable on windows you can run `where sass` on cmd

### Examples
 - `pnpm dev index` will watch and compile live index.js and index.css from index.ts and index.scss
 - `pnpm build index projects` compiles .js and .css files for inde and projects pages
 - `pnpm three rocket` builds rocket.js from rocket.ts