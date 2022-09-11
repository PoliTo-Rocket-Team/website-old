const { compile } = require("./src/build/html-components");
const { writeFile } = require("fs/promises");

process.argv.slice(2).forEach(name => compile(`./src/html/${name}.html`).then(res => {
    if(res) writeFile(`./public/prova/${name}.html`, res, "utf-8").then(() => console.log(` > ${name} rendered`))
    else console.log(` > ${name} could not be rendered`);
}))