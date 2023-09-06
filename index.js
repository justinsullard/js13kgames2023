// GLOBAL VARIABLES (WHICH CAN BE CHANGED POTENTIALLY)
let now = 0;
let BPM = 500;
// 288 TICKS. This is effectively 12 ticks per hour at a 24 hour clock.
// That's 18 meausre
let DAY = 144000;
let D = 0;
// let DATE = 0;
let HOUR = 0;
let TCK = 0;
let LAST = 0;
let measure = 0;
let beat = 0;
let bar = 0;
// let step = 0;

let PAUSED = true;
let RATE = 1;
let PXL = 32;

// Utilities
const { cos, sin, min, max, sqrt, floor, ceil, round, imul, abs, PI, sign } = Math;
const STRIPE = (l = 0, fn = x => x) => new Array(l).fill(0).map((x, i) => i).map(fn);
const ROT = ([x, y], a) => [x * cos(a) - y * sin(a), x * sin(a) + y * cos(a)];
const MOVE = ([x, y, z], [w, h, d]) => [x + w, y + h, z + d];
const DIFF = ([x, y, z], [w, h, d]) => [x - w, y - h, z - d];
const FIX = (x, p = 1000) => round(x * p) / p;
// BEGIN DEBUGGING
const FXD = (x,d=3) => x.toFixed(d);
// END DEBUGGING
const OF = (x, y) => x < y ? x / y : 1;
const POF = (val, cap) => max(0, OF(val, cap));
const IN = (x, l, r) => l < x && x < r;
const SORT = (x,fn=(a,b)=>a-b) => x.sort(fn);
const NORM = ([x, y], l=1) => { const m = l / (LEN([x,y]) || 1); return [x*m, y*m]};
const LEN = ([ax, ay], [bx = 0, by = 0] = []) => sqrt((bx - ax) ** 2 + (by - ay) ** 2);
const ZFLOOR = x => x > 0 ? floor(x) : ceil(x);
const ZCEIL = x => x < 0 ? floor(x) : ceil(x);
const ZROUND = x => sign(x) * round(abs(x));
const CIRCLE = 2 * PI;
const PIZZA = STRIPE(128, i => (i ? CIRCLE / i : 0)); // WHY DOES ADDING `const` HERE CAUSE BABEL TO ERROR?
const PUT = (...x) => Object.assign(...x);
const EACH = (x, f) => x.forEach?.(f);
const MAP = (x, f) => x.map(f);
const SCREENSORT = (a, b) => a.y - b.y || a.z - b.z || a.x - b.x;
// const WASD = (x) => MAP(NORM(x),);

// const EL = (n, e, p={}, ...c) => {
//     const $ = document.createElementNS(n, e);
//     EACH(Object.entries(p))
//     return $;
// }
// const SVG = (e, ...x) => EL('http://www.w3.org/2000/svg',...x);

// Easing functions
const EOB = x => 1 + 2.70158 * ((x - 1) ** 3) + 1.70158 * ((x - 1) ** 2);
// const EOC = x => 1 - (1 - x)**3;
const EIB = x => x * x * (2.70158 * x - 1.70158);
const EIS = x => 1 - cos((x * PI) / 2);
const EIOS = x => -(cos(PI * x) - 1) / 2;
const EHSIN = x => sin(x * PI); // Ease Half Sine (0 -> 1 -> 0)
const ESIN = x => sin(x * CIRCLE); // Ease Sine (0 -> -1 -> 0 -> 1 -> 0)
const EC2 = 2.5949095;
// const EIOB = (x) => x < 0.5
//         ? (pow(2 * x, 2) * ((EC2 + 1) * 2 * x - EC2)) / 2
//         : (pow(2 * x - 2, 2) * ((EC2 + 1) * (x * 2 - 2) + EC2) + 2) / 2;
const EC5 = CIRCLE / 4.5
// const EIOE = x => x === 0
//     ? 0
//     : x === 1
//         ? 1
//         : x < 0.5
//             ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
//             : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
// const SLOPE = x => x.z = -x.y / 8;
// Animation functions
const SKYDELAY = () => min(500 / DAY, 0.05)
const RISEFALL = (h) => {
    let y = max(0, sin(h * CIRCLE)),
        b = SKYDELAY(),
        c = 1/2;
    if (h > b && h <= 2 * b) {
        y += 2 * EOB((h - b) / b)
    } else if (h > 2 * b && h < c) {
        y += 2
    } else if (h >= c && h < c + b) {
        y += 2 - 2 * EIB((h - c) / b)
    }
    return y / 3
};
// const SKYPATH = (h, w) => (EIOS(OF(h, 0.5)) * 2 - 1) * w;
const SKYPATH = (h) => (EIOS(OF(h, 0.5)) * 2 - 1);

// const LERP = (t, a, b) => a + (a - b) * t;
// const LERPE = (p, a, b) => MAP(p, t=>LERP(t, a, b));
const _WALK = t => [
    (min(2 * t, 0) - (1 - cos(t * CIRCLE))) / 2,
    // min(sin(t * CIRCLE), 0) / 2
    -EIS(-min(sin(t * CIRCLE), 0)) / 2
];
const WALK = t => _WALK(t);
// const TROT = t => _WALK(EIOB(t));
// const GALLOP = t => _WALK(EIB((t + t * 3) / 4));

// const LEAP = t => [
//     // -EIOE(EHSIN(t)),
//     // -EIOB(EHSIN(POF(t - 1 / 8, 3 / 4))),
//     // -EHSIN(OF(t, 1 / 8)) - (EHSIN(POF(t - 1 / 8, 3 / 4))),

//     -(sin(OF(t, 1 / 8) * PIZZA[4]) - EHSIN(POF(t - 1 / 8, 3 / 4)) - POF(t - 7 / 8, 1 / 8)),
//     -EHSIN((OF(t, 1 / 8))) - (EHSIN(POF(t - 1 / 8, 3 / 4))),
// ]

// randomization
const RANDO = (seed = 0) => {
    let a = seed | 0;
    let = fn = () => {
        a = a + 0x9e3779b9 | 0;
        let t = a ^ a >>> 16;
        t = imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = imul(t, 0x735a2d97);
        return ((t = t ^ t >> 15) >>> 0) / 4294967296 * 2;
    };
    return PUT(fn, {
        seed: (x) => x !== undefined ? a = x | 0 : a,
        INT: (n = 1) => round(fn() * n),
        BIAS: () => 1 - fn() * 2,
        sign: () => ZCEIL(fn.BIAS()),
        bit: () => round(fn()),
        bool: () => !!round(fn()),
        shuffle: (x) => x.slice().sort(fn.BIAS),
        pick: (x) => x[ZFLOOR(fn() * x.length)],
    })
};

// EMITTER ======================================
const SUBS = new Map();
const SUB = (e) => {
    if (!SUBS.has(e)) {
        SUBS.set(e, new Set())
    }
    return SUBS.get(e)
};
const ON = (e, f) => SUB(e).add(f);
const OFF = (e, f) => SUB(e).delete(f);
const EMIT = (e, ...a) => EACH([...SUB(e)], f => f(...a));
const ONCE = (e, f) => {
    let p = (...a) => {
        OFF(e, p);
        f(...a)
    };
    ON(e, p);
};

// MUSIC ========================================
let DJ = 0;
const Q = [32.7, 36.71, 41.2, 43.65, 49, 55, 61.74, 65.41, 73.42, 87.31, 98, 110, 130.81, 174.61, 196].map(x => x * 2);
const THIRD = 32 / 27;
// const MERGE = (a, b) =>SORT([...new Set([...a,...b])]);
const SONG = (n = 0, o = 0, b = 16) => { // noteCount, offsetNotes, baseNotes
    let m = n ? b / n : 0;
    return SORT(STRIPE(n, x => floor((x * m) + o + b) % b));
};
const SOUNDTRACK = () => {
    let a = Q.slice(1,-1);
    return [
        [Q[0], 0.4, 0, [0, 3, 8, 11, 14]],
        ...STRIPE(13, (i) => {
            let q = rand.pick(a);
            a = a.filter(x => x !== q);
            return [q, rand() * 0.2, rand.BIAS(), SONG(1 + rand.INT(), rand.INT(15))];
        })
    ];
};
const MELODY = () => [Q[0], ...rand.shuffle(Q.slice(1, 9))].slice(0, 8).map(x => x * 2);

const AAH = (c, q, v, a, t, w = 6) => {//context, frequency, volume, angleOfPan, timeToPlay
    const o = c.createOscillator();
    const g = c.createGain();
    const p = c.createStereoPanner();
    o.frequency.setValueAtTime(v / THIRD, t);
    EACH(SONG(w, 2),(x, i) => o.frequency.exponentialRampToValueAtTime(i % 2 ? q * THIRD : q / THIRD, t + i / 8));
    g.gain.setValueAtTime(v * 0.1, t);
    g.gain.exponentialRampToValueAtTime(v * 0.5, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.325);
    g.gain.exponentialRampToValueAtTime(0.01, t + 2);
    p.pan.setValueAtTime(a, t);
    p.pan.exponentialRampToValueAtTime(-a, t + 2);
    o.connect(g);
    g.connect(p);
    p.connect(c.destination);
    o.start(t);
    o.stop(t + 2);
};
const BEAT = (c, q, v, a, t, l, b) => {//context, frequency, volume, angleOfPan, timeToPlay, levelOverride, balanceOverride
    let o = c.createOscillator();
    let g = c.createGain();
    let p = c.createStereoPanner();
    let s = c.createDynamicsCompressor();
    let w = l || v;
    o.frequency.setValueAtTime(q, t);
    o.frequency.exponentialRampToValueAtTime(q / 1.5, t + 0.5);
    // o.frequency.exponentialRampToValueAtTime(q / 1.25, t + 0.5);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(w, t + 1/32);
    g.gain.exponentialRampToValueAtTime(w / 5, t + 0.1/16);
    g.gain.linearRampToValueAtTime(0, t + 0.5);
    p.pan.setValueAtTime(b ?? a, t);
    s.threshold.setValueAtTime(-50, t);
    s.knee.setValueAtTime(40, t);
    s.ratio.setValueAtTime(12, t);
    s.attack.setValueAtTime(0, t);
    s.release.setValueAtTime(0.25, t);
    o.connect(g);
    g.connect(p);
    p.connect(s);
    s.connect(c.destination);
    o.start(t);
    o.stop(t + 0.51);
};
const RATTLE = (c, q, a = 0, t) => {//context, frequency, volume, angleOfPan, timeToPlay, levelOverride, balanceOverride
    // let q = rand.pick(Q.slice(1,6))*2;
    let v = 0.05 + rand() * 0.03;
    let d = 1/8 + rand()/16;
    const o = c.createOscillator();
    const g = c.createGain();
    const p = c.createStereoPanner();
    o.type = "triangle";
    o.frequency.setValueAtTime(q, t);
    g.gain.setValueAtTime(v / 2, t);
    g.gain.exponentialRampToValueAtTime(v, t + d/2);
    g.gain.exponentialRampToValueAtTime(0.01, t + d);
    p.pan.setValueAtTime(a, t);
    o.connect(g);
    g.connect(p);
    p.connect(c.destination);
    o.start(t);
    o.stop(t + d);
};

const SOUND = () => {
    let c = new AudioContext();
    let o = -FIX(D / 4000, 10) % 1;
    let n = o;
    let voices = [0];
    let track = [];
    let melody = [];
    let fresh = (t, m) => {
        track = t || SOUNDTRACK();
        melody = m || MELODY();
    };
    // const d = c.createAnalyser();
    // audioSource.connect(analyser);
    // d.connect(c.destination);
    let play = () => {
        const m = c.currentTime;
        if (m + 0.25 < n || n < 0) { return; }
        AAH(c, melody[0] || Q[rand.INT(6)] * 2, 0.3, rand.BIAS() * 0.5, n, floor((n - o)) % 3 + 4);
        melody.push(melody.shift());
        EACH(voices, i => {
            const [q, v, a, p] = track[i];
            EACH(p, b => BEAT(c, q, v, a, b * 0.25 + n))
        });
        n += 4;
    };
    setInterval(play, 100);
    ON("rattle", (a = 0) => {
        // RATTLE(c, melody[7 - (beat + measure % 8)%8] || Q[0], typeof a === "number" ? a : 0, c.currentTime);
        RATTLE(
            c,
            (
                TICK % 2
                ? rand.pick(melody.slice(0,3))
                : melody[7 - (beat + measure % 8)%8]
            )
            || Q[0],
            typeof a === "number" ? a : 0,
            c.currentTime
        );
    });
    ON("beat", () => {
        const [q, v, a, p] = track[0];
        BEAT(c, Q[14], v, a, c.currentTime);
    });
    ON("pause", () => {
        if (c.state === "running" && PAUSED) {
            c.suspend();
        } else if (c.state === "suspended" && !PAUSED) {
            c.resume();
        }        
    });
    fresh();
    play();
    return {
        fresh,
        n,
        get track() { return track; },
        get voices() { return voices; },
        get melody() { return melody; },
        sing: (x = [], m) => {
            voices = [0, ...x];
            melody = m || melody
        },
    };
};

// GRAPHICS =====================================
SCREEN = ({
    WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    os = false,
} = {}) => {
    let REAL = os ? null : document.createElement('canvas');
    if (REAL) {
        REAL.width = WIDTH;
        REAL.height = HEIGHT;
    }
    let CVS = os ? new OffscreenCanvas(WIDTH, HEIGHT) : REAL.transferControlToOffscreen();
    let ctx = CVS.getContext('2d');
    CVS.width = WIDTH;
    CVS.height = HEIGHT;
    const S = {
        get W1() { return CVS.width; },
        get W2() { return CVS.width / 2; },
        get W3() { return CVS.width / 3; },
        get H1() { return CVS.height; },
        // get H2() { return CVS.height / 2; },
        H2: CVS.height/2,
        get H3() { return CVS.height / 3; },
        get R3() { return min(S.H3, S.W3); },
        get Rm() { return min(S.H1, S.W1); },
        get RM() { return max(S.H1, S.W1); },
        CVS,
        REAL,
        ctx
    };
    S.RESIZE = (w, h) => {
        if (!os) {
            const n = document.createElement('canvas');
            REAL.replaceWith(n);
            REAL = n;
            n.width = w;
            n.height = h;
            CVS = REAL.transferControlToOffscreen();
            ctx = CVS.getContext('2d');
            PUT(S,{CVS,ctx,REAL});
        }
        CVS.width = w;
        CVS.height = h;
        S.H2 = CVS.height/2;
    };
    S.DO = (f) => { ctx.save(); f(S); ctx.restore(); return S; };
    S.E = () => { ctx.clearRect(0, 0, S.W1, S.H1); return S; };
    S.center = () => { S.T(S.W2, S.H2); return S; }
    S.FX = (x = "none") => { ctx.filter = x; return S; }
    S.T = (x, y) => { ctx.translate(x, y); return S; }
    S.R = (x, y) => { ctx.rotate(x, y); return S; }
    S.M = (...p) => { ctx.moveTo(...p); return S; };
    S.L = (...p) => { ctx.lineTo(...p); return S; };
    S.A = (x = 0, y = 0, r = 1, s = 0, e = PIZZA[1], c = false) => { ctx.arc(x, y, r, s, e, c); return S; };
    S.B = (...p) => { ctx.bezierCurveTo(...p); return S; };
    S.P = (s) => {
        ctx.beginPath();
        s?.match(/[MLABCTREOSFW](?:\s*-?\d+(?:\.\d+)?|\s*#[a-f0-9]{3,8}|\s*hwb\([^)]+?\))*/g).forEach((x) => {
            let [o, ...p] = x.includes("(") ? [x[0], x.slice(1).trim()] : x.split(" ");
            S[o](...MAP(p, x => x[0] === "#" || x.includes("(") ? x : parseFloat(x, 10)));
        });
        return S;
    };
    S.C = () => { ctx.closePath(); return S; };
    S.O = (o) => { ctx.globalAlpha = o; return S };
    S.S = (x = 1, y = 1) => { ctx.scale(x, y); return S; };
    S.GS = (g, cs) => EACH(cs, (c, i) => g.addColorStop(i / cs.length, c));
    S.GL = (x1, y1, x2, y2, cs) => {
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        S.GS(g, cs);
        return g;
    };
    S.GR = (x1, y1, r1, x2, y2, r2, cs) => {
        const g = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
        S.GS(g, cs);
        return g;
    };
    S.F = (c) => { ctx.fillStyle = c; ctx.fill(); return S; };
    S.FP = (c, p) => { ctx.fillStyle = c; ctx.fill(p); return S; };
    S.W = (c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); return S; };
    S.WP = (c, w, p) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(p); return S; };
    S.IMG = (...p) => ctx.drawImage(...p);
    S.E();
    return S;
};
const PATH = () => {
    const P = new Path2D();
    P.M = (...p) => { P.moveTo(...p); return P; };
    P.L = (...p) => { P.lineTo(...p); return P; };
    P.A = (x = 0, y = 0, r = 1, s = 0, e = PIZZA[1], c = false) => { P.arc(x, y, r, s, e, c); return P; };
    P.AT = (...p) => { P.arcTo(...p); return P; }
    P.B = (...p) => { P.bezierCurveTo(...p); return P; };
    P.Q = (...p) => { P.quadraticBezierCurveTo(...p); return P; };
    P.C = () => { P.closePath(); return P; };
    return P;
};
const TILE = (WIDTH, HEIGHT) => SCREEN({ WIDTH, HEIGHT: HEIGHT || WIDTH, os: true });

const SUN = (R = 32, F = "#840") => {
    const sc = TILE(3 * R);
    const C = R / 4;
    const now = R * 1.4;
    const DRAW = () => {
        sc.DO(() => {
            sc.E()
                .center()
                .P().A(0, 0, R).C()
                .F(F)
                .P()
                .M(-now, -C).L(now, -C)
                .M(-now, C).L(now, C)
                .M(-C, -now).L(-C, now)
                .M(C, -now).L(C, now)
                .W(F, 3);
        });
    };
    DRAW();
    return {
        R: R * 1.5,
        D: R * 3,
        get IMG() { return sc.CVS; }
    };
};

// ENTITIES ======================================
Array.DEFAULTS=()=>[];
const MAKE = (a, d, m={}, p="ENT") => {
    // BEGIN DEBUGGING
    try {
    // END DEBUGGING
        const dd = window[p].DEFAULTS?.() ?? [];
        const o = dd.length;
        const dv = MAP(d, ([_,x]) => typeof x === "function" ? x.toString().replace(/^\(\) ?=> ?/,"") : JSON.stringify(x)).join(",");
        const e = `window.${a}=class ${a} extends ${p}{` +
    `static DEFAULTS=()=>[...${p}.DEFAULTS(),${dv}];` +
    `constructor(...x){super(...(x.length ? x : ${a}.DEFAULTS()))}` +
    `*[Symbol.iterator]() {for(let i = 0,l=this.length;i<l;i++){yield this[i]}}` +
    `${MAP(d, ([p], i) => `  get ${p}(){return this[${i + o}]} set ${p}(x){return this[${i + o}]=x}`).join("")}` +
            `${MAP(Object.values(m), f => f.toString()).join("")}};`
        // BEGIN DEBUGGING
            +`console.log("GENERATED ${a}");`
        // console.log(e);
        // END DEBUGGING
        return eval(e);
    // BEGIN DEBUGGING
    } catch (e) {
        console.error(`Failed to make ${a}`);
        throw e;
    }
    // END DEBUGGING
};
// A bit of rendering optimization. Let's improve the speed of the perspective call
const YS = STRIPE(1280, (i) => (4 / ((i + 1) / 10)) * 5).reduce((m,x,i) => (m.set((i+1)/10, x)),new Map());

MAKE("ENT", [
    ["x", 0],
    ["y", 0],
    ["z", 0],
    ["age", 0],
    ["AREA", []],
], {
    COPY() { return new this.constructor(...this) },
    MOVE(x) { [this.x, this.y, this.z] = MOVE(this,x); return this },
    ROT(x) { [this.x, this.y] = ROT(this, x); return this },
    DIFF(x) { return new ENT(...DIFF(this, x)) },
    POS() { return MAP([this.x,this.y,this.z],round) },
    NORM(l=1) { [this.x, this.y] = NORM([this.x, this.y], l); return this },
    SCALE(l=1) { this.NORM(this.LEN() * l); return this },
    LEN() { return LEN([this.x, this.y]) },
    PREP(tv) {
        let [x, y, ys] = this.PERSPECTIVE();
        tv.S(ys, ys);
        tv.T(x,y);
        return this;
    },
    PERSPECTIVE() {
      const diff = this.DIFF(CAMERA);
      let [x, y, z] = diff;
      const ys = y < 0 ? 4 / -y * 5 : 0;
      x = 4 * x;
      y = z * 4 * ys;
      return [x, y, ys];
    },
    PROJECT(a=1) {
        let [x, y, ys] = this.PERSPECTIVE();
        x *= ys * PXL;
        y *= ys * PXL;
        const m = a ? - PXL * 2 * ys : 0;
        return new ENT(x + TV.W2, y + TV.H2 + m, 2 * ys * (a ? PXL : 1));
    },
    CLICKAREA() {
        const [x,y,z] = this.PROJECT();
        return PATH().A(x,y,abs(z)).C();
    },
    UPDATE(_) {
        let t = _ / 1000;
    },
    THINK() {},
    DRAW() {},
}, "Array");

MAKE("DRUM", [
    ["ICON",null],
    ["OK",[]],
    ["DO",()=>{}]
]);

// FIRE = HOUR > 0.5 && READY ? DRUM : ACCEPT


// STONE => REMOVE + STONE
// GRASS => SHRINK + GRASS
// BUSH => SHRINK + STICK
// FLOWER => SHRINK + FLOWER
// DEER => SLEEP + DEER
// BISON => SLEEP + DEER
// PINE => SHRINK + WOOD
// OAK => SHRINK + WOOD


MAKE("TASK", [
    ["TCK", 0],
    ["CHANGES", {}],
    ["TARGET",null],
    ["START", null],
    ["STOP", null],
    ["UPDATE",()=>{}]
],{},"Array")

const IDLE = { w: 0, a: 0, s: 0, d: 0 };
MAKE("ACT", [
    ["shell", null],
    ["SPEED", 0],
    ["MOVED", 0],
    ["DIRECTION", 1],
    ["ORIENTATION", 1],
    ["MOMENTUM", () => new ENT()],
    ["INPUT", () => new ENT()],
    ["TURNING", () => new ENT(1,1,0)],
    // ["AREA",  []], // MOVED TO ENT
    ["SCHEDULE", []],
    ["w", 0],
    ["a", 0],
    ["s", 0],
    ["d", 0],
    ["SPEEDLIMIT", 2],
    ["INVENTORY", []],
    ["DRUMS", []],
    ["LASTSTEP", 0],
    ["PROJECTED",[0,0,0]],
], {
    ENERGY() { return this.SPEED ? abs(this.SPEED) : 0 },
    STEPPED() { let x = this.MOVED % 1; x *= this.MOMENTUM.LEN?.() || IN(x, 1/32,31/32) ? 1 : 0; return (this.DIRECTION < 0 ? 1 - x : x) % 1 },
    CYCLE() { return this.STEPPED() ? OF(this.STEPPED() % 0.5, 0.5) % 1 : 1 - (bar % 0.5 * 2) % 1 },
    UPDATE(_) {
        let t = _ / 1000;
        // let beat = false;
        // let { SPEED, DIRECTION } = this;
        // let breaks = false;
        const STEPPED = this.STEPPED();
        const ENERGY = this.ENERGY();
        let { w, a, s, d } = this;
        const begx = round(this.x)+128, begy = round(this.y)+128;
        const tasks = this.SCHEDULE.filter(x => x.TCK <= TCK);
        if (tasks.length) {
            EACH(tasks, x => {
                x.START = x.START || x.TCK;
                // console.log(`Executing task for ${this.constructor.name}`, x);
                if (x.TARGET) {
                    // console.log("Following target");
                    const delta = LEN(this, x.TARGET);
                    const towards = x.TARGET.COPY().SCALE(-1).MOVE(this);
                    if (towards.LEN() > 1/2) {
                        x.TCK = TCK;
                        let dw = abs(this.x - x.TARGET.x);
                        let dh = abs(this.y - x.TARGET.y);
                        dw = OF(dw, 1) > 3/8 ? 1 : 0;
                        dh = OF(dh, 1) > 3/8 ? 1 : 0;
                        PUT(x.CHANGES, this.x > x.TARGET.x ? { a: dw, d: 0 } : { a: 0, d: dw }, this.y > x.TARGET.y ? { w: dh, s: 0 } : { w: 0, s: dh })
                    } else {
                        x.STOP = x.TCK;
                        this.SCHEDULE.push(new TASK(TCK + 1, IDLE, null) ,new TASK(TCK + 12, IDLE, null)); // IDLE TO STOP THINKING
                    }
                } else {
                    x.TCK=-1;
                    x.STOP=TCK
                }
                PUT(this, x.CHANGES);
            });
            if (tasks.length) {
                ({w,a,s,d}=this);
            }
            this.SCHEDULE = this.SCHEDULE.filter(x => !x.STOP || x.STOP > TCK);
        } else {
            PUT(this,{w:0,a:0,s:0,d:0});
        }
        this.INPUT = new ENT(-a+d, -w+s, 0);

        // TODO: check INPUT to ensure it puts us inside of our AREA and adjust if needed
        this.DIRECTION = sign(this.INPUT.x || this.DIRECTION);
        this.ORIENTATION = sign(this.INPUT.y || this.ORIENTATION);
        const move = new ENT(...this.INPUT);
        const momentum = new ENT(...this.MOMENTUM);
        const c = this.CYCLE();
        // if (move.LEN() === 0 && momentum.LEN() < c / 2 && IN(c, 1 / 8, 7 / 8)) {
        if (move.LEN() === 0 && IN(momentum.LEN(), 1/16, c)) {
            // if (this === PLAYER) {
            //     console.log("Forcing completion of step", c, momentum.LEN());
            // }
            move.MOVE(new ENT(...this.TURNING).NORM(((1 - c) / 2)));
        }
        // if (move.LEN() === 0) { return; }
        move.NORM(t*4);
        if (this.INPUT.LEN()) {
            const s = 0.75 + OF(move.COPY().NORM(2).MOVE(momentum.COPY().NORM(1)).LEN(), 3) / 4;
            // if (this === PLAYER && s < 1) {
            //     console.log("Shifting momentum", momentum.LEN(), s);
            // }
            momentum.SCALE(s);
        }
        momentum.MOVE(move);
        momentum.NORM(min(momentum.LEN(), this.SPEEDLIMIT));
        this.MOMENTUM = momentum;
        const m = momentum.LEN();
        const adjust = new ENT(...momentum);
        adjust.NORM(adjust.LEN() * t);
        const target = MOVE(this, adjust);
        if (this.AREA.length && !this.AREA.find(x => LEN(DIFF(x, target)) < x.RADIUS)) {
            adjust.SCALE(-0.5);
        }
        let endx = round(this.x+adjust.x)+128, endy = round(this.y+adjust.y)+128;
        if (begx !== endx || begy !== endy) {
            const o = world.GRID[endy][endx];
            if (o && o !== this) {
                // cancel the movement, we can't go there
                // adjust.SCALE(0);
                // BEGIN DEBUGGING
                // console.log("Prevented collision between", this, o);
                // END DEBUGGING
                // TODO: fix this better
                adjust.SCALE(-0.5);
                endx = round(this.x+adjust.x)+128, endy = round(this.y+adjust.y)+128
            }
            world.GRID[begy][begx]=null;
            world.GRID[endy][endx]=this;
        }
        this.MOVE(adjust);
        this.MOVED += adjust.LEN();
        this.SPEED = m * this.DIRECTION;
        this.TURNING = m ? momentum.COPY().NORM(1) : this.TURNING;
        if (this.INPUT.LEN() < 1 / 4 && momentum.LEN()) {
            momentum.SCALE(this.CYCLE() < 1 / 8 ? 0 : POF(1 - t * 2, 1));
        }
        if (momentum.LEN() === 0 && this.STEPPED() && c) {
            momentum.SCALE(0);
            this.MOVED = round(this.MOVED * 2) / 2;
        }
        if (this === PLAYER) {
            const s = floor(this.MOVED / 0.25);
            if (s > this.LASTSTEP) {
                EMIT("rattle", this.TURNING.x/-2);
            }
            this.LASTSTEP = s;
        }
        this.PROJECTED = this.PROJECT();
    },
    THINK() {
        if (!this.SCHEDULE?.length) {
            // TODO: TEMPORARY, let's make this make more sense
            const a = this.AREA[0];
            this.SCHEDULE = [new TASK(TCK, {}, a.COPY().MOVE(new ENT(0, 2 + rand.INT(a.RADIUS-2), 0).ROT(rand() * CIRCLE)))];
        }
    }
}, "ENT");

const SHELL = ({ DIAM = 512, DRUMS = [] } = {}) => {
    const sc = TILE(DIAM),
        R = DIAM / 2,
        r = DIAM / 12,
        S = {
            R, DIAM, DRUMS,
            DRAW: (tv = sc) => {
                tv.DO(() => {
                    let z = r * 5.6;
                    if (tv === sc) {
                        tv.E().center();
                    }
                    tv.P().A(0, 0, R).C().F(tv.GR(0, r * 2, r * 4, 0, 0, DIAM, ["#242", "#262"]));
                    sc.P().A(0, 0, z);
                    STRIPE(28, i => {
                        let [x, y] = ROT([1, 0], PIZZA[28] * (i - 0.5) - PIZZA[4]);
                        sc.M(x * z, y * z).L(x * R, y * R)
                    });
                    sc.W(sc.GR(0, r * 2, r * 3, 0, 0, DIAM, ["#3536", "#4846"]), 2)
                    STRIPE(13, i => {
                        let x = 0, y = (i - 11) * r * 2.25;
                        if (i < 10) {
                            const a = PIZZA[10] * (i - 2);
                            [x, y] = ROT([r * 4.5, 0], a)
                        }
                        sc.P().A(x, y, r).C().F("rgba(127,127,127,0.25)");
                        if (DRUMS[i]) {
                            // TODO: drum image
                            sc.P().A(x, y, r).C().F("#aa9");
                        }
                    });
                })
                return tv.CVS
            },
            add(drum) {
                DRUMS.push(drum);
                S.DRAW();
            },
            get IMG() { return sc.CVS; },
        };
    S.DRAW();
    return S;
};

// const RECORD = [];
const PERSONPATH = new Map();
MAKE("PERSON",[
    ["COLOR", () => `hwb(${round(30 + rand.BIAS()*10 - 2)} ${round(0 + rand()*10)}% ${round(47 + rand()*10)}%)`],
    ["STROKE", () => `hwb(${round(30 + rand.BIAS()*2 - 2)} 0% ${round(67 + rand()*4)}%)`]
],{
    PATH(s, c, d, o, m) {
        // const [S, C, D, O, M] = [FIX(s, 8), FIX(c, 64), d, o, FIX(m[0], 8)];
        const [S, C, D, O, M] = [FIX(s, 4), FIX(c, 64), d, o, FIX(m[0], 4)];
        const k = [S, C, D, O, M].join();
        if (!PERSONPATH.has(k)) {
            let sy = ESIN(C) / 8;
            let hx = S ? S / 8 : ESIN(C) / 16;
            let hy = EHSIN(C) / 8;
            let S16 = abs(S / 16);

            let ap = S ? WALK(C) : [0, 0];
            let bp = S ? WALK(1 - C) : [0, 0];
            let [l, r] = [ap, bp];
            let [[rx, ry], [lx, ly]] = [l,r];
            const xs = sqrt(abs(M) / (abs(S) || 1));
            // Body
            PERSONPATH.set(k, PATH()
                .A(0 + hx*xs, -3 + hy, 1, CIRCLE[4], CIRCLE) // head
                .M(0 + hx*xs, -2 + hy) // neck
                .L(2 + lx / 3, -1.5 + sy * D) // right hand
                .L(1 + rx / 16, -1 + sy * D) // right hip
                .L(1 + rx * xs, ry) // right foot
                .L(0, -1 + hy) // crotch
                .L(-1 - lx * xs, ly) // left foot
                .L(-1 + lx / 16, -1 - sy * D) // left hip
                .L(-2 - rx / 3, -1.5 - sy * D) // left hand
                .C()
            );
        }
        return PERSONPATH.get(k);
    },
    DRAW(tv, cycle = bar % 0.5 * 2, prep = true) {
        tv.DO(() => {
            if (prep) { this.PREP(tv); }
            const STEPPED = this.STEPPED() % 0.5;
            let CYCLE = STEPPED ? OF(STEPPED % 0.5, 0.5) : 1 - cycle;
            let { SPEED } = this;
            let hx = SPEED ? SPEED / 8 : ESIN(CYCLE) / 16;
            let hy = EHSIN(CYCLE) / 8;
            let S16 = abs(SPEED / 16);

            const xs = sqrt(abs(this.MOMENTUM[0]) / (abs(SPEED) || 1));
            // Shell behind
            if (this.shell && this.ORIENTATION > 0) {
                tv.P().A(0 - hx*xs / 2, -1.75 - hy / 2 + S16, 7 / 8).C().W("#242", 1 / 16).F("#131");
            }
            // Body
            const p = this.PATH(this.SPEED, CYCLE, this.DIRECTION, this.ORIENTATION, this.MOMENTUM);
            tv.WP(this.STROKE, 1 / 8, p).FP(this.COLOR, p);

            // Shell in-front
            if (this.shell && (this.ORIENTATION < 0 || PAUSED)) { // Or facing backwards
                tv.DO(() => {
                    tv.P().A(0 - hx*xs / 2, -1.75 - hy / 2 + S16, 7/8).C()
                    if (this === PLAYER) { tv.F("#554"); }
                    tv.W("#242", 1 / 16);
                    tv.T(0 - hx*xs / 2, -1.75 - hy / 2 + S16);
                    tv.R(this.MOMENTUM[0] / 16);
                    tv.IMG(this === PLAYER ? world.MAP.CVS : shell.IMG, -1, -1, 2, 2);
                    if (this === PLAYER) {
                        let [x, y] = MAP(PLAYER.POS(),x=>x/128)
                        tv.P().A(x, y, 1/32).C().F(this.COLOR);
                    }
                });
            }
            // BEGIN DEBUGGING
            if (DEBUG) {
                tv.font = ``;
                tv.ctx.fillStyle = "#0f0";
                tv.ctx.font = '0.25px monospace';
                tv.ctx.fillText(this.POS().join(","), -1, -2)
            }
            // END DEBUGGING
        });
    }
},"ACT");

MAKE("DEER", [], {
    DRAW(tv) {
        tv.DO(() => {
            this.PREP(tv);
            tv.S(this.DIRECTION, 1);
            let spd = this.SPEED;
            let [cx, cy] = spd ? WALK(this.CYCLE()) : [0, 0];
            let [dx, dy] = spd ? WALK(1 - this.CYCLE()) : [0, 0];
            let [[lx, ly], [rx, ry]] = this.DIRECTION > 0 ? [[cx,cy],[dx, dy]] : [[dx,dy],[cx,cy]];
            const xs = sqrt(abs(this.MOMENTUM[0]) / (abs(spd) || 1));
            tv.P()
                .M(1, -2 + ly / 4) // chin
                .L(0 - rx*xs, 0 + ry) // right foot
                .L(0, -1 + ly / 4) // front belly
                .C()

                .M(-1, -1 + ry / 4) // hind belly
                .L(-1 + lx*xs, 0 + ly) // left foot
                .L(-2, -1.5 + ry / 4) // left hip
                .C()
                .F("#520")

            tv.P()
                .M(1, -3 + ly / 4) // head
                .L(2, -2 + ly / 4) // mouth
                .L(1, -2 + ly / 4) // chin
                .L(1 + lx*xs, 0 + ly) // right foot

                .L(0, -1 + ly / 4) // front belly
                .L(-1, -1 + ry / 4) // hind belly

                .L(-2 - rx*xs, 0 + ry) // left foot
                .L(-2, -1.5 + ry / 4) // left hip
                .L(-1.75, -1.75 + ry / 4) // butt
                .L(-2, -2 + ry / 4) // tail
                .L(0, -2 + ly / 4) // back
                .L(0.5, -2.5 + ly / 4) // neck
                .L(0, -3 + ly / 4) // ear
                .C()
                .W("#620", 1 / 8)
                .F("#840")
            tv.P()
                .A(1, -4 + ly / 4, 1, PIZZA[2], 1, true) // horn
                .W("#620", 0.125);

        });
    }
}, "ACT");

MAKE("BISON", [], {
    DRAW(tv, h, lightx, lighty) {
        tv.DO(() => {
            this.PREP(tv);
            tv.S(this.DIRECTION, 1);
            let spd = this.SPEED;
            let [cx, cy] = spd ? WALK(this.CYCLE()) : [0, 0];
            let [dx, dy] = spd ? WALK(1 - this.CYCLE()) : [0, 0];
            let [[lx, ly], [rx, ry]] = this.DIRECTION > 0 ? [[cx, cy], [dx, dy]] : [[dx, dy], [cx, cy]];
            const xs = sqrt(abs(this.MOMENTUM[0]) / (abs(spd) || 1));
            tv.P()
                .M(1, -2 + ly / 4) // chin
                .L(0 - rx*xs, 0 + ry) // right foot
                .L(0, -1 + ly / 4) // front belly
                .C()

                .M(-1, -1 + ry / 4) // hind belly
                .L(-1 + lx*xs, 0 + ly) // left foot
                .L(-2, -1.5 + ry / 4) // left hip
                .C()
                .F("#520")

            tv.P()
                .M(2, -2 + ly / 4) // head
                .L(2, -1 + ly / 4) // nose
                .L(1.5, -0.5 + ly / 4) // mouth
                .L(1, -1 + ly / 4) // chin
                .L(1 + lx*xs, 0 + ly) // right foot

                .L(0, -1 + ly / 4) // front belly
                .L(-1, -1 + ry / 4) // hind belly

                .L(-2 - rx*xs, 0 + ry) // left foot
                .L(-2, -1.5 + ry / 4) // left hip
                .L(-1.75, -1.75 + ry / 4) // butt
                .L(-2, -2 + ry / 4) // tail
                .L(0, -3 + ly / 4) // back
                .L(1, -2.25 + ly / 4) // neck
                .L(1.5, -2.5 + ly / 4) // ear
                .C()
                .stroke("#620", 1 / 8)
                .F("#840")
            tv.P()
                .A(2, -2.25 + ly / 4, 3/4, PIZZA[2], PIZZA[2]+PIZZA[7]) // horn
                .stroke("#620", 0.125);

        });
    }
}, "ACT");

MAKE("MOON", [
    ["PHASE", 0],
    ["RADIUS", 32],
    ["COLOR","#ccf"],
    ["STROKE","#ccf4"]
], {
    DRAW(tv) {
        tv.DO(() => {
            const { PHASE, RADIUS } = this;
            const r = RADIUS-1;
            const C = RADIUS*1.3
            if (PHASE) {
                const c = ZFLOOR(cos(PIZZA[28] * PHASE) * C),
                    a = PHASE < 14 ? c : -C,
                    b = PHASE > 14 ? -c : C;
                tv.P().M(0, r).B(b, RADIUS, b, -RADIUS, 0, -r).B(a, -RADIUS, a, RADIUS, 0, r).C().F(this.COLOR);
            }
            tv.P().A(0, 0, r).C().W(this.STROKE, RADIUS/16)
        });
    },
    LIGHT() {
        return abs(sin(PIZZA[2] * this.PHASE / 28));
    }
}, "ENT");

MAKE("AREA", [
    ["COLOR", () => `hwb(${120 + rand.INT(25)} ${10 + rand.INT(5)}% ${round(65 + rand.INT(5))}%)`],//"#800"],
    // ["COLOR", () => "#242"],
    // BEGIN DEBUGGING
    ["NAME", "area"],
    // END DEBUGGING
    ["RADIUS", 16],
    ["POINTS", []],
    ["ENTITIES", []],
    ["LANDSCAPE",[]],
    ["VISIBLE", 0],
    ["DEBUG",null]
], {
    GENERATE(r = 16) {
        this.RADIUS = r;
        const offset = rand();
        this.POINTS = STRIPE(16, x => new ENT(0, -r, 0).ROT(PIZZA[16] * (x + rand()/4)));
        // EACH(this.POINTS,SLOPE)
        return this
    },
    UPDATE(_) {
        const _r = this.RADIUS + 1;
        const [l] = new ENT(-_r, -_r, 0).MOVE(this).PROJECT();
        const [r] = new ENT(_r, -_r, 0).MOVE(this).PROJECT();
        this.VISIBLE =  r <= 0 || l >= TV.W1 ? 0 : 1;
        EACH(this.LANDSCAPE,x=>x.UPDATE?.(_));
    },
    DRAW(tv) {
        if (!this.VISIBLE) { return; }
        tv.DO(() => {
            let o = 0;
            // Prepare the movements
            let worker = new ENT();
            let t = MAP(this.POINTS, (p, i) => {
                worker.splice(0, worker.length, ...p);
                const [x, y, ys] = worker.MOVE(this).PERSPECTIVE();
                if (ys) {
                    o = max(o, ys);
                    let tx = x * ys,
                      ty = y * ys;
                    return () => (i ? tv.L : tv.M)(tx, ty);
                }
                return () => { };
            });
            // TODO: Fill in the bottom
            // Draw stuff
            tv.P();
            EACH(t, f => f());
            tv.C()
            .O(0.25)
            .F(this.COLOR)
            .W(this.COLOR,2/32);
            tv.P(`M ${FIX(l)} ${FIX(u)} L ${FIX(r)} ${FIX(u)} W #0f0 4`);
        })
        return tv.CVS
    }
}, "ENT");

MAKE("PINE",[
    ["PATH",""],
    ["TV", null],
    ["WIDTH",0],
    ["HEIGHT",0],
    ["COLOR", () => `hwb(${round(150 + rand.BIAS()*2)} ${round(7 + rand()*5)}% ${round(80 + rand.BIAS()*4)}%)`]
], {
    GENERATE(_){
        const a = this.AGE = _ || this.AGE || rand()*4+3;
        // const a = this.AGE;
        const t = ceil(a);
        let b = 0, mw = 0, x = 0;
        this.PATH = STRIPE(t, i => {
            const s = (a - i) / (a - i + 3);
            const p = b - s / 0.125;
            const w = s * (t-i);
            const h = b + s + 0.5;
            const c = OF(a-i,t);
            // const n = STRIPE(5,()=>FIX(rand.BIAS() * s / 2));
            const n = FIX(rand.BIAS()*c*s/2);
            mw = max(w, mw);
            const r = `M ${n} ${FIX(p)} L ${FIX(-w)} ${FIX(h)-rand()*c} L ${FIX(x)} ${FIX(b+0.25)} L ${FIX(w)} ${FIX(h)-rand()*c} L ${n} ${FIX(p)}`;
            x = n;
            b = p;
            return r;
        }).join(" ") + ` F ${this.COLOR} S #1218`; //" F #243 W #132 0.0625";
        this.WIDTH = ceil(mw*2);
        this.HEIGHT = ceil(abs(b));
        this.TV = SCREEN({ WIDTH: this.WIDTH * PXL * 4, HEIGHT: this.HEIGHT * PXL * 4, os: true });
        // console.log("Pine generating new image", this.PATH, this.WIDTH, this.HEIGHT, this.TV.CVS.WIDTH, this.TV.CVS.HEIGHT);
        this.TV.DO((tv) => tv.S(PXL,PXL).T(this.WIDTH/2,this.HEIGHT).P(this.PATH));
        return this;
    },
    DRAW(tv) {
        if (!this.TV) { return; }
        tv.DO(() => {
            this.PREP(tv);
            tv.IMG(this.TV.CVS,-this.WIDTH/2, -this.HEIGHT, this.WIDTH * 4, this.HEIGHT * 4);
        });
        return this;
    },
    // UPDATE(_) {
    //     const t = _/1000;
    //     return this;
    // },
}, "ENT");

MAKE("FLOWER",[
    ["TV", null],
    ["PHASE", 0],
    ["COLOR","#263"],
    ["LAST", -1],
    ["WIDTH", 4],
    ["HEIGHT", 4],
    ["BLOOM",false]
], {
    GENERATE(p){
        // const b = (p + 28 - this.PHASE)%28 < 3;
        const b = this.BLOOM;
        this.TV = this.TV ?? TILE(this.WIDTH * PXL * 4, this.HEIGHT * PXL * 4);
        const xo = rand.BIAS()/4;
        const y = b ? -2 : -1.5;
        const yo = rand()/8;
        const Y = y+yo;
        this.TV.DO((tv) => {
            tv.E().S(PXL, PXL).T(this.WIDTH / 2, this.HEIGHT)
                .P().M(-1.5-xo,0).B(-2.5,-3, -1,-3, xo,-2+yo).B(1,-3, 2.5,-3, 1.5+xo,0).C().F(this.COLOR)
                .P().M(0,0).B(-xo*2,-yo, xo*4,Y, xo,Y).W("#0002",1/8);
            // Bloom
            tv.P().A(xo, Y, b ? 3/4 : 1/8)
            .F(`hwb(${round((180/28 * this.PHASE + 240 + rand.BIAS()/4)%360)} ${round(10 + rand()*25)}% 5%)`)
            if (this.BLOOM) {
                const m = PUT(new MOON(),{RADIUS:10,PHASE:this.PHASE,COLOR:"#000",STROKE:"#fff0"});
                tv.O(0.25).T(xo, Y).S(1/16,1/16);
                m.DRAW(tv);
            }
        });
        return this;
    },
    DRAW(tv) {
        if (!this.TV) { return; }
        tv.DO(() => {
            this.PREP(tv);
            tv.IMG(this.TV.CVS,-this.WIDTH/2, -this.HEIGHT, this.WIDTH * 4, this.HEIGHT * 4);
        });
        return this;
    },
    UPDATE(d, _p, _h) {
        const p = _p ?? moon?.PHASE, h = _h ?? HOUR;
        if (p !== this.LAST && h >= 0.5) {
            this.LAST = p;
            const b = (p + 28 - this.PHASE)%28 < 3;
            if (!b && this.TV) { return this; }
            // this.BLOOM=b;
            this.BLOOM=true;
            this.GENERATE(p);
        }
        return this;
    },
    CAN() {
        return this.BLOOM;
    },
    INTERACT() {
        const f = PUT(this.COPY(), { TV: null });
        PLAYER.INVENTORY.push(f.GENERATE());
        this.BLOOM;
    }
}, "ENT");

MAKE("FIRE",[], {

}, "ENT")

MAKE("WORLD", [
    ["SEED", 13],
    ["AGE", 0],
    ["MOON", []],
    ["DRUMS", []],
    ["GRID",() => STRIPE(256,x=>STRIPE(256,y=>null))],
    ["AREAS", []],
    ["MAP", null],
    ["FLOOR", null],
    ["STRIPES", []],
    ["ENTITIES", []],
    ["LANDSCAPE", []]
],
{
    GENERATE(s) {
        this.MAP = this.MAP || SCREEN({ WIDTH: 256, HEIGHT: 256, os: true });
        this.FLOOR = this.FLOOR || SCREEN({ WIDTH: 256, HEIGHT: 256, os: true });
        this.SEED = s;
        rand.seed(s);
        console.log("Generating world and setting seed", s, rand.seed());
        let R = 98; // radius of moons
        let r = 16;
        let z = r * 5.6; // radius of outer path
        this.MOONS = STRIPE(28, (y) => new AREA()
            .GENERATE(12)
            .MOVE([r * 6, 0, 0])
            .ROT(y * PIZZA[28] - PIZZA[4])
        );
        this.DRUMS = STRIPE(13, (i) =>
            i < 10
                ? new AREA()
                    .GENERATE(18)
                    .MOVE([r * 5, 0, 0])
                    .ROT(PIZZA[10] * (i + 2.5))
                : new AREA().GENERATE(18).MOVE([0, (i - 11) * r * 2.5, 0])
        );
        this.AREAS = [...this.MOONS, ...this.DRUMS]; //.sort(SCREENSORT);
        EACH(this.MOONS, (x, i) => {
            x.NAME = `moon ${i}`;
            // x.ENTITIES.push(new PINE().GENERATE().MOVE(x))
            // TODO: GENERATE LANDSCAPE
            EACH(x.POINTS, p => {
                const s = this.AREAS.filter(a=>p.COPY().MOVE(x).DIFF(a).LEN()<=a.RADIUS+0.05).length;
                // console.log("Point s", s, p);
                if (s < 2) {
                    // THIS IS AN EDGE POINT
                    const e = new PINE().GENERATE().MOVE(x).MOVE(p);
                    e.AREA.push(x);
                    x.LANDSCAPE.push(e);
                    this.LANDSCAPE.push(e);
                }
            });
            const f = PUT(new FLOWER(), { x:x.x, y:x.y, PHASE: i }).UPDATE(0,0,0.5);
            x.LANDSCAPE.push(f);
            this.LANDSCAPE.push(f);
        });
        EACH(this.DRUMS, (x, i) => {
            // BEGIN DEBUGGING
            x.NAME = `drum ${i}`;
            // END DEBUGGING
            // TODO: GENERATE TERRAIN
            // POPULATE WITH ENTITIES
            STRIPE(3,i=>{
                // const v = new (rand.pick([PERSON,DEER,BISON]))().MOVE(
                const v = new PERSON().MOVE(
                  x.COPY().MOVE(new ENT(0, 6 + rand.INT(6), 0).ROT(PIZZA[3]*(i+rand.BIAS()/8)))
                )
                x.ENTITIES.push(v);
                v.AREA.push(x);
            });
        });
        this.ENTITIES.push(
          ...MAP(this.AREAS, (x) => x.ENTITIES)
            .flat()
            .sort(SCREENSORT)
        );
        this.MAP.DO((tv) => {
            tv.E().center();
            EACH(this.AREAS, (a) => {
                tv.P();
                EACH(a.POINTS, (p, i) => (i ? tv.L : tv.M)(p[0] + a.x, p[1] + a.y));
                tv.C()
                .F(tv.GR(0, 90, 90, 0, 0, 256, ["#242", "#262"]))
                // .W("#0008", 0.75)
                .O(0.25)
                .W(tv.GR(0, 184, 276, 0, 0, 256, ["#353", "#484"]), 1)
                .O(1);
            });
        });
        // Start building the world from here
        this.FLOOR
            // Dark outer ring
            .P().A(128,128,108).W("#202",16).C()
            // The Water
            .P().A(128,112,48)
            .F(this.FLOOR.GR(128, 128, 32, 128, 128, 256, ["hwb(250deg 14% 57%)", "hwb(220deg 65% 12%)"]));
        // Drop the map down as a baseline
        this.FLOOR.IMG(this.MAP.CVS,0,0,256,256);
        // Draw Moons
        const MOONSTAMP = PUT(new MOON(),{RADIUS:10});
        EACH(this.MOONS, (m,i)=> {
            PUT(MOONSTAMP,{PHASE:i});
            this.FLOOR.DO(tv=>{
                tv.T(128+m.x,128+m.y)
                    .O(0.875)
                    .P().A(0,0,m.RADIUS).F(m.COLOR)
                    .O(0.125);
                MOONSTAMP.DRAW(tv);
            });
        });
        // Draw Drums
        // Landscape elements
        this.FLOOR.DO(tv=>{
            tv.center();
            console.log(`Plotting ${this.LANDSCAPE.length} landscape items`);
            EACH(this.LANDSCAPE.filter(l=>!(l instanceof FLOWER)), l => this.FLOOR.P().A(l.x,l.y+0.5,1.25).F(l.COLOR));
        });
        // Place all entities into the grid
        EACH([...this.ENTITIES,...this.LANDSCAPE,PLAYER],e=>{
            e.y=ZROUND(e.y);
            e.x=ZROUND(e.x);
            this.GRID[e.y+128][e.x+128]=e;
        });
        return this;
    },
    SAVE() {},
    LOAD() {},
    UPDATE(_) {
        let t = _ / 1000;
        PLAYER.AREA = this.AREAS.filter((a) => LEN(DIFF(a, PLAYER)) < a.RADIUS);
        EACH(this.AREAS,x=>x.UPDATE(_));
        return this;
    },
    DRAW(tv) {
        const sx = -tv.W2 / PXL;
        const sw = tv.W1 / PXL;
        let STRIDE = 1;
        // tv.ctx.imageSmoothingEnabled = false;
        for (let i = 0; i <= 256; i += STRIDE) {
            if (i > CAMERA.y + 132) {
                break;
            }
            const s = new ENT(CAMERA.x, i - 128, 0).PROJECT(0);
            const z = s[2];
            if (z === 0) {
                break;
            }
            // if (z > 1) {
            //     STRIDE = 0.5;
            // }
            const sp = z * PXL * 2;
            const beg = max(0,floor(CAMERA.x + 128 - tv.W2 / sp)-4);
            const wide = min(256-beg,ceil(tv.W1 / sp)+8);
            tv.IMG(
                this.FLOOR.CVS, //this.MAP.CVS,
                CAMERA.x + 128 - tv.W2 / sp,
                i,
                tv.W1 / sp,
                1,
                sx,
                (s[1] - tv.H2) / PXL,
                sw,
                z * 2
                // z
            );
            // Draw entities on this layer
            // console.log(`Drawing row ${i} from ${beg} to ${end} (${end-beg}) at [${sx}]`);
            EACH(SORT(this.GRID[i].filter(x=>x),SCREENSORT),x=>x.DRAW(tv));
            // STRIPE(wide,x=>this.GRID[i][x+beg]?.DRAW(tv));

            // TODO: Move to using a pre-sorted index for rendering entities here.
        }
        // tv.ctx.imageSmoothingEnabled = true;
        // const e = MAP(
        //     this.AREAS.filter((x) => x.VISIBLE),
        //     (x) => [...x.ENTITIES,...x.LANDSCAPE]
        // ).flat();
        // e.push(PLAYER);
        // EACH(SORT(e, SCREENSORT), (x) => x.DRAW(tv));
        return tv.CVS;
    },
}, "ENT");


// MAIN INSTANCES OF THINGS
const TV = SCREEN();
let moon = new MOON();
let sun = SUN(32, "#ffd");
let rand = RANDO(13);
let stars = STRIPE(91, () => [rand.BIAS(), rand.BIAS()]);
let shell = SHELL();
let PLAYER = PUT(new PERSON(), { x: 0, y: 104, z: 0, shell, ORIENTATION: -1, COLOR:"#840", STROKE:"#620" });
let MOUSE = new ENT();
MOUSE.PATH = PATH().M(-2,-2).L(2,2).L(-2,2).L(2,-2).C();

let world = new WORLD().GENERATE(13);
// let world = new WORLD().GENERATE(Date.now());

// let ground = STRIPE(11, y => new AREA().MOVE(y ? [0, -64, (1 - EHSIN(OF(y-1,9))) * 32 - 16] : [0, 0, 0]).ROT((y-0.5) * PIZZA[10]));
let entities = [
    // ...STRIPE(13, i => PUT(new BISON(), { y: -1 - i, x: rand.INT(16)-8 })),
    // ...STRIPE(13, i => PUT(new PERSON(), { y: -1 - i, x: rand.INT(16) - 8 })),
    // ...STRIPE(13, i => PUT(new DEER(), { y: -1 - i, x: rand.INT(16) - 8 })),
];
let CAMERABACK = 20;
let CAMERAUP = -2;
let CAMERABACKP = 4;
let CAMERAUPP = -1/8;
let CAMERA = new ENT(PLAYER.x, PLAYER.y + CAMERABACKP, PLAYER.z + CAMERAUPP);

// BEGIN DEBUGGING
let DEBUG = false;
ON("key-i",()=>DEBUG=!DEBUG);
// END DEBUGGING


const TICK = (d) => {
    const t = d / 1000;
    if (!PAUSED) {
        // PXL += round((32 - PXL) / 2);
        // UPDATE METRICS
        D += d * RATE;
        DATE = floor(D / DAY);
        HOUR = D % DAY / DAY;
        measure = floor(D / 4000);
        bar = D % 4000 / 4000;
        beat = floor(bar * 8);
        TCK = floor(D / 250);
        if (LAST !== TCK) {
            EMIT("tick");
        }
        LAST = TCK;
        step = D % BPM / BPM;
        // UPDATE PLAYER
        if (KEYS.change) {
            PLAYER.SCHEDULE.unshift(PUT(new TASK(), { TCK, CHANGES: KEYS.MOVE }));
        }
        // RUNNING WITH SHIFT
        if (KEYS.shift) { PLAYER.SPEEDLIMIT = 4; } else { PLAYER.SPEEDLIMIT = 2; }
        // R to toggle aiming

        // BEGIN DEBUGGING
        // if (KEYS[" "]) { PLAYER.z -= t * 2; }
        // END DEBUGGING
        world.UPDATE(d);
        PLAYER.UPDATE(d);
        // TODO: FIX THIS
        // EACH(world.ENTITIES, x => x.THINK?.());
        EACH(world.ENTITIES, x => x.UPDATE?.(d));
    }
    // UPDATE CAMERA
    CAMERA.x += (PLAYER.x - CAMERA.x) / 16;
    CAMERA.y += (PLAYER.y + (PAUSED ? CAMERABACKP : CAMERABACK) - CAMERA.y) / 16;
    CAMERA.z += (PLAYER.z - CAMERA.z + (PAUSED ? CAMERAUPP : CAMERAUP)) / 16;
};

// let MENU = STRIPE(256, (i) => [ceil(2 + rand() * 5), 3]).flat().map(i => i / PXL);
let MENU = STRIPE(256, (i) => [i, i]).flat().map(i => i / PXL);

const MAIN = (t = 0) => {
    const start = performance.now();
    let d = t - now;
    now = t;
    TICK(d * RATE);
    const {H1, H2, H3, W1,  W2, W3, R3, Rm, RM } = TV;
    const h = HOUR;
    const sh = h;
    const mh = (h + 0.5) % 1;
    moon.PHASE = D ? floor((28 + (D - SKYDELAY() * DAY) / DAY ) % 28) : 0;
    let sx = SKYPATH(sh) * W3;
    const sy = RISEFALL(sh);
    let mx = SKYPATH(mh) * W3;
    const my = RISEFALL(mh);
    if (h > 0.5) { sx = -mx; } else { mx = -sx; }
    // BACKDROP
    let shine;
    TV.DO(() => {
        TV.E();
        TV.ctx.fillStyle = sy > 0.1 ? "#840" : "#202";
        TV.ctx.fillRect(0, 0, W1, H1);
        TV.center();
        // Night sky
        if (my > 0.25) {
            const MY = H3 - my * H3 * 2;
            EACH(stars, ([x, y]) => {
                const X = x * W2,
                    yy = (y - mh),
                    Y = yy * H2,
                    M = OF(LEN([mx, MY], [X, Y]), moon.RADIUS * 4),
                    r = 1 + sin((y * 7.3 + (now % DAY / DAY) + x * 1.1) * CIRCLE) * 0.5,
                    s = (r+1)**2 * max(0, sin((y * 7.3 + (now / DAY * 130) + x * 11))**3);
                TV.O(max(0, 1 - (moon.LIGHT() / 2) - (M < 0.25 ? 1 : 1 - M))).P().A(X, Y, r).F("#ffd").C();
                TV.P().M(X, Y-s).L(X,Y+s).M(X-s,Y).L(X+s,Y).W("#ffd",0.5);
            });
            shine = `rgba(204,204,255,${FIX(moon.LIGHT() * 0.1)})`;
            TV
                .O(max(0, my))
                .P().A(mx, MY, RM * 2).C()
                .F(TV.GR(mx, MY, R3 * moon.LIGHT(),
                    mx, MY, R3 * 2,
                    [
                        `rgba(204,204,255,${FIX((0.05 + moon.LIGHT() * 0.2))})`,
                        shine,
                        shine,
                        "rgba(24,0,24,0)"
                    ]
                )).T(mx, MY);
                // .IMG(moon.IMG, mx - moon.R, MY - moon.R, moon.D, moon.D);
                moon.DRAW(TV);
            shine = "#ccf6";
        }
        // Day sky
        if (sy > 0.25) {
            TV.O(max(0, sy));
            shine = "#aae6";
            TV.P().A(sx, H3 - sy * H3 * 2, RM * 2).C()
                .F(TV.GR(sx, H3 - sy * H3 * 2, sun.R * max(sy, 0), sx, H3 - sy * H3 * 2, RM, ["#fff", "#aae", "#aaec", "rgba(170,170,238,0)"]))
                .IMG(sun.IMG, sx - sun.R, H3 - sy * H3 * 2 - sun.R, sun.D, sun.D);
        }
    });
    // let lightx = (sy > 0.125 ? sx : mx) / H3 / 2;
    // let lighty = max(my, sy) * (sy > 0.125 ? 1 : moon.light); // ESIN(h % 0.5) * (h < 0.5 ? 1 : moon.light);
    TV.DO(() => {
        // Camera
        TV.T(W2, H2);
        TV.S(PXL, PXL);
        world.DRAW(TV);
    });
    // MOUSE
    TV.DO(() => TV.T(MOUSE.x-2,MOUSE.y-2).S(4,4).R(CIRCLE*ESIN(now%4000/4000)).FP("#2808",MOUSE.PATH));
    // BEGIN DEBUGGING
    if (DEBUG) {
        TV.DO(() => {
            // EACH(MAP([PLAYER, ...world.ENTITIES], e=>e.PROJECT()),([x,y,z]) => TV.P().A(x,y,abs(z)).C().W("#f00", 1));
            EACH([PLAYER, ...world.ENTITIES, ...world.LANDSCAPE],x => TV.WP("#f00",1,x.CLICKAREA()));
            // grid lines
            TV.P().M(0, 2 * H3).L(W1, 2 * H3).M(W2, 0).L(W2, H1).M(0, H2).L(W1, H2).W("#0f0", 0.125);
            TV.ctx.fillStyle = "#0f0";
            TV.ctx.font = '16px monospace';
            // const p = `M ${STRIPE(13,x=>`${FIX(100 + sin(PIZZA[5]*x)*x*5)} ${100+x*5}`).join(" L ")}  L 100 165 C F #0f0c W #000`;
            // TV.P(p);
            // TV.IMG(world.MOONS[0].LANDSCAPE[7].TV.CVS, W1-128,0);
            EACH([
                `Player (${FXD(PLAYER.x)}, ${FXD(PLAYER.y)}, ${FXD(PLAYER.z)}) [${PLAYER.POS()}] c:${FXD(PLAYER.STEPPED(), 3)}/${FXD(PLAYER.CYCLE(), 3)} s:${FXD(PLAYER.SPEED).padStart(6," ")} d:${PLAYER.DIRECTION}`,
                `Direction ${PLAYER.DIRECTION} Orientation ${PLAYER.ORIENTATION}`,
                // `Momentum (${FXD(PLAYER.MOMENTUM?.LEN?.() || 0)}) ${PLAYER.MOMENTUM.map(x=>FXD(x))}`,
                // `Input (${FXD(PLAYER.INPUT?.LEN?.() || 0)}) ${PLAYER.INPUT.map(x => FXD(x))}`,
                // `Turning (${FXD(PLAYER.TURNING?.LEN?.() || 0)}) ${PLAYER.TURNING.map(x => FXD(x))}`,
                `Camera (${FXD(CAMERA.x)}, ${FXD(CAMERA.y)}, ${FXD(CAMERA.z)})`,
                `Tick ${TCK} Measure ${measure + 1}.${FXD(beat + step + 1,1)}`,
                `Area ${PLAYER.AREA?.map?.(x=>x.NAME).join(", ") || "missing"}`,
                `fps ${FXD(1000 / d,1)} ${FXD(performance.now() - start,3)}`,
            ], ((x, i) => TV.ctx.fillText(x, 16, H1 - 16 - i * 16)));
            TV.IMG(world.FLOOR.CVS,0,0,256,256);
        });
    }
    // END DEBUGGING
    requestAnimationFrame(MAIN);
};
MAIN(0);

// Event handling
const KEYS = { w: 0, a: 0, s: 0, d: 0, get change() { return this.w + this.a + this.s + this.d; }, get MOVE() { let { w, a, s, d } = this; return { w, a, s, d }; } };
ONCE("mousedown", () => {
    PAUSED = false;
    DJ = SOUND();
});

ON("keydown", e => {
    EMIT("input"); // This may not work, depending on the key
    const k = e.key.toLowerCase();
    KEYS[k] = 1;
    EMIT(`key-${k}`);
    if (k === "escape") {
        PAUSED = !PAUSED;
        EMIT("pause");
    }
});
ON("keyup", e => KEYS[e.key.toLowerCase()] = 0);

ON("mousedown", () => EMIT("input"));
ON("mousemove", ({clientX: x, clientY: y}) => PUT(MOUSE,{x,y}));

ON("resize", () => {
    TV.RESIZE(window.innerWidth, window.innerHeight);
    // PUT(TV.REAL, p);
    // PUT(TV.CVS, p);
});
EACH(["visibilitychange","blur"],e=>ON(e,() => {
    PAUSED = true;
    EMIT("pause");
    EACH(Object.keys(KEYS),k=>KEYS[k]=0);
}));

// BEGIN DEBUGGING
// EACH(["mousedown", "mouseup", "mousemove", "keydown", "keyup", "visibilitychange","resize","blur"],
// e=>ON(e,(...x)=>console.log(e,...x)));
// END DEBUGGING

const LISTEN = ($,e,f)=>$.addEventListener(e,f);
EACH(
  ["mousedown", "mouseup", "mousemove", "keydown", "keyup", "visibilitychange"],
  (e) => LISTEN(document, e, (...x) => EMIT(e, ...x))
);
EACH(["resize","blur"],e=>LISTEN(window, e, (...x) => EMIT(e, ...x)));
document.body.appendChild(TV.REAL);

// PLAYER
// CAMERA
// PERSON
// TREE
// BUSH
// GRASS
// PLANT
// FLOWER
// ROCK

// F = forward
// Z = Spiral
// G = forward, no branch
// R = turn right
// L = turn left
// B = Bloom

