import { parser, Node, NodeTag, Content } from "posthtml-parser";
import { render } from "posthtml-render";
import { readFile } from "fs/promises";
import { basename, dirname, join as join_path } from "path";

type Tree = (Node|Node[])[];
type Slots = Record<string, (Node|Node[])[]>;

const cache = new Map<string, string>();
const loading = new Map<string, Promise<string>>();

export async function compile(path: string) {
    try {
        const file = await readFile(path, "utf-8");
        cache.set(path, file);
        const tree = await html_component(file, dirname(path));
        normalize(tree);
        return render(tree);
    }
    catch(err) {
        console.log(`Could not open ${path}`);
        console.log(err)
        return null;
    }
}

export async function html_component(file: string, root: string, props?: object, slots: Slots = {}) {
    const aliases = new Map<string, Alias>();
    const tasks: Promise<void>[] = []; 
    const nodes = parser(file);
    walk(nodes);
    await Promise.all(tasks);
    return nodes;

    function walk(nodes: (Node|Node[])[]) {
        let component: Alias;
        let node: Node | Node[];
        const len = nodes.length;
        for(var i=0; i<len; i++) {
            node = nodes[i];
            if(Array.isArray(node)) {
                walk(node);
                continue;
            }
            if(typeof node === "string") {
                continue;
            }
            if(typeof node !== "object") continue;

            if(node.tag === "link" && node.attrs?.rel === "import") {
                register_import(node);
                nodes[i] = null;
            }
            else if(node.tag === "slot") {
                node.tag = false;
                set_slot(node);
            }
            else if(component = aliases.get(node.tag as string)) {
                implement_import(node, component);
            }
            else if(Array.isArray(node.content)) {
                walk(node.content);
            }
        }
    }

    function register_import(node: NodeTag) {
        const what = node.attrs?.href;
        if(typeof what !== "string") {
            console.log(`Missing import link href in file ${root}`);
            return;
        }
        const url = join_path(root, what);
        const name = typeof node.attrs?.as === "string" ? node.attrs.as : basename(url, ".html");
        aliases.set(name, { url, text: retrieve_html(url) });
    }

    function implement_import(node: NodeTag, component: Alias) {
        const props = Object.assign({}, node.attrs);
        const slots: Slots = {};

        // read content
        const content = content2array(node.content);
        const len = content.length;
        let n: Node | Node[];
        for(var i=0; i<len; i++) {
            n = content[i]
            if(typeof n !== "object" || Array.isArray(n)) continue; // only read fragment and scripts
            if (n.tag === "script") {
                Object.assign(props, read_props_script(n.content));
            }
            else if (n.tag === "fragment") {
                const name = n.attrs?.slot;
                if(typeof name !== "string") { console.log("Missing slot name"); continue; }
                const c = content2array(n.content);
                walk(slots[name] = c);
            }
            else if (n.attrs && typeof n.attrs?.slot === "string") {
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

    async function implement(component: Alias, wrapper: NodeTag, props: object, slots: Slots) {
        const root = dirname(component.url);
        const text = await component.text;
        const nodes = await html_component(text, root, props, slots);
        wrapper.content = nodes;
    }

    function set_slot(node: NodeTag) {
        const name = node.attrs?.name;
        if(typeof name !== "string") return console.log(`HTML component slot is missing name`);
        if(!slots[name]) return; // automatically rolls back to default
        node.content = slots[name];
    }
}

function read_props_script(content: Content) {
    try {
        const res = JSON.parse(content[0]);
        return typeof res === "object" ? res : null;
    }
    catch {
        console.log("Invalid script inside component inclusion");
        return null;
    }
}

function retrieve_html(url: string) {
    const cached = cache.get(url);
    if(cached) return Promise.resolve(cached);
    let promise = loading.get(url);
    if(!promise) {
        promise = readFile(url, "utf-8").then(
            text => (cache.set(url, text), text),
            () => (console.log(`Could not read ${url}`), null)
        );
        loading.set(url, promise);
    }
    return promise;
}

interface Alias {
    url: string;
    text: Promise<string>;
}

function content2array(content: Content) {
    if(!content) return [];
    if(!Array.isArray(content)) return [content];
    return content;
}

const line_regexp = /[\t ]*\n\s*/g;
const final_space = /\n\s+$/;
const initial_space = /^\s+/;

interface TreeNormRes {
    placed: boolean;
    trailing: string;
}

export function normalize(tree: Tree) {norm_tree(tree)}

function norm_tree(tree: Tree, base = 0, text: string = "", remainder = false): TreeNormRes {
    const newline = '\n' + ' '.repeat(base*4);
    let node: Node|Node[];
    let placed = true; // whether the given text was placed
    const len = tree.length;
    for(var i=0; i<len; i++) {
        node = tree[i];
        if(node == null) continue;
        if(Array.isArray(node)) same_level(node);
        else if(typeof node === "object") {
            const c = node.content;
            if(!Array.isArray(c)) write_text();
            else if(typeof node.tag === "boolean") same_level(c);
            else down_level(c);
        }
        else {
            text += node;
            tree[i] = null;
        }
    }
    if(remainder) return { placed, trailing: text };
    if(text) set_last(text, tree);

    function same_level(tree: Tree) {
        const res = norm_tree(tree, base, text, true);
        if(!res.placed) write_text();
        text = res.trailing;
    }

    function down_level(tree: Tree) {
        if(text) write_text();
        text = "";
        norm_tree(tree, base + 1);
        close_tag(tree, newline);
    }

    function write_text() {
        text = text.replace(line_regexp, newline);
        if(i === 0) placed = false;
        else set_last(text, tree, i-1);
    }
}

function close_tag(tree: Tree, newline: string) {
    const last = tree[tree.length-1];
    if(typeof last === "string") tree[tree.length-1] = last.replace(final_space, newline);
    // else tree.push(newline);
}

function set_last(text: string, tree: Tree, index = tree.length-1) {
    if(index < 0) index = 0;
    const el = tree[index];
    if(Array.isArray(el)) set_last(text, el);
    else if(el != null && typeof el === "object" && el.tag === false) set_last(text, el.content = content2array(el.content));
    else tree[index] = text;
}

function is_str(o: any) { return typeof o === "string"; }

export function clean(tree: (Node|Node[])[]) {
    let node: Node|Node[];
    let i = 0;

    while (i < tree.length) {
        node = tree[i];
        if(is_str(node)) {
            for(var j=1; is_str(tree[i+j]); j++) node += tree[i+j] as string;
            tree[i] = node;
            if(j > 1) tree.splice(i+1, j-1);
            i++;
        }
        else if(node === null) tree.splice(i, 1);
        else if(Array.isArray(node)) tree.splice(i, 1, ...node);
        else if(typeof node === "object") {
            const c = content2array(node.content)
            if(node.tag === false) tree.splice(i, 1, ...c);
            else {
                node.content = c
                clean(c);
                i++;
            }
        }
        else i++;
    }
    normalize_clean(tree as Node[]);
}

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

function normalize_clean(tree: Node[], base = 0) {
    const newline = '\n' + ' '.repeat(base*4);
    if(typeof tree[0] === "string") tree[0] = tree[0].replace(initial_space, newline);
    else tree.splice(0,0,newline);
    
    let node: Node;
    const len = tree.length;
    for(var i=0; i<len; i++) {
        node = tree[i];
        if(typeof node == "string") {
            tree[i] = node.replace(line_regexp, newline);
        }
        else if(typeof node === "object") {
            const c = node.content;
            if(!Array.isArray(c)) continue;
            normalize_clean(c as Node[], base+1);

            // fix last line
            const last = c[c.length-1];
            if(typeof last === "string") c[c.length-1] = last.replace(final_space, newline);
            else c.push(newline);
        }
    }   
}