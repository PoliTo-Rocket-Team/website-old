# PoliTo Rocket Team Website

## File structure

 - `src/`: typescript and scss source files
 - `public/`: public files exposed by netlify to the users

## Build and develop

The `compiler.js` node script compiles (and watches) ts and scss files of pages. It can be invoked in one of the following ways:

    node compiler <command> <...names>
    npm run <command> <...names>
    pnpm <command> <...names>

| command | description | extras |
| :-----: | --- | --- |
| `build` | build the list of names (both .ts and .scss) | |
| `dev`   | watch and compile live the list of name (both .ts and .scss) | "SASS" entry of `.env` file must be the path to sass compiler  |
| `three` | build list of names that use three.js | it usually takes more time to compile |

> To locate sass executable on windows, you can run `where sass` on cmd
> The path usually is `C:\Users\<username>\AppData\Roaming\npm\sass.CMD`

### Examples
 - `pnpm dev index` will watch and compile live index.js and index.css from index.ts and index.scss
 - `pnpm build index projects` compiles .js and .css files for inde and projects pages
 - `pnpm three rocket` builds rocket.js from rocket.ts