"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = exports.normalize = exports.html_component = exports.compile = void 0;
const posthtml_parser_1 = require("posthtml-parser");
const posthtml_render_1 = require("posthtml-render");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const cache = new Map();
const loading = new Map();
async function compile(path) {
    try {
        const file = await (0, promises_1.readFile)(path, "utf-8");
        cache.set(path, file);
        const tree = await html_component(file, (0, path_1.dirname)(path));
        normalize(tree);
        return (0, posthtml_render_1.render)(tree);
    }
    catch (err) {
        console.log(`Could not open ${path}`);
        console.log(err);
        return null;
    }
}
exports.compile = compile;
async function html_component(file, root, props, slots = {}) {
    const aliases = new Map();
    const tasks = [];
    const nodes = (0, posthtml_parser_1.parser)(file);
    walk(nodes);
    await Promise.all(tasks);
    return nodes;
    function walk(nodes) {
        var _a;
        let component;
        let node;
        const len = nodes.length;
        for (var i = 0; i < len; i++) {
            node = nodes[i];
            if (Array.isArray(node)) {
                walk(node);
                continue;
            }
            if (typeof node === "string") {
                continue;
            }
            if (typeof node !== "object")
                continue;
            if (node.tag === "link" && ((_a = node.attrs) === null || _a === void 0 ? void 0 : _a.rel) === "import") {
                register_import(node);
                nodes[i] = null;
            }
            else if (node.tag === "slot") {
                node.tag = false;
                set_slot(node);
            }
            else if (component = aliases.get(node.tag)) {
                implement_import(node, component);
            }
            else if (Array.isArray(node.content)) {
                walk(node.content);
            }
        }
    }
    function register_import(node) {
        var _a, _b;
        const what = (_a = node.attrs) === null || _a === void 0 ? void 0 : _a.href;
        if (typeof what !== "string") {
            console.log(`Missing import link href in file ${root}`);
            return;
        }
        const url = (0, path_1.join)(root, what);
        const name = typeof ((_b = node.attrs) === null || _b === void 0 ? void 0 : _b.as) === "string" ? node.attrs.as : (0, path_1.basename)(url, ".html");
        aliases.set(name, { url, text: retrieve_html(url) });
    }
    function implement_import(node, component) {
        var _a, _b;
        const props = Object.assign({}, node.attrs);
        const slots = {};
        // read content
        const content = content2array(node.content);
        const len = content.length;
        let n;
        for (var i = 0; i < len; i++) {
            n = content[i];
            if (typeof n !== "object" || Array.isArray(n))
                continue; // only read fragment and scripts
            if (n.tag === "script") {
                Object.assign(props, read_props_script(n.content));
            }
            else if (n.tag === "fragment") {
                const name = (_a = n.attrs) === null || _a === void 0 ? void 0 : _a.slot;
                if (typeof name !== "string") {
                    console.log("Missing slot name");
                    continue;
                }
                const c = content2array(n.content);
                walk(slots[name] = c);
            }
            else if (n.attrs && typeof ((_b = n.attrs) === null || _b === void 0 ? void 0 : _b.slot) === "string") {
                const name = n.attrs.slot;
                delete n.attrs.slot;
                walk(slots[name] = [n]);
            }
        }
        // call component construction
        node.tag = false;
        node.content = null;
        tasks.push(implement(component, node, props, slots));
        return true;
    }
    async function implement(component, wrapper, props, slots) {
        const root = (0, path_1.dirname)(component.url);
        const text = await component.text;
        const nodes = await html_component(text, root, props, slots);
        wrapper.content = nodes;
    }
    function set_slot(node) {
        var _a;
        const name = (_a = node.attrs) === null || _a === void 0 ? void 0 : _a.name;
        if (typeof name !== "string")
            return console.log(`HTML component slot is missing name`);
        if (!slots[name])
            return; // automatically rolls back to default
        node.content = slots[name];
    }
}
exports.html_component = html_component;
function read_props_script(content) {
    try {
        const res = JSON.parse(content[0]);
        return typeof res === "object" ? res : null;
    }
    catch (_a) {
        console.log("Invalid script inside component inclusion");
        return null;
    }
}
function retrieve_html(url) {
    const cached = cache.get(url);
    if (cached)
        return Promise.resolve(cached);
    let promise = loading.get(url);
    if (!promise) {
        promise = (0, promises_1.readFile)(url, "utf-8").then(text => (cache.set(url, text), text), () => (console.log(`Could not read ${url}`), null));
        loading.set(url, promise);
    }
    return promise;
}
function content2array(content) {
    if (!content)
        return [];
    if (!Array.isArray(content))
        return [content];
    return content;
}
const line_regexp = /[\t ]*\n\s*/g;
const final_space = /\n\s+$/;
const initial_space = /^\s+/;
function normalize(tree) { norm_tree(tree); }
exports.normalize = normalize;
function norm_tree(tree, base = 0, text = "", remainder = false) {
    const newline = '\n' + ' '.repeat(base * 4);
    let node;
    let placed = true; // whether the given text was placed
    const len = tree.length;
    for (var i = 0; i < len; i++) {
        node = tree[i];
        if (node == null)
            continue;
        if (Array.isArray(node))
            same_level(node);
        else if (typeof node === "object") {
            const c = node.content;
            if (!Array.isArray(c))
                write_text();
            else if (typeof node.tag === "boolean")
                same_level(c);
            else
                down_level(c);
        }
        else {
            text += node;
            tree[i] = null;
        }
    }
    if (remainder)
        return { placed, trailing: text };
    if (text)
        set_last(text, tree);
    function same_level(tree) {
        const res = norm_tree(tree, base, text, true);
        if (!res.placed)
            write_text();
        text = res.trailing;
    }
    function down_level(tree) {
        if (text)
            write_text();
        text = "";
        norm_tree(tree, base + 1);
        close_tag(tree, newline);
    }
    function write_text() {
        text = text.replace(line_regexp, newline);
        if (i === 0)
            placed = false;
        else
            set_last(text, tree, i - 1);
    }
}
function close_tag(tree, newline) {
    const last = tree[tree.length - 1];
    if (typeof last === "string")
        tree[tree.length - 1] = last.replace(final_space, newline);
    // else tree.push(newline);
}
function set_last(text, tree, index = tree.length - 1) {
    if (index < 0)
        index = 0;
    const el = tree[index];
    if (Array.isArray(el))
        set_last(text, el);
    else if (el != null && typeof el === "object" && el.tag === false)
        set_last(text, el.content = content2array(el.content));
    else
        tree[index] = text;
}
function is_str(o) { return typeof o === "string"; }
function clean(tree) {
    let node;
    let i = 0;
    while (i < tree.length) {
        node = tree[i];
        if (is_str(node)) {
            for (var j = 1; is_str(tree[i + j]); j++)
                node += tree[i + j];
            tree[i] = node;
            if (j > 1)
                tree.splice(i + 1, j - 1);
            i++;
        }
        else if (node === null)
            tree.splice(i, 1);
        else if (Array.isArray(node))
            tree.splice(i, 1, ...node);
        else if (typeof node === "object") {
            const c = content2array(node.content);
            if (node.tag === false)
                tree.splice(i, 1, ...c);
            else {
                node.content = c;
                clean(c);
                i++;
            }
        }
        else
            i++;
    }
    normalize_clean(tree);
}
exports.clean = clean;
// export function clean_copy(tree: (Node|Node[])[]): Node[] {
//     let new_tree: Node[] = [];
//     let node: Node|Node[];
//     let text = "";
//     let i = 0;
//     while (i < tree.length) {
//         node = tree[i];
//         while(typeof node === "string") {
//             new_tree[new_tree.length-1] += node;
//             node = tree[++i];
//         }
//         if(node === null) continue;
//         else if(Array.isArray(node)) tree.splice(i, 1, ...node);
//         else if(typeof node === "object" && node.tag === false) tree.splice(i, 1, ...content2array(node.content))
//     }
//     tree = new_tree;
//     new_tree = [];
//     let new_i = 0;
//     const len = tree.length;
//     normalize_clean(new_tree);
//     return new_tree
// }
function normalize_clean(tree, base = 0) {
    const newline = '\n' + ' '.repeat(base * 4);
    if (typeof tree[0] === "string")
        tree[0] = tree[0].replace(initial_space, newline);
    else
        tree.splice(0, 0, newline);
    let node;
    const len = tree.length;
    for (var i = 0; i < len; i++) {
        node = tree[i];
        if (typeof node == "string") {
            tree[i] = node.replace(line_regexp, newline);
        }
        else if (typeof node === "object") {
            const c = node.content;
            if (!Array.isArray(c))
                continue;
            normalize_clean(c, base + 1);
            // fix last line
            const last = c[c.length - 1];
            if (typeof last === "string")
                c[c.length - 1] = last.replace(final_space, newline);
            else
                c.push(newline);
        }
    }
}
