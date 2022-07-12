import { setupThemePreference, setupNavigation, trackmouse } from './utils';

setupThemePreference()
setupNavigation("main-nav", 80);

class Position {
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }
    eq(other: Position) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    add(other: Position) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    sub(other: Position) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    mul(k: number) {
        this.x *= k;
        this.y *= k;
        return this;
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    static distance(a: Position, b: Position) {
        return Math.hypot(a.x-b.x, a.y-b.y);
    }
}

function nofn() {};
type SpringEventCallback = {
    move(x:number,y:number): void;
    end(x:number,y:number): void;
}

type PositionFn = (x: number, y: number) => void;
interface Spring {
    aim: PositionFn;
    set: PositionFn;
    on<E extends keyof SpringEventCallback>(event: E, fn: SpringEventCallback[E]): void
}

class Spring2 {
    private readonly current = new Position();
    private readonly final = new Position();
    private readonly temp = new Position();
    private readonly bindedmove: () => void;
    private resolveEnd = nofn;
    private endPromise: Promise<void>;
    private req: number;
    private onmovefn: PositionFn = nofn;

    threshold: number;
    stiffness: number;

    constructor(stiffness: number, threshold: number = 0.01) {
        this.bindedmove = this.move.bind(this);
        this.stiffness = stiffness;
        this.threshold = threshold;
    }
    aim(x: number, y: number) {
        this.final.set(x,y);
        if(this.req) return;
        this.req = requestAnimationFrame(this.bindedmove);
    }
    onmove(fn: PositionFn|null) { this.onmovefn = fn || nofn; }
    ended() {
        if(!this.req) return Promise.resolve();
        if(this.endPromise) return this.endPromise;
        return this.endPromise = new Promise(res => this.resolveEnd = res);
    }
    private move() {
        this.temp.eq(this.final).sub(this.current).mul(this.stiffness);
        this.current.add(this.temp);
        // console.log("%cmove to "+current, "color: #bbbb11;");
        this.onmovefn(this.current.x,this.current.y);
        if(Position.distance(this.final, this.current) < this.threshold) {
            // console.log("%calmost at "+final, "color: green;");
            this.req = null;
            this.signalend();
        }
        else this.req = requestAnimationFrame(this.bindedmove); 
    }
    private signalend() {
        const res = this.resolveEnd;
        this.endPromise = null;
        this.resolveEnd = null;
        res();
    }
}

function spring(k: number, threshold = 0.01): Spring {
    const current = new Position();
    const final = new Position();
    const temp = new Position();
    let lasttime: number;
    let req: number;
    const cbs: SpringEventCallback = { move: nofn, end: nofn };

    return {aim,set,on};

    function move(time: number) {
        temp.eq(final).sub(current).mul(k);
        current.add(temp);
        // console.log("%cmove to "+current, "color: #bbbb11;");
        cbs.move(current.x,current.y);
        lasttime = time;
        if(Position.distance(final, current) < threshold) {
            // console.log("%calmost at "+final, "color: green;");
            req = null;
            cbs.end(final.x, final.y);
        }
        else req = requestAnimationFrame(move); 
    }
    function aim(x: number, y: number) {
        final.set(x,y);
        if(req) return;
        lasttime = performance.now();
        req = requestAnimationFrame(move);
    }
    function set(x: number, y: number) {
        final.set(x,y);
        current.set(x,y);
        if(req) {
            cancelAnimationFrame(req);
            req = null;
        }
        cbs.end(x,y);
    }
    function on<E extends keyof SpringEventCallback>(event: E, fn: SpringEventCallback[E] | null) {
        cbs[event] = fn || nofn;
    }
}

class Pool<T> {
    protected available: number = 0;
    protected readonly pool: T[] = [];
    protected readonly creator: () => T;

    constructor(creator: ()=>T, size: number = 1) {
        this.creator = creator;
        this.pool = new Array(size);
        this.available = (1 << size) - 1;
        for(var i=0; i<size; i++) this.pool[i] = creator();
    }
    get() {
        if(this.available === 0) {
            const res = this.creator();
            this.pool.push(res);
            return res;
        } else {
            const len = this.pool.length;
            let mask: number;
            for(var i=0; i<len; i++) {
                mask = 1 << i;
                if(this.available & mask) {
                    //console.log("lending "+i+" - "+this.state());
                    this.available -= mask;
                    return this.pool[i];
                }
            }
        }
    }
    free(obj: T) {
        const i = this.pool.indexOf(obj);
        if(i === -1) return;
        const mask = 1 << i;
        if(this.available & mask) return void console.log("wtf");
        this.available += (1<<i);
    }
    state() { return this.available.toString(2).padStart(this.pool.length) }
}

const cards = document.querySelectorAll<HTMLElement>(".card");
const spring_pool = new Pool(() => {
    console.log("spring created");
    return spring(0.075, 0.0001)
})

interface CardSpring {
    card: HTMLElement;
    spring: Spring | null;
}

for(var card of cards) trackmouse<CardSpring>(card, {
    extra: {card, spring: null},
    enter, move, leave
});

function enter(cs: CardSpring) {
    if(!cs.spring) cs.spring = spring_pool.get();
    cs.spring.on("end", null);
    cs.spring.on("move", (x, y) => {
        cs.card.style.setProperty("--x", x.toFixed(4));
        cs.card.style.setProperty("--y", y.toFixed(4));
    });
}

function move(x: number, y: number, r: DOMRect, cs: CardSpring) {
    cs.spring.aim(2*x/r.width-1, 2*y/r.height-1);
    // console.log(x,y);
}

function leave(cs: CardSpring) {
    cs.spring.aim(0,0);
    cs.spring.on("end", () => {
        cs.spring.on("end", null);
        spring_pool.free(cs.spring);
        cs.spring = null;
    });
}