const { writeFile } = require("fs/promises");
const { componentify } = require("functional-html");
const { render } = require("posthtml-render");

process.argv.slice(2).forEach(handle)
    
async function handle(name) {
    try {
        const c = await componentify(`./src/html/${name}.html`);
        await writeFile(`discarded/${name}.html`, render(c({})), "utf-8");
        console.log(` > ${name} rendered`);
    } catch(err) {
        console.error(err);
    }
}
