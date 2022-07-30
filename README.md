# PoliTo Rocket Team Website

Files of the PRT website, written in html, typescript, and scss.

## File structure

 - `src/`: typescript and scss source files
 - `public/`: public files exposed by [netlify](https://www.netlify.com/) to the users

## Contribute

Since typescript and scss must be compiled, a bundler ([rollup](https://www.rollupjs.org/guide/en/)) is used, along with [sass](https://sass-lang.com/) compiler. The [pnpm](https://pnpm.io/) package manager is used instead of npm ([why?](https://pnpm.io/benchmarks)). Thus, in order to contribute, follow the steps:

 1. set this repo as git remote origin
 2. checkout to the remote branch `dev` and pull
 3. run `pnpm install` to install all required packages
 4. set "SASS" entry in `.env` file to the path to sass compiler

If you're using vscode and [live server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, set its root settings to `/public`.

### About branches

The `master` branch is the production one, whose public folder is hosted by netlify on the official url. Any relatively big, new feature must be implemented on the `dev` branch before release on the master. The current state of the `dev` branch can be seen at [dev.politorocketteam.it](https://dev.politorocketteam.it/).

When merging the two branches, please use fast forwarding when possible. Instead of using github merge features (which would delete the `dev` branch), do the following on the cmd:
 
 - `git checkout master`
 - `git merge dev --ff-only`
 - `git push`

## Build and develop

The `builder.mjs` node script compiles and/or watches ts and scss files in the [src](./src/) folder based on the configuration of the file [src/config.json](./src/config.json).

    node builder.mjs <...args>
    pnpm build <...args>

To watch and compile scss files, it relies on the SASS executable of your machine, since the npm package of sass allows only one-time compilation. Thus, you must set the "SASS" entry of your `.env` file to the path of the sass executable.


 > If the sass executable is on your `PATH`, you can locate it via cmd `where sass` on Windows, or `which sass` on macOS or Linux. On windows the path is usually `C:\Users\<username>\AppData\Roaming\npm\sass.CMD`.

### Flags

- `-W`, `--watch`: set the mode to watch
- `-X`, `--exclude`: excludes the given entries, i.e. reverses the selection
- `-E`, `--entry`: the following arguments are entries from the config file
- `-P`, `--profile`: the following arguments are profiles from the config file

### Scripts

| command | equivalent |
| :-----: | :--------: |
| `pnpm dev` | `node builder.mjs -W` |
| `pnpm build` | `node builder.mjs` |
| `pnpm build-all` | `node builder.mjs -X index:rocket` |

### Examples
 - `pnpm dev -P index` watches and compiles live index.js and index.css from index.ts and index.scss
 - `pnpm dev -E about:scss projects:ts` watches about.scss and projects.ts
 - `pnpm build index:rocket` builds rocket.js from rocket.ts
 - `pnpm build index:rocket -X` builds everything except rocket.js