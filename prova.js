const { compile } = require("./src/build/html-components");

compile("./src/html/projects.html")
.then(v => console.log(v));