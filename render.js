const { writeFile } = require("fs/promises");
const { componentify } = require("functional-html");
const { render } = require("posthtml-render");


handle("about/current-team", {
    operations: [
        {
            name: "Fabio Meloni",
            desc: "President & Chief Engineer"
        }
    ]
});

handle("about/mission", {});

// process.argv.slice(2).forEach(handle)
    
async function handle(name, props) {
    try {
        const c = await componentify(`./src/html/${name}.html`);
        await writeFile(`public/${name}.html`, render(c(props)), "utf-8");
        console.log(` > ${name} rendered`);
    } catch(err) {
        console.error(err);
    }
}
