// GLOBAL VARIABLES (WHICH CAN BE CHANGED POTENTIALLY)
const KEY = "js13kgames2023-13drums";
let now = 0;
let BPM = 500;
// 288 BEATS (576 TICKS). This is effectively 12 beats (24 ticks) per hour for a 24 hour clock.
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
let step = 0;

let PAUSED = true;
let RATE = 1;
let PXL = 32;
let CAMERABACK = 20;
let CAMERAUP = -2;
let CAMERABACKP = 4;
let CAMERAUPP = -1/8;

// Utilities
const { cos, sin, min, max, sqrt, floor: FLOOR, ceil, round: ROUND, imul, abs, PI, sign: SIGN } = Math;
const STRIPE = (l = 0, fn = x => x) => new Array(l).fill(0).map((x, i) => i).map(fn);
const ROT = ([x, y], a) => [x * cos(a) - y * sin(a), x * sin(a) + y * cos(a)];
const MOVE = ([x, y, z], [w, h, d]) => [x + w, y + h, z + d];
const DIFF = ([x, y, z], [w, h, d]) => [x - w, y - h, z - d];
const FIX = (x, p = 1000) => ROUND(x * p) / p;
// BEGIN DEBUGGING
const FXD = (x,d=3) => x.toFixed(d);
// END DEBUGGING
const OF = (x, y) => x < y ? x / y : 1;
const POF = (val, cap) => max(0, OF(val, cap));
const IN = (x, l, r) => l < x && x < r;
const IS = (x,t) => x instanceof t;
const SORT = (x,fn=(a,b)=>a-b) => x.sort(fn);
const SCALE = ([x, y], s=1) => [x*s, y*s];
const NORM = ([x, y], l=1) => { const m = l / (LEN([x,y]) || 1); return [x*m, y*m]};
const LEN = ([ax, ay], [bx = 0, by = 0] = []) => sqrt((bx - ax) ** 2 + (by - ay) ** 2);
const ZFLOOR = x => x > 0 ? FLOOR(x) : ceil(x);
const ZCEIL = x => x < 0 ? FLOOR(x) : ceil(x);
const ZROUND = x => SIGN(x) * ROUND(abs(x));
const CIRCLE = 2 * PI;
const PIZZA = STRIPE(128, i => (i ? CIRCLE / i : 0));
const PUT = (...x) => Object.assign(...x);
const EACH = (x, f) => x.forEach?.(f);
const MAP = (x, f) => x.map(f);
const SCREENSORT = (a, b) => a.y - b.y || a.z - b.z || a.x - b.x;

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
const WALK = t => [
    (min(2 * t, 0) - (1 - cos(t * CIRCLE))) / 2,
    // min(sin(t * CIRCLE), 0) / 2
    -EIS(-min(sin(t * CIRCLE), 0)) / 2
];
// const WALK = t => _WALK(t);

// randomization
const RANDO = (SEED = 0) => {
    let a = SEED | 0;
    let = fn = () => {
        a = a + 0x9e3779b9 | 0;
        let t = a ^ a >>> 16;
        t = imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = imul(t, 0x735a2d97);
        return ((t = t ^ t >> 15) >>> 0) / 4294967296 * 2;
    };
    return PUT(fn, {
        SEED: (x) => x !== undefined ? a = x | 0 : a,
        INT: (n = 1) => ROUND(fn() * n),
        BIAS: () => 1 - fn() * 2,
        SIGN: () => ZCEIL(fn.BIAS()),
        bit: () => ROUND(fn()),
        bool: () => !!ROUND(fn()),
        SHUFFLE: (x) => x.slice().sort(fn.BIAS),
        PICK: (x) => x[ZFLOOR(fn() * x.length)],
        HWB: (h, hh, w, ww, b, bb) => `hwb(${ROUND(h + fn.BIAS()*hh)} ${ROUND(w + fn.BIAS()*ww)}% ${ROUND(b + fn.BIAS()*bb)}%)`,
        XY: (x,y,s=1) => [x+fn.BIAS()*s,y+fn.BIAS()*s],
        DO: (s, f) => {
            const o = a;
            a = (s ?? a) | 0;
            f();
            a = o;
            return s ?? o;
        },
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

// BEGIN DEBUGGING
let DEBUG = false;
ON("key-i",()=>DEBUG=!DEBUG);
// END DEBUGGING


// MUSIC ========================================
let DJ = 0;
const SONG = (n = 0, o = 0, b = 16) => { // noteCount, offsetNotes, baseNotes
    let m = n ? b / n : 0;
    return SORT(STRIPE(n, x => FLOOR((x * m) + o + b) % b));
};
const CM = SONG(7,2,12);
const THIRD = 32 / 27;
const Q = STRIPE(51,x=>440*2**((x-36)/12)).filter((x,i)=>CM.includes(i%12)).slice(2);
const MERGE = (a, b=[]) =>SORT([...new Set([...a,...b])]);
const SOUNDTRACK = () => {
    let a = Q.slice(1,14);
    return [
        [Q[0], 0.3, 0, [0, 3, 8, 11, 14]],
        ...STRIPE(13, (i) => {
            let q = rand.PICK(a);
            a = a.filter(x => x !== q);
            return [q, 0.05 + (rand() * 0.15), rand.BIAS(), SONG(1 + rand.INT(), rand.INT(15))];
        })
    ];
};
const MELODY = () => [Q[15], ...rand.SHUFFLE(Q.slice(16))].slice(0, 8);

const AAH = (c, d, q, v, a, t, w = 6) => {//context, frequency, volume, angleOfPan, timeToPlay
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
    p.connect(d);
    o.start(t);
    o.stop(t + 2);
};

const BEAT = (c, d, q, v, a, t, l, b) => {//context, frequency, volume, angleOfPan, timeToPlay, levelOverride, balanceOverride
    let o = c.createOscillator();
    let g = c.createGain();
    let p = c.createStereoPanner();
    let s = c.createDynamicsCompressor();
    let w = FIX(l || v);
    o.frequency.setValueAtTime(q, t);
    o.frequency.exponentialRampToValueAtTime(q / 1.5, t + 0.5);
    // o.frequency.exponentialRampToValueAtTime(q / 1.25, t + 0.5);
    g.gain.setValueAtTime(0.01, t);
    g.gain.exponentialRampToValueAtTime(w, t + 1/32);
    g.gain.exponentialRampToValueAtTime(w / 5, t + 1/16);
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
    s.connect(d);
    o.start(t);
    o.stop(t + 0.51);
};

const RATTLE = (c, d, q, a = 0, t) => {//context, frequency, volume, angleOfPan, timeToPlay, levelOverride, balanceOverride
    // let q = rand.PICK(Q.slice(1,6))*2;
    let v = 0.04 + rand() * 0.03;
    let x = 1/8 + rand()/16;
    const o = c.createOscillator();
    const g = c.createGain();
    const p = c.createStereoPanner();
    o.type = "triangle";
    o.frequency.setValueAtTime(q, t);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(v/2, t + 1/32);
    g.gain.linearRampToValueAtTime(0, t + x);
    p.pan.setValueAtTime(a, t);
    o.connect(g);
    g.connect(p);
    p.connect(d);
    o.start(t);
    o.stop(t + x);
};

const SOUND = () => {
    const c = new AudioContext();

    const d = c.createAnalyser();
    d.connect(c.destination);
    d.fftSize = 256;
    const bl = d.frequencyBinCount;
    const data = new Uint8Array(bl);

    let o = -FIX(D / 4000, 10) % 1;
    let n = o;
    let voices = [0];
    let track = [];
    let melody = [];
    let tq = null;
    let mq = null;
    let FRESH = (t = SOUNDTRACK(), m = MELODY()) => {
        tq = t;
        mq = m;
    };
    let play = () => {
        const m = c.currentTime;
        if (m + 0.25 < n || n < 0) { return; }
        if (tq) { track = tq; tq = null }
        if (mq) { melody = mq; mq = null }
        AAH(
            c,
            d,
            (melody[7 - (beat + measure % 8)%8] || Q[rand.INT(6)] * 2) / 2,
            0.2,
            rand.BIAS() * 0.5,
            n,
            FLOOR((n - o)) % 3 + 4
        );
        EACH(voices, i => {
            const [q, v, a, p] = track[i];
            EACH(p, b => BEAT(c, d, q, FIX(v), a, b * 0.25 + n))
        });
        n += 4;
    };
    setInterval(play, 100);
    ON("RATTLE", (a = 0) => {
        RATTLE(
            c,
            d,
            (melody[beat] || Q[15])/2,
            typeof a === "number" ? a : 0,
            c.currentTime
        );
    });
    ON("BEAT", () => {
        const [q, v, a, p] = track[0];
        BEAT(c, d, Q[14], v, a, c.currentTime);
    });
    ON("AAH", () => AAH(c, d, (melody[7 - (beat + measure % 8)%8] || Q[0]) * 2, 0.3, rand.BIAS() * 0.5, c.currentTime, 6));
    ON("pause", () => {
        if (c.state === "running" && PAUSED) {
            c.suspend();
        } else if (c.state === "suspended" && !PAUSED) {
            c.resume();
        }        
    });
    FRESH();
    return {
        FRESH,
        n,
        get track() { return track; },
        get voices() { return voices; },
        get melody() { return melody; },
        get DATA() {
            d.getByteFrequencyData(data);
            return Array.from(data).slice(0,bl/2);
        },
        SING: (x = [], m) => {
            voices = MERGE([0, ...x]);
            melody = m || melody
        },
    };
};

// GRAPHICS =====================================
SCREEN = ({
    WIDTH = min(1920, window.innerWidth),
    HEIGHT = min(1080, window.innerHeight),
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
    S.R = (a) => { ctx.rotate(a); return S; }
    S.RR = (...p) => { ctx.roundRect(...p); return S; }
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
    S.IMG = (...p) => { ctx.drawImage(...p); return S; };
    S.E();
    S.DRAW = (e,i) => e.DRAW(S,i);
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
        get IMG() { return sc.CVS; },
        DRAW(tv) {
            tv.IMG(sc.CVS,0,0,R*2,R*2)
        }
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
// const YS = STRIPE(1280, (i) => (4 / ((i + 1) / 10)) * 5).reduce((m,x,i) => (m.set((i+1)/10, x)),new Map());

MAKE("ENT", [
    ["x", 0],
    ["y", 0],
    ["z", 0],
    ["AGE", 0],
    ["AREA", []],
    ["SEED",null],
    ["WIDTH",0],
    ["HEIGHT",0]
], {
    COPY() { return new this.constructor(...this) },
    MOVE(x) { [this.x, this.y, this.z] = MOVE(this,x); return this },
    ROT(x) { [this.x, this.y] = ROT(this, x); return this },
    DIFF(x) { return new ENT(...DIFF(this, x)) },
    POS() { return MAP([this.x,this.y,this.z],ROUND) },
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
        const s = this.WIDTH === 1 ? 1 : 2;
        const m = a ? -PXL * s * ys : 0;
        return new ENT(x + TV.W2, y + TV.H2 + m, s * ys * (a ? PXL : 1));
    },
    CLICKAREA() {
        const [x,y,z] = this.PROJECT();
        return PATH().A(x,y,abs(z)).C();
    },
    UPDATE(){},
    THINK(){},
    DRAW(){},
    CAN(){},
    INTERACT(){},
}, "Array");

MAKE("TASK", [
    ["TCK", 0],
    ["CHANGES", {}],
    ["TARGET",null],
    ["START", null],
    ["STOP", null],
    ["UPDATE",null]
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
    ["MAXINVENTORY", 0],
    ["DRUMS", []],
    ["LASTSTEP", 0],
    ["PROJECTED",[0,0,0]],
], {
    ENERGY() { return this.SPEED ? abs(this.SPEED) : 0 },
    STEPPED() { let x = this.MOVED % 1; x *= this.MOMENTUM.LEN?.() || IN(x, 1/32,31/32) ? 1 : 0; return (this.DIRECTION < 0 ? 1 - x : x) % 1 },
    CYCLE() { return this.STEPPED() ? OF(this.STEPPED() % 0.5, 0.5) % 1 : 1 - (bar % 0.5 * 2) % 1 },
    UPDATE(_) {
        let t = min(1,_/ 1000);
        let { w, a, s, d } = this;
        const begx = ROUND(this.x)+128,
            begy = ROUND(this.y)+128;
        const tasks = this.SCHEDULE.filter(x => x.TCK <= TCK);
        if (tasks.length) {
            EACH(tasks, x => {
                x.START = x.START || x.TCK;
                // console.log(`Executing task for ${this.constructor.name}`, x);
                if (x.TARGET) {
                    // const delta = LEN(this, x.TARGET);
                    // const towards = x.TARGET.DIFF(this);
                    if (LEN(this, x.TARGET) > 1/16) {
                        x.TCK = TCK;
                        const d = NORM(DIFF(x.TARGET, this), 1);
                        let [dw, dh] = d.map(abs);
                        // console.log(`${LEN(this, x.TARGET)} to target`, this.POS(), x.TARGET, d, dw, dh);
                        // let dw = OF(abs(this.x - x.TARGET.x), 1);
                        // let dh = OF(abs(this.y - x.TARGET.y), 1);
                        // dw = OF(dw, 1) > 3/8 ? dw : 0;
                        // dh = OF(dh, 1) > 3/8 ? dh : 0;
                        PUT(x.CHANGES,
                            d[0] < 0 ? { a: dw, d: 0 } : { a: 0, d: dw },
                            d[1] < 0 ? { w: dh, s: 0 } : { w: 0, s: dh })
                        // console.log({ p: this.POS(), t: x.TARGET, dw, dh, ...x.CHANGES });
                    } else {
                        // console.log(`Stopping TASK`, x, LEN(this, x.TARGET));
                        x.STOP = x.TCK;
                        x.CHANGES = {w:0,a:0,s:0,d:0};
                        // this.SCHEDULE.push(new TASK(TCK + 1, IDLE, null) ,new TASK(TCK + 12, IDLE, null)); // IDLE TO STOP THINKING
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
            this.SCHEDULE = this.SCHEDULE.filter(x => !x.STOP || x.STOP > TCK || x.TCK > TCK);
        } else {
            PUT(this,{w:0,a:0,s:0,d:0});
        }
        this.INPUT = new ENT(d-a, s-w, 0);

        // TODO: check INPUT to ensure it puts us inside of our AREA and adjust if needed
        this.DIRECTION = SIGN(this.INPUT.x || this.DIRECTION);
        this.ORIENTATION = SIGN(this.INPUT.y || this.ORIENTATION);
        const move = new ENT(...this.INPUT);
        const momentum = new ENT(...this.MOMENTUM);
        const c = this.CYCLE();
        if (move.LEN() === 0 && IN(momentum.LEN(), 1/16, c)) {
            move.MOVE(new ENT(...this.TURNING).NORM(((1 - c) / 2)));
        }
        move.NORM(t*4);
        if (this.INPUT.LEN()) {
            const s = 0.75 + OF(move.COPY().NORM(2).MOVE(momentum.COPY().NORM(1)).LEN(), 3) / 4;
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
        let endx = ROUND(this.x+adjust.x)+128,
        endy = ROUND(this.y+adjust.y)+128;
        // if (endx < 0 || endx > 255 || endy < 0 || endy > 256) {
        //     console.log(`Bad end of movement`, endx, endy, this);
        //     return;
        // }
        if (begx !== endx || begy !== endy) {
            const o = world.GRID[endy][endx];
            if (o && o !== this) {
                adjust.SCALE(-0.1);
                endx = ROUND(this.x+adjust.x)+128, endy = ROUND(this.y+adjust.y)+128
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
            this.MOVED = ROUND(this.MOVED * 2) / 2;
        }
        if (this === PLAYER) {
            const s = FLOOR(this.MOVED / 0.25);
            if (s > this.LASTSTEP) {
                EMIT("RATTLE", this.TURNING.x/-2);
            }
            this.LASTSTEP = s;
        }
        // this.PROJECTED = this.PROJECT();
    },
}, "ENT");

const SHELL = ({ DIAM = 512, DRUMS = [] } = {}) => {
    const sc = TILE(DIAM),
        R = DIAM / 2,
        r = DIAM / 12,
        S = {
            SHELL:1,
            R, DIAM, DRUMS,
            DRAW: (tv = sc, i) => {
                tv.DO(() => {
                    let z = r * 5.6;
                    if (i) {
                        tv.IMG(sc.CVS,0,0,64,64);
                        return;
                    }
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
                        // i < 10
                        // ? new AREA()
                        //     .GENERATE(18)
                        //     .MOVE([80, 0, 0])
                        //     .ROT(PIZZA[10] * (i + 2.5))
                        // : new AREA().GENERATE(18).MOVE([0, (i - 11) * r * 2.5, 0])
                        if (i < 10) {
                            const a = PIZZA[10] * (i + 2.5);
                            [x, y] = ROT([r * 4.5, 0], a)
                        }
                        sc.P().A(x, y, r).C().F("rgba(127,127,127,0.25)");
                        if (DRUMS[i]) {
                            // TODO: drum image
                            sc.P().A(x, y, r).C().F("#aa9");
                        }
                    });
                })
                return S;
            },
            ADD(drum) {
                DRUMS[world.DRUMS.indexOf(drum)] = 1;
                S.DRAW();
                return S;
            },
            get IMG() { return sc.CVS; },
        };
    S.DRAW();
    return S;
};

// const RECORD = [];
const PERSONPATH = new Map();
MAKE("PERSON",[
    ["HOME",null],
    ["COLOR", () => `hwb(${ROUND(30 + rand.BIAS()*10 - 2)} ${ROUND(0 + rand()*10)}% ${ROUND(47 + rand()*10)}%)`],
    ["STROKE", () => `hwb(${ROUND(30 + rand.BIAS()*2 - 2)} 0% ${ROUND(67 + rand()*4)}%)`],
    ["READY", 0],
    ["NEEDS", []],
    ["WANTS", []],
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
    DRAW(tv, i) {
        const cycle = bar % 0.5 * 2;
        tv.DO(() => {
            if (i) {
                tv.T(32,64).S(16,16);
            } else {
                this.PREP(tv);
            }
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
                    // if (this === PLAYER) { tv.F("#554"); }
                    tv.W("#242", 1 / 16);
                    tv.T(0 - hx*xs / 2, -1.75 - hy / 2 + S16);
                    tv.R(this.MOMENTUM[0] / 16);
                    // tv.IMG(this === PLAYER ? world.MAP.CVS : shell.IMG, -1, -1, 2, 2);
                    // if (this === PLAYER) {
                    //     let [x, y] = MAP(PLAYER.POS(),x=>x/128)
                    //     tv.P().A(x, y, 1/32).C().F(this.COLOR);
                    // }
                    tv.IMG(shell.IMG, -1, -1, 2, 2);
                });
            }
            if (this.INVENTORY.length && this !== PLAYER) {
                tv.DO(_=>{
                    tv.T(-1,-7).S(1/32,1/32).P().RR(0,0,64,64,8).C().F("#fff2")
                        .DRAW(this.INVENTORY[0], true);
                })
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
    },
    THINK() {
        if (!this.HOME) {
            this.HOME = this.POS();
        }
        if (!this.READY) { return; } // Don't do anything until your needs are met.
        if (!this.SCHEDULE?.length) {
            const t = TCK % 576;
            const d = TCK - t;

            const a = this.AREA[0];10
            const m = DIFF(a, this);
            const l = LEN(m);
            this.SCHEDULE = [
                // The "Breakfast Run" is cool and all but it's not really necessary
                // PUT(new TASK(), { TCK: d+16 + rand.INT(16), TARGET: MOVE(NORM(m, -2), a) }),
                // PUT(new TASK(), { TCK: d+64 + rand.INT(16), TARGET: this.HOME }),
                PUT(new TASK(), { TCK: d+288 + rand.INT(16), TARGET: MOVE(SCALE(m, (l-2)/l), this) }),
                PUT(new TASK(), { TCK: d+528 + rand.INT(16), TARGET: this.HOME }),
                PUT(new TASK(), { TCK: d+575 })
            ].filter(x=>x.TCK >= TCK);
        }
    },
    CAN(e) {
        return this !== e
            && this.DIFF(e).LEN() <= 4
            && (
                (!this.READY && !this.NEEDS.length) // Ready to go to the drum circle
                || this.NEEDS.find(x=>e.INVENTORY.find(y=>IS(y,x))) // Needs something the player has
                || (this.READY && this.WANTS.find(x=>e.INVENTORY.find(y=>IS(y,x)))) // Is ready and wants something the player has
            );
    },
    INTERACT(e) {
        const NEEDS = MAP(this.NEEDS, x=>e.INVENTORY.find(y=>IS(y,x))).filter(x=>x);
        console.log("Interaction needs", NEEDS)
        if (NEEDS.length) {
            // const d = this.NEEDS.filter(x=>NEEDS.find(y=>IS(y,x)));
            e.INVENTORY = e.INVENTORY.filter(x=>!NEEDS.includes(x));
            this.NEEDS = this.NEEDS.filter(x=>!NEEDS.find(y=>IS(y,x)));
            this.INVENTORY = this.INVENTORY.filter(x=>this.NEEDS.find(y=>IS(x,y)));
        }
        if (!this.READY && !this.NEEDS.length) {
            EMIT("AAH");
            this.READY = 1;
            const a = this.AREA[0];10
            const m = DIFF(a, this);
            const l = LEN(m);
            this.SCHEDULE.push(PUT(new TASK(), { TCK: TCK + 1 + rand.INT(8), TARGET: MOVE(SCALE(m, (l-2)/l), this) }));
        }
    }
},"ACT");

MAKE("ANIMAL",[["HOME",null],["ALIVE",1]],{
    THINK() {
        if (!this.HOME) {
            this.HOME = this.POS();
        }
        if (!this.ALIVE) { return; } // Don't do anything until your needs are met.
        if (!this.SCHEDULE?.length) {
            const t = TCK % 576;
            const d = TCK - t;

            const a = this.AREA[0];
            const m = this.DIFF(a);
            const l = LEN(m);
            const r = PIZZA[14];
            const s = 588/14;
            this.SCHEDULE = STRIPE(14,
                i => PUT(new TASK(), {
                    TCK: d+i*s+rand.INT(4),
                    STOP: d + i*s + s-1,
                    TARGET: m.COPY().ROT(r*(i+rand()/8)).MOVE(a)
                })
            ).filter(x=>x.TCK >= TCK);
        }
        return this;
    },
},"ACT")

MAKE("PLANT",[
    ["TV",null],
    ["NEXT",0]
],{
    DRAW(tv, i) {
        if (!this.TV) { return; }
        if (!i) {
            tv.DO(() => {
                this.PREP(tv);
                tv.IMG(this.TV.CVS,-this.WIDTH/2, -this.HEIGHT, this.WIDTH * 4, this.HEIGHT * 4);
            });
        } else {
            tv.IMG(this.TV.CVS,0,0,64*4,64*4);
        }
        return this;
    },
    CAN(e) {
        return this.AGE > 2 && this.DIFF(e).LEN() <= 4 && e.INVENTORY.length < e.MAXINVENTORY;
    },
    UPDATE(_) {
        this.NEXT = this.NEXT || 4 + rand.INT(284);
        if (TCK >= this.NEXT && this.AGE < this.MAX) {
            this.GENERATE(this.AGE + (rand()+1) / 8);
            this.NEXT = TCK + 576;
        }
    },
},"ENT");

MAKE("DEER", [], {
    DRAW(tv, i) {
        tv.DO(() => {
            if (i) {
                tv.T(32,64).S(16,16);
            } else {
                this.PREP(tv);
            }
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
    },
    CAN(e) {
        return this.DIFF(e).LEN() <= 4
            && e.DRUMS?.find(d=>IS(d.ICON,SPEAR))
            && e.INVENTORY.length < e.MAXINVENTORY;
    },
    INTERACT(e) {
        // TODO: Remove from the grid and schedule respawn
        this.SCHEDULE.length=0;
        this.ALIVE = 0;
        e.INVENTORY.push(new DEER());
        EMIT("beat");
    },
}, "ANIMAL");

MAKE("BISON", [], {
    DRAW(tv, i) {
        tv.DO(() => {
            if (i) {
                tv.T(32,64).S(16,16);
            } else {
                this.PREP(tv);
            }
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
                .W("#620", 1 / 8)
                .F("#840")
            tv.P()
                .A(2, -2.25 + ly / 4, 3/4, PIZZA[2], PIZZA[2]+PIZZA[7]) // horn
                .W("#620", 0.125);

        });
    },
    CAN(e) {
        return this.DIFF(e).LEN() <= 4
            && e.DRUMS?.find(d=>IS(d.ICON,SPEAR))
            && e.INVENTORY.length < e.MAXINVENTORY;
    },
    INTERACT(e) {
        // TODO: Remove from the grid and schedule respawn
        this.SCHEDULE.length=0;
        this.ALIVE = 0;
        e.INVENTORY.push(new BISON());
        EMIT("beat");
    },
}, "ANIMAL");

MAKE("MOON", [
    ["PHASE", 0],
    ["RADIUS", 32],
    ["COLOR","#ccf"],
    ["STROKE","#ccf4"]
], {
    DRAW(tv, i) {
        tv.DO(() => {
            const { PHASE, RADIUS } = this;
            if (i) { tv.T(RADIUS,RADIUS)}
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
    ["COLOR", () => `hwb(${120 + rand.INT(25)} ${10 + rand.INT(5)}% ${ROUND(65 + rand.INT(5))}%)`],//"#800"],
    // BEGIN DEBUGGING
    ["NAME", "area"],
    // END DEBUGGING
    ["RADIUS", 16],
    ["POINTS", []],
    ["ENTITIES", []],
    ["LANDSCAPE",[]],
    // ["VISIBLE", 0],
    // ["DEBUG",null],
    ["SOUNDTRACK",null],
    ["MELODY",null],
], {
    GENERATE(r = 16) {
        this.RADIUS = r;
        const offset = rand();
        this.POINTS = STRIPE(16, x => new ENT(0, -r, 0).ROT(PIZZA[16] * (x + rand()/4)));
        // EACH(this.POINTS,SLOPE)
        return this
    },
    UPDATE(_) {
        // const _r = this.RADIUS + 1;
        // const [l] = new ENT(-_r, -_r, 0).MOVE(this).PROJECT();
        // const [r] = new ENT(_r, -_r, 0).MOVE(this).PROJECT();
        // this.VISIBLE =  r <= 0 || l >= TV.W1 ? 0 : 1;
        EACH(this.LANDSCAPE,x=>x.UPDATE(_));
    },
}, "ENT");

MAKE("WOOD", [["TV",null]],{
    DRAW(tv) {
        if (!this.TV) {
            this.TV = SCREEN({ WIDTH:64, HEIGHT:64 }).P()
                .M(...rand.XY(1,28)).L(...rand.XY(24,24)) // top left
                .L(...rand.XY(21,12)).L(...rand.XY(31,11)).L(...rand.XY(33,23)) // nub
                .L(...rand.XY(47,14)).L(...rand.XY(53,21)).L(...rand.XY(61,31)).L(...rand.XY(52,44)) // right curve
                .L(...rand.XY(42,47)).L(...rand.XY(43,43)).L(...rand.XY(39,48)).L(...rand.XY(16,57)) // bottom with cut
                .L(...rand.XY(9,54)).L(...rand.XY(3,42)).C() // right side
                .F(rand.HWB(15,2, 17,2, 68,4));
        }
        tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    }
},"ENT");

MAKE("PINE",[
    ["COLOR", () => rand.HWB(150,2, 10,6, 80,4)],
    ["MAX",8]
], {
    GENERATE(_){
        this.SEED = rand.DO(this.SEED,() => {
            const a = min(this.MAX, this.AGE = _ || this.AGE || rand()*4+3);
            const t = ceil(a);
            let b = 0, mw = 0, x = 0;
            const path = STRIPE(t, i => {
                const s = (a - i) / (a - i + 3);
                const p = b - s / 0.125;
                const w = s * (t-i);
                const h = b + s + 0.5;
                const c = OF(a-i,t);
                const n = FIX(rand.BIAS()*c*s/2);
                mw = max(w, mw);
                const r = `M ${n} ${FIX(p)} L ${FIX(-w)} ${FIX(h)-rand()*c} L ${FIX(x)} ${FIX(b+0.25)} L ${FIX(w)} ${FIX(h)-rand()*c} L ${n} ${FIX(p)}`;
                x = n;
                b = p;
                return r;
            }).join(" ") + ` F ${this.COLOR}`; //" F #243 W #132 0.0625";
            this.WIDTH = ceil(mw*2);
            this.HEIGHT = ceil(abs(b));
            this.TV = TILE(this.WIDTH * PXL * 4, this.HEIGHT * PXL * 4)
                .DO((tv) => tv.S(PXL,PXL).T(this.WIDTH/2,this.HEIGHT).P(path));
        });
        return this;
    },
    CAN(e) {
        return this.AGE > 2
            && this.DIFF(e).LEN() <= 4
            && e.DRUMS?.find(d=>IS(d.ICON,HATCHET))
            && e.INVENTORY.length < e.MAXINVENTORY;
    },
    INTERACT(e) {
        e.INVENTORY.push(new WOOD());
        this.GENERATE(this.AGE -= 1);
        EMIT("beat");
    },
}, "PLANT");

MAKE("FLOWER",[
    ["TV", null],
    ["PHASE", 0],
    // ["COLOR",() => `hwb(${ROUND(180 + rand.BIAS()*4)} ${ROUND(30 + rand()*5)}% ${ROUND(55 + rand.BIAS()*4)}%)`],
    ["COLOR",() => rand.HWB(180,4, 33,3, 55,4)],
    ["LAST", -1],
    // ["WIDTH", 4],
    // ["HEIGHT", 4],
    ["BLOOM",0]
], {
    GENERATE(){
        const b = this.BLOOM;
        this.WIDTH=4;
        this.HEIGHT=4;
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
            .F(`hwb(${ROUND((180/28 * this.PHASE + 240 + rand.BIAS()/4)%360)} ${ROUND(10 + rand()*25)}% 5%)`)
            if (this.BLOOM) {
                // const m = PUT(new MOON(),{RADIUS:10,PHASE:this.PHASE,COLOR:"#fff",STROKE:"#000a"});
                const m = PUT(new MOON(),{RADIUS:10,PHASE:this.PHASE,COLOR:"#ccf",STROKE:"#000a"});
                // ccf
                tv.O(0.5).T(xo*1.25, Y).S(1/16,1/16);
                m.DRAW(tv);
            }
        });
        return this;
    },
    DRAW(tv, i) {
        if (!this.TV) { return; }
        if (!i) {
            tv.DO(() => {
                this.PREP(tv);
                tv.IMG(this.TV.CVS,-this.WIDTH/2, -this.HEIGHT, this.WIDTH * 4, this.HEIGHT * 4);
            });
        } else {
            tv.IMG(this.TV.CVS,0,0,64*4,64*4);
        }
        return tv;
    },
    UPDATE(d, _p, _h) {
        const p = _p ?? moon?.PHASE, h = _h ?? HOUR;
        if (p !== this.LAST && h >= 0.5 && !this.BLOOM) {
            this.LAST = p;
            // const b = (p + 28 - this.PHASE)%28 < 3;
            // this.BLOOM = b;
            this.BLOOM = 1 * (( moon?.PHASE ?? -1) === this.PHASE);
            this.GENERATE();
        }
        return this;
    },
    CAN(e) {
        return this.BLOOM && this.DIFF(e).LEN() <= 2 && e.INVENTORY.length < e.MAXINVENTORY;
    },
    INTERACT(e) {
        // console.log("FLOWER INTERACT");
        const f = PUT(this.COPY(), { TV: null });
        e.INVENTORY.push(f.GENERATE());
        this.BLOOM = 0;
        this.GENERATE();
        EMIT("AAH");
    }
}, "ENT");

MAKE("GRASS",[
    ["COLOR", () => rand.HWB(120,2, 20,2, 67,2)],
    ["MAX",4]
], {
    GENERATE(_){
        this.SEED = rand.DO(this.SEED,() => {
            const a = min(this.MAX, this.AGE = _ || this.AGE || rand()*3+1);
            const t = ceil(a);
            const l = 6*t+1;
            const path = `M 2 0 ` + STRIPE(l, i => {
                const c = (i+0.5)/l*PI;
                const o = i%2;
                return `L ${FIX(cos(c)*2 + (o ? rand.BIAS()/8 : 0))} ${o ? FIX(sin(c) * -a*2 + rand.BIAS()/2) : -0.5}`
            }).join(" ") + ` L -2 0 C F ${this.COLOR}`; //  W #1324 0.0625`;
            this.WIDTH = 4;
            this.HEIGHT = t*2;
            this.TV = SCREEN({ WIDTH: this.WIDTH * PXL * 4, HEIGHT: this.HEIGHT * PXL * 4, os: true });
            this.TV.DO((tv) => tv.S(PXL,PXL).T(this.WIDTH/2,this.HEIGHT).P(path));    
        });
        return this;
    },
    INTERACT(e) {
        e.INVENTORY.push(PUT(new GRASS().GENERATE(1),{AGE:1})) ;
        this.GENERATE(this.AGE -= 1);
        EMIT("BEAT");
    }
}, "PLANT");

MAKE("BASKET", [["TV",null]],{
    DRAW(tv) {
        if (!this.TV) {
            this.TV = SCREEN({ WIDTH:64, HEIGHT:64 }).P()
                .M(...rand.XY(2,32))//top left of bowl
                .B(0,64, 0,64, ...rand.XY(16,62))//left side of bowl
                .L(...rand.XY(48,62))//bottom of bowl
                .B(64,64, 64,64, ...rand.XY(62,32))//right side of bowl
                .L(...rand.XY(48,32)).L(...rand.XY(48,12))//outside turn of right handle
                .L(32,12).L(32,16) // inside turn of right handle
                .L(...rand.XY(44,16)).L(...rand.XY(44,32))//inside of right handle
                .L(...rand.XY(20,32)).L(...rand.XY(20,16)) // inside of left handle
                .L(32,16).L(32,12) // inside turn of left handle
                .L(...rand.XY(16,12)).L(...rand.XY(16,32))//outside turn of left handle
                .C()
                .F(rand.HWB(42,2, 16,2, 53,4))
                .P()
                .M(...rand.XY(14,38)).L(...rand.XY(28,58))
                .M(...rand.XY(36,38)).L(...rand.XY(50,58))
                .M(...rand.XY(52,38)).L(...rand.XY(38,58))
                .M(...rand.XY(30,38)).L(...rand.XY(16,58))
                .W("#4404", 2);
        }
        tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    }
},"ENT");

MAKE("EAR", [["TV",null]],{
    DRAW(tv) {
        if (!this.TV) {
            this.TV = SCREEN({ WIDTH:64, HEIGHT:64 }).DO(tv=>{
                const t = rand.XY(32,2,2);
                const g = rand.HWB(105,2, 12,2, 65,2);
                tv.P()
                    .M(...t)
                    .B(60,4, 64,60, ...rand.XY(32,60,2))
                    .B(0,60, 4,4, ...t)
                    .F(rand.HWB(70,2, 25,2, 15,2))
                    .P()
                    .M(...rand.XY(32,6,2)).L(...rand.XY(32,50,2))
                    .M(...rand.XY(16,16,2)).L(...rand.XY(48,16,2))
                    .M(...rand.XY(16,32,2)).L(...rand.XY(48,32,2))
                    .M(...rand.XY(16,48,2)).L(...rand.XY(48,48,2))
                    .W("#641", 1)
                    .P().M(32,64)
                    .B(...rand.XY(26,24), ...rand.XY(16,24), ...rand.XY(2,14))
                    .B(...rand.XY(8,64), ...rand.XY(4,54), 32,64)
                    .B(...rand.XY(38,24), ...rand.XY(48,24), ...rand.XY(62,14))
                    .B(...rand.XY(56,64), ...rand.XY(56,54), 32,64)
                    .F(g);
            });
        }
        tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    }
},"ENT");

MAKE("CORN", [
    ["COLOR", () => rand.HWB(105,2, 12,2, 65,2)],
    ["MAX",4],
    ["EARS",[]]
],{
    GENERATE(_){
        this.SEED = rand.DO(this.SEED,() => {
            const f = rand.SIGN();
            const a = min(this.MAX, this.AGE = _ || this.AGE || rand()*3+1);
            this.EARS.length = 0;
            this.EARS.push(...STRIPE(max(0,FLOOR(a - 1)), _=>new EAR()));
            const h = min(a,3) * 2;
            this.WIDTH = 4;
            this.HEIGHT = ROUND(h+2);
            this.TV = TILE(this.WIDTH*PXL*4, this.HEIGHT*PXL*4).DO(tv=>{
                tv.S(PXL,PXL).T(2,this.HEIGHT)
                    .P().M(0,-h).L(0,-1/8)
                    .W(this.COLOR, 1/4);
                    STRIPE(3, i=>tv.DO(t=>{
                        if (i === 0) {
                            tv.T(0,-h).R(rand.BIAS()/8);
                        } else {
                            tv.T(0,-h/2+rand.BIAS()/2).R(f*SIGN(1.5-i)*PIZZA[7]);
                        }
                        const e = this.EARS[i];
                        if (e) {
                            if (i===0) {
                                tv.T(-1,-1);
                            } else {
                                tv.T(-1,-2);
                            }
                            tv.S(1/PXL,1/PXL).DRAW(e, true);
                        } else {
                            tv.P().M(0,0)
                            .B(-1/2,-1/2, -1/2,-1/2, 0,-1)
                            .B(1/2,-1/2, 1/2,-1/2, 0,0)
                            .C().F(this.COLOR)
                        }
                    }));
            });
        });
        return this;
    },
    INTERACT(e) {
        e.INVENTORY.push(this.EARS.pop());
        this.GENERATE(this.AGE -= 1);
        EMIT("BEAT");
    }
},"PLANT");

MAKE("STICK", [["TV",null]],{
    DRAW(tv) {
        if (!this.TV) {
            this.TV = SCREEN({ WIDTH:64, HEIGHT:64 }).P()
                .M(...rand.XY(2,58)).L(...rand.XY(4,61)) // bottom left
                .L(...rand.XY(61,9)).L(...rand.XY(58,6)) // top right
                .C().F(rand.HWB(15,2, 17,2, 68,4)).P()
                .M(...rand.XY(7,4)).L(...rand.XY(7,8)) // top left
                .L(...rand.XY(58,61)).L(...rand.XY(61,58)) // bottom right
                .L(...rand.XY(18,18)).L(...rand.XY(20,12)) // the nub
                .L(...rand.XY(18,10)).L(...rand.XY(16,16))
                .C().F(rand.HWB(15,2, 17,2, 68,4));
        }
        tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    }
},"ENT");

MAKE("BUSH",[
    ["COLOR", () => rand.HWB(105,2, 12,2, 65,2)],
    ["MAX",4]
], {
    GENERATE(_){
        this.SEED = rand.DO(this.SEED,() => {
            const a = min(this.MAX, this.AGE = _ || this.AGE || rand()*3+1);
            const t = ceil(a);
            const l = 2*t+1;
            const path = `M 2 0 ` + STRIPE(l, i => {
                const c = (i+0.5)/l*PI;
                return `L ${FIX(cos(c)*2.75 + rand.BIAS()/2)} ${FIX(sin(c) * -a + rand.BIAS()/4)}`
            }).join(" ") + ` L -2 0 C F ${this.COLOR} W #1324 0.125`; //" F #243 W #132 0.0625";
            this.WIDTH = 6;
            this.HEIGHT = t*2;
            this.TV = SCREEN({ WIDTH: this.WIDTH * PXL * 4, HEIGHT: this.HEIGHT * PXL * 4, os: true });
            this.TV.DO((tv) => tv.S(PXL,PXL).T(this.WIDTH/2,this.HEIGHT).P(path));    
        });
        return this;
    },
    INTERACT(e) {
        e.INVENTORY.push(new STICK());
        this.GENERATE(this.AGE -= 1);
        EMIT("BEAT");
    },
}, "PLANT");

MAKE("ROCK",[
    ["TV",null],
    ["COLOR", () => rand.HWB(32,3, 37,4, 55,4)]
], {
    GENERATE(){
        this.SEED = rand.DO(this.SEED,() => {
            this.TV = TILE(64)
                .P().M(...rand.XY(4,60, 3)).L(...rand.XY(9,32, 4))
                .L(...rand.XY(16,16, 7)).L(...rand.XY(32,20, 8)).L(...rand.XY(48,16, 6))
                .L(...rand.XY(53,32, 4)).L(...rand.XY(60,60, 3))
                .L(57,64).L(7,64).C().F(this.COLOR).W("#332", 1);
            this.WIDTH = 1;
            this.HEIGHT = 1;
            // this.PATH = `M 2 0 ` + STRIPE(7, i => {
            //     const c = (i+0.5)/7*PI;
            //     return `L ${FIX(cos(c)*2.75 + rand.BIAS()/2)} ${FIX(-sin(c) + rand.BIAS()/2)}`
            // }).join(" ") + ` L -2 0 C F ${this.COLOR} W #1114 0.125`; //" F #243 W #132 0.0625";
            // this.TV.DO((tv) => tv.S(PXL,PXL).T(this.WIDTH/2,this.HEIGHT).P(this.PATH));    
        });
        return this;
    },
    DRAW(tv, i) {
        if (!this.TV) { this.GENERATE(); }
        if (!i) {
            tv.DO(() => {
                this.PREP(tv);
                tv.IMG(this.TV.CVS,-this.WIDTH/2, -this.HEIGHT, this.WIDTH, this.HEIGHT);
            });
        } else {
            tv.IMG(this.TV.CVS,0,0,64,64);
        }
        return this;
    },
    CAN(e) {
        return this.DIFF(e).LEN() <= 4 && e.INVENTORY.length < e.MAXINVENTORY; // TODO: Inventory check first?
    },
    INTERACT(e) {
        e.INVENTORY.push(this);
        const [x,y]=this.POS();
        world.GRID[y+128][x+128]=null;
        const e1 = this.AREA[0].ENTITIES;
        const e2 = world.ENTITIES;
        e1.splice(e1.indexOf(this), 1);
        e2.splice(e2.indexOf(this), 1);
        EMIT("BEAT");
    }
}, "ENT");

// MAKE("MEDICINE", [
//     ["COLOR", () => rand.HWB(123,6, 20,4, 30,4)],
//     ["MAX",4]
// ],{
//     GENERATE(_){
//         this.SEED = rand.DO(this.SEED,() => {
//             const a = min(this.MAX, this.AGE = _ || this.AGE || rand()*3+1);
//             const h = a * 2;
//             const l = ceil(a);
//             this.WIDTH = 4;
//             this.HEIGHT = ceil(h);
//             const p = PIZZA[l*3];
//             this.TV = TILE(this.WIDTH*PXL*4, this.HEIGHT*PXL*4).DO(tv=>{
//                 tv.S(PXL,PXL).T(2,this.HEIGHT);
//                 STRIPE(l, i=>{
//                     const y = -i/l*2;
//                     const x = (l+(l - i))/l*2;
//                     EACH(i ? [-p*i, p*i] : [0], r=>tv.DO(_=>{
//                         tv.R(r).P()
//                         .M(0,0)
//                         .L(-x,-1+y/2).L(-2*x,(-h+y)/2)
//                         .L(0,-h+y)
//                         .L(x,(-h+y)/2).L(2*x,-1+y/2)
//                         .L(0,0)
//                     }));
//                 });
//                 tv.F(this.COLOR);
//             });
//         });
//         return this;
//     },
//     INTERACT(e) {
//         e.INVENTORY.push(new MEDICINE().GENERATE(1));
//         this.GENERATE(this.AGE -= 1);
//         EMIT("BEAT");
//     }
// },"PLANT");

MAKE("HATCHET", [["TV",null]],{
    DRAW(tv) {
        if (!this.TV) {
            this.TV = TILE(64)
                .P().A(24,24,20,PI/2,PI).L(...rand.XY(48,8)).C().F(rand.HWB(32,3, 37,4, 55,4))
                .P().M(...rand.XY(24,8)).L(...rand.XY(20,12)).L(...rand.XY(59,61)).L(...rand.XY(61,59))
                .C().F(rand.HWB(15,2, 17,2, 68,4));
        }
        tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    }
},"ENT");

MAKE("BOW", [["TV",null]],{
    DRAW(tv) {
        if (!this.TV) {
            this.TV = TILE(64)
                .P().M(64,32).L(...rand.XY(52,25)).L(54,32).L(...rand.XY(52,39)) // Arrowhead
                .C().F(rand.HWB(32,3, 37,4, 55,4))
                .P().M(20,32).L(...rand.XY(17,28)) // top of feather
                .L(0,28).L(4,32).L(0,36) // middle of feather
                .L(...rand.XY(17,36)) // bottom of feather
                .C().F("#fffc")
                .P().M(3,32).L(59,32) // arrow body
                .M(...rand.XY(20,4)).L(...rand.XY(20,60)) // String
                .W(rand.HWB(15,2, 17,2, 68,4), 2)
                .P().A(20,32, 29, -PI/2-1/8,PI/2+1/8) // bow body
                .W(rand.HWB(15,2, 17,2, 68,4), 4)
        }
        tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    }
},"ENT");

MAKE("TEEPEE", [
    ["TV",null],
    ["COLOR",() => rand.HWB(46,3, 30,5, 40,4)]
],{
    GENERATE() {
        this.SEED = rand.DO(this.SEED,() => {
            const t = rand.XY(32,16,5)
            const d = rand.XY(32,38,3)
            const x = rand.BIAS()*3;
            const a = rand.HWB(10,3, 11,3, 50,4);
            const b = this.COLOR;
            const s = rand.HWB(46,3, 5,2, 75,4);
            this.TV = TILE(512).S(8,8).DO(tv=>tv.P()
                .M(3+x,64).L(...t).L(61+x,64)
                .C().F(tv.GR(32,0,16, 32,-32,112, [a,b,b,b,a])).W(a,1/2)
                .P().M(21+x,64).L(...d).L(43+x,64)
                .C().F(s)
                .P().M(t[0]-4,t[1]-7).L(...t).L(t[0]+5,t[1]-8).W(s,1)
            );
            this.WIDTH = 8;
            this.HEIGHT = 8;
        });
        return this;
    },
    DRAW(tv, i) {
        if (!this.TV) { this.GENERATE(); }
        if (!i) {
            tv.DO(() => {
                this.PREP(tv);
                tv.IMG(this.TV.CVS,-this.WIDTH/2, -this.HEIGHT, this.WIDTH, this.HEIGHT);
            });
        } else {
            tv.IMG(this.TV.CVS,0,0,64,64);
        }
        return this;
    }
},"ENT");

MAKE("SPEAR", [["TV",null]],{
    DRAW(tv) {
        if (!this.TV) {
            this.TV = TILE(64)
                .P().M(...rand.XY(3,8)).L(...rand.XY(6,3)).L(...rand.XY(48,45)).L(...rand.XY(45,48))
                .C().F(rand.HWB(15,2, 17,2, 68,4))
                .P().M(...rand.XY(63,63)).L(...rand.XY(59,47))
                .L(...rand.XY(42,42)).L(...rand.XY(47,59))
                .C().F(rand.HWB(32,3, 37,4, 55,4));
        }
        tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    }
},"ENT");

MAKE("DREAMCATCHER", [["TV",null]],{
    DRAW(tv) {
        if (!this.TV) {
            this.TV = TILE(64).P();
            this.TV.DO(tv=>{
                STRIPE(4,i=>{
                    tv
                    .M(...MOVE([32,28], ROT([0,26],PIZZA[12]*i)))
                    .L(...MOVE([32,28], ROT([0,26],PIZZA[12]*(i+4))))
                    .L(...MOVE([32,28], ROT([0,26],PIZZA[12]*(i+8))))
                    .L(...MOVE([32,28], ROT([0,26],PIZZA[12]*i)))
                });
                tv.W("#ffcc",1)
                    .P()
                    .M(6,28).L(2,47) // left feather top and left
                    .L(6,63).L(10,50).L(6,28) // left feather bottom and right
                    .M(58,28).L(54,52) // right feather top and left
                    .L(58,63).L(62,53).L(58,28) // right feather bottom and right
                    .F("#fffc")
                    .P().A(32,28,26).W(rand.HWB(15,2, 17,2, 68,4), 4)
            });
        }
        tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    }
},"ENT");

// MAKE("BOAT", [["TV",null]],{
//     DRAW(tv) {
//     }
// },"ENT");



MAKE("DRUM", [
    ["TV",null],
    ["ICON",null],
    ["NEEDS",[]],
    ["COLOR",() => rand.HWB(46,3, 30,5, 40,4)]
], {
    GENERATE(i) {
        this.ICON = i === SHELL || i === SUN ? i() : new i();
        this.TV = TILE(256).DO(tv=>{
            tv.P().A(128,128,128)
            .F(tv.GR(128,112,112, 128, 128, 128, [this.COLOR,rand.HWB(46,3, 20,5, 50,4)]))
            try {
                tv.T(64,48).S(2,2).DRAW(this.ICON, true);
            } catch (e) {
                console.error("Error drawing drum", i, this.ICON)
            }
        });
        let n = [];
        switch(i) {
            case BASKET:
                n=[GRASS,GRASS,GRASS];
                break;
            case HATCHET:
                n=[STICK,GRASS,ROCK];
                break;
            case SPEAR:
                n=[WOOD,GRASS,ROCK];
                break;
            case BOW:
                n=[WOOD,STICK,ROCK]
                break;
            case TEEPEE:
                n=[DEER,BISON,WOOD];
                break;
            case DREAMCATCHER:
                n=[STICK,GRASS,FLOWER];
                break;
            case SUN:
                n=[STICK,GRASS,WOOD];
            case MOON:
                n=[FLOWER,FLOWER,FLOWER];
                break;
            case EAR:
                n=[EAR,EAR,EAR];
                break;
            case DEER:
                n=[DEER,DEER,DEER];
                break;
            case BISON:
                n=[BISON,BISON,BISON];
        }
        this.NEEDS = rand.SHUFFLE(n);
        return this;
    },
    DRAW(tv, i) {
        if (i) {
            tv.IMG(this.TV.CVS, 0, 0, 64,64)
        } else {
            tv.IMG(this.TV.CVS,-1, -3, 2, 2);
        }
        // tv.IMG(this.TV.CVS,0,0,64,64);
        return tv;
    },
    DO() {
        const i = this.ICON
        if (i.SHELL) {
            // DO THE SPECIAL SAVE STUFF
            localStorage.setItem(KEY, true);
        } else if (IS(i, PERSON)) {
            PLAYER.MAXINVENTORY = 1;
        } else if (IS(i, BASKET)) {
            PLAYER.MAXINVENTORY = 3;
        }
    }
}, "ENT");

const FLAME = new Map();
MAKE("FIRE",[
    ["LOG", () => new WOOD()],
    ["O",()=>rand()],
    ["DRUM", null]
], {
    DRAW(tv, c) {
        tv.DO(() => {
            const cant = !this.CAN(PLAYER);
            this.PREP(tv);
            const C = FIX((this.O + bar % 0.5 * 2)%1, 64);
            // tv.DO(() => tv.T(-1.5,-2.125).S(1/32,1/32).DRAW(this.LOG));
            // tv.DO(() => tv.T(1.5,-2).S(-1/32,1/32).DRAW(this.LOG));
            tv.DO(() => tv.T(-1.5,-2).S(1/32,1/32).DRAW(this.LOG));
            tv.DO(() => tv.T(1.5,-1.75).S(-1/32,1/32).DRAW(this.LOG));
            if (!FLAME.has(C)) {
                const s = TILE(128,256);
                let hx = ESIN(C);
                let hy = ESIN((C+0.25)%1);1
                s.S(64,64).T(1,4).P()
                    .M(1,-1.5).A(0,-1.5, 1,0,PIZZA[2]) // Bottom of flame
                    .B(-1,-2.5-hy/2, 0+hx,-2.5-hy, 0-hx/2,-3.5) // Left side of flame
                    .B(0-hx,-2.5-hy, 1,-2.5-hy/2, 1,-1.5) // Right side of flame
                    .F(tv.GR(0,-1.25,0.5+hy/8,  0,0,4-hy/4, ["#ff0a", "#e206", "#d004"]));
                FLAME.set(C,s);
            }
            if (!this.DRUM || cant) {
                tv.IMG(FLAME.get(C).CVS, -1,-4,2,4)
            }
            if (this.DRUM) {
                if (cant) {
                    tv.O(0.5).T(ESIN(C)/2,-5);                    
                }
                this.DRUM.DRAW(tv);
            }
        });
},
    CAN(e) {
        return !!(
            !this.AREA[0].ENTITIES.filter(x=>IS(x,PERSON)).find(x=>!x.READY)
            && this.DRUM
            && (!this.DRUM.ICON.SHELL || this.DRUM.ICON.SHELL && e.DRUMS.length === 12)
        ); // Add trash interaction technique
    },
    INTERACT(e) {
        const { DRUM } = this;
        if (DRUM) {
            PLAYER.DRUMS.push(DRUM);
            PLAYER.shell.ADD(DRUM);
            DRUM.DO();
            DJ.SING(MAP(PLAYER.shell.DRUMS,(x,i)=>x ? i+1 : null).filter(x=>x));
            this.DRUM = 0;
            EMIT("AAH");
            EMIT("BEAT");
        } else if (e.INVENTORY) {
            e.INVENTORY.shift();
        }
    }
}, "ENT")

// Trick roadroller and my build to generate the other classes first
const ww = MAKE("WORLD", [
    ["SEED", 13],
    ["AGE", 0],
    ["DRUMS",[]],
    ["MOONS", []],
    ["VILLAGES", []],
    ["FIELDS", []],
    ["GRID",() => STRIPE(256,x=>STRIPE(256,y=>null))],
    ["AREAS", []],
    ["MAP", null],
    ["FLOOR", null],
    ["STRIPES", []],
    ["ENTITIES", []],
    ["LANDSCAPE", []],
    ["INTERACTIVE",[]],
    ["SOUNDTRACK", null],
    ["MELODY", null]
],
{
    GENERATE(s) {
        this.MAP = this.MAP || SCREEN({ WIDTH: 256, HEIGHT: 256, os: true });
        this.FLOOR = this.FLOOR || SCREEN({ WIDTH: 256, HEIGHT: 256, os: true });
        this.SEED = s;
        rand.SEED(s);
        // BEGIN DEBUGGING
        console.log("Generating world and setting SEED", s, rand.SEED());
        // END DEBUGGING
        const [sd, td] = rand.SHUFFLE([BASKET, HATCHET]);
        const [ld, rd] = rand.SHUFFLE([
            rand.SHUFFLE([SPEAR, BISON, EAR]), // EAR vs CORN
            rand.SHUFFLE([BOW, DEER, TEEPEE])
        ]);
        this.DRUMS = [
            PERSON,
            sd,
            ...ld,
            SUN,
            ...rd,
            td,
            ...rand.SHUFFLE([MOON, DREAMCATCHER]),
            SHELL
        ];

        this.SOUNDTRACK = SOUNDTRACK();
        this.MELODY = MELODY();
        let r = 16;
        this.MOONS = STRIPE(28, (y) => new AREA()
            .GENERATE(12)
            .MOVE([r * 6, 0, 0])
            .ROT(y * PIZZA[28] - PIZZA[4])
        );
        this.VILLAGES = STRIPE(13, (i) => {
            const x = i < 10
                ? new AREA()
                    .GENERATE(18)
                    .MOVE([80, 0, 0])
                    .ROT(PIZZA[10] * (i + 2.5))
                : new AREA().GENERATE(18).MOVE([0, (i - 11) * r * 2.5, 0]);
            x.SOUNDTRACK = SOUNDTRACK();
            x.MELODY = MELODY();
            return x;
        });
        this.FIELDS = STRIPE(3,i=>[
                PUT(new AREA().GENERATE(16).MOVE([0,56,0]).ROT(PIZZA[16]*(i*2+2)),{
                    MELODY:MELODY()
                    // BEGIN DEBUGGING
                    ,NAME: `FIELD ${i}`
                    // END DEBUGGING
                }),
                PUT(new AREA().GENERATE(16).MOVE([0,56,0]).ROT(PIZZA[16]*(i*2+10)),{
                    MELODY:MELODY()
                    // BEGIN DEBUGGING
                    ,NAME: `FIELD ${i+3}`
                    // END DEBUGGING
                })
            ]).flat();
        // Assign fields
        const BISONVILLAGE = this.VILLAGES[this.DRUMS.indexOf(BISON)];
        const BISONFIELD = this.FIELDS.find(x=>x.DIFF(BISONVILLAGE).LEN()<x.RADIUS+BISONVILLAGE.RADIUS);
        const DEERVILLAGE = this.VILLAGES[this.DRUMS.indexOf(DEER)];
        const DEERFIELD = this.FIELDS.find(x=>x.DIFF(DEERVILLAGE).LEN()<x.RADIUS+DEERVILLAGE.RADIUS);
        EACH(
            [
                [BISONFIELD,BISON,GRASS],
                [DEERFIELD,DEER,PINE]
            ],
            ([f,E,L])=>{
                f.ENTITIES.push(...STRIPE(7,i=>PUT(new E().MOVE([0,12,0]).ROT(PIZZA[7]*(i+rand()/8)).MOVE(f), { AREA:[f] })));
                STRIPE(32,i=>{
                    const p = new ENT(0,-f.RADIUS,0).ROT(PIZZA[32]*(i + rand.BIAS()/4));
                    const s = this.VILLAGES.filter(a=>p.COPY().MOVE(f).DIFF(a).LEN()<=a.RADIUS+0.05).length;
                    if (s < 1) {
                        // THIS IS AN EDGE POINT
                        const e = new (L)().GENERATE().MOVE(f).MOVE(p);
                        e.AREA.push(f);
                        f.LANDSCAPE.push(e);
                        this.LANDSCAPE.push(e);
                    } else {
                        const e = new ROCK().GENERATE().MOVE(f).MOVE(p);
                        e.AREA.push(f);
                        f.ENTITIES.push(e);
                        this.ENTITIES.push(e);
                    }
                });
    
            }
        );
        const CORNVILLAGE = this.VILLAGES[this.DRUMS.indexOf(EAR)];
        const CORNFIELD = this.FIELDS.reduce((r,f)=> r
            ? (r.DIFF(CORNVILLAGE).LEN() > f.DIFF(CORNVILLAGE).LEN() && f.ENTITIES.length === 0 ? f : r)
            : f, null);
        STRIPE(13,i=>{
            const p = new CORN().GENERATE().MOVE([4+rand.INT(7),0,0]).ROT(PIZZA[13]*i).MOVE(CORNFIELD);
            p.AREA.push(CORNFIELD);
            CORNFIELD.LANDSCAPE.push(p);
            this.LANDSCAPE.push(p);
        })
        // I was too slow so had to skip the boat and just put bridges in for now
        this.FIELDS.push(
            new AREA().GENERATE(8).MOVE([0,-62,0]),
            new AREA().GENERATE(8).MOVE([0,-16,0]),
            new AREA().GENERATE(8).MOVE([0,16,0])
            // new AREA().GENERATE(8).MOVE([0,62,0])
        );

        this.AREAS = [...this.MOONS, ...this.VILLAGES, ...this.FIELDS]; //.sort(SCREENSORT);
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
        this.DRUMS = MAP(this.DRUMS,i=>new DRUM().GENERATE(i));
        EACH(this.VILLAGES, (x, i) => {
            // BEGIN DEBUGGING
            x.NAME = `drum ${i}`;
            // END DEBUGGING
            // TODO: GENERATE TERRAIN
            // Make fire and assign drum
            const f = new FIRE().MOVE(x);
            f.DRUM = this.DRUMS[i];
            x.ENTITIES.push(f);
            f.AREA.push(x);

            // POPULATE WITH VILLAGERS
            STRIPE(3,i=>{
                // const v = new (rand.PICK([PERSON,DEER,BISON]))().MOVE(
                const r = PIZZA[3]*(i+rand.BIAS()/8);
                const o = 10 + rand.INT(2);
                const v = new PERSON().MOVE(
                    // x.COPY().MOVE(new ENT(0, 6 + rand.INT(6), 0).ROT(PIZZA[3]*(i+rand.BIAS()/8)))
                    new ENT(0, o, 0).ROT(r).MOVE(x)
                );
                if (f.DRUM.NEEDS.length) {
                    const n = f.DRUM.NEEDS.shift();
                    v.NEEDS.push(n);
                    const i = new n();
                    i.GENERATE?.(1);
                    v.INVENTORY.push(i);
                }
                const t = new TEEPEE().MOVE(
                    new ENT(0, o+2, 0).ROT(r+PIZZA[32]*rand.SIGN()).MOVE(x)
                );
                EACH(([t,v])=>e=>{const {x,y}=this.POS();PUT(e,{x,y})});
                x.ENTITIES.push(v, t);
                EACH([t,v],e=>e.AREA.push(x));
            });
            // No landscaping on the final village
            if (i===12) { return; }
            // Test grass
            STRIPE(32,i=>{
                const p = new ENT(0,-x.RADIUS,0).ROT(PIZZA[32]*(i + rand.BIAS()/4));
                const s = this.AREAS.filter(a=>p.COPY().MOVE(x).DIFF(a).LEN()<=a.RADIUS+0.05).length;
                if (s < 2) {
                    // THIS IS AN EDGE POINT
                    // const e = new (rand.bit() ? GRASS : BUSH).GENERATE().MOVE(x).MOVE(p);
                    const e = rand.bit() ? new GRASS() : new BUSH();
                    e.GENERATE().MOVE(x).MOVE(p);
                    e.AREA.push(x);
                    x.LANDSCAPE.push(e);
                    this.LANDSCAPE.push(e);
                }
            });
        });
        this.ENTITIES.push(
          ...MAP(this.AREAS, (x) => x.ENTITIES)
            .flat()
            .sort(SCREENSORT)
        );
        this.MAP.DO((tv) => {
            tv.E().center();
            EACH(this.AREAS.filter(a=>!this.FIELDS.includes(a)), (a) => {
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
        // WORLD MAP: Start building the world from here
        const { FLOOR } = this;
        FLOOR
            // Dark outer ring
            .P().A(128,128,108).W("#202",16)
            // Dark inner ring
            .P().A(128,164,80)
            .M(128,128).L(25,150).L(25,80)
            .L(55,50).L(128,30).L(206,50)
            .L(231,80).L(231,150).L(128,128)
            .F(this.FLOOR.GR(128,164,23, 128,164,28,["#fff2","#2026","#202"]))
            // The Water
            .P().A(128,102,40)
            .F(this.FLOOR.GR(128, 128, 32, 128, 128, 256, ["hwb(250deg 14% 57%)", "hwb(220deg 65% 12%)"]))
            // The Clouds
            .P().A(128,164,22)
            .F(this.FLOOR.GR(128, 164, 16, 128, 160, 30, ["#fff8", "#fff4"]))
        // The fields
        FLOOR.P();
        // STRIPE(3,i=>{
        //     const a = new ENT(0,56).ROT(PIZZA[16]*(i*2+2)).MOVE([128,128,128]);
        //     const b = new ENT(0,56).ROT(PIZZA[16]*(i*2+10)).MOVE([128,128,128]);
        //     FLOOR.M(a.x,a.y).A(a.x,a.y,16).M(b.x,b.y).A(b.x,b.y,16);
        // });
        EACH(this.FIELDS,a=>FLOOR.M(a.x+128,a.y+128).A(a.x+128,a.y+128,a.RADIUS));
        FLOOR.F(FLOOR.GR(128,128,48,128,108,192,["#141","#263"]))

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
            // BEGIN DEBUGGING
            console.log(`Plotting ${this.LANDSCAPE.length} landscape items`);
            // END DEBUGGING
            EACH(this.LANDSCAPE.filter(l=>!(l instanceof FLOWER)), l => this.FLOOR.P().A(l.x,l.y+0.5,1.25).F(l.COLOR));
        });
        // Place all entities into the grid
        EACH([...this.ENTITIES,...this.LANDSCAPE,PLAYER],e=>{
            e.y=ZROUND(e.y);
            e.x=ZROUND(e.x);
            this.GRID[e.y+128][e.x+128]=e;
            if (IS(e,TEEPEE)) {
                this.GRID[e.y+128][e.x+127]=e;
                this.GRID[e.y+128][e.x+129]=e;
            }
        });
        return this;
    },
    SAVE() {},
    LOAD() {},
    UPDATE(_) {
        const areas = this.AREAS.filter((a) => LEN(DIFF(a, PLAYER)) < a.RADIUS);
        if (areas.find(x => !PLAYER.AREA.includes(x)) || PLAYER.AREA.find(x => !areas.includes(x))) {
            PLAYER.AREA = areas;
            DJ?.FRESH?.((areas.find(x=>x.SOUNDTRACK) || this).SOUNDTRACK, (areas.find(x=>x.MELODY) || this).MELODY);    
        }
        EACH(this.AREAS,x=>x.UPDATE(_));
        return this;
    },
    DRAW(tv) {
        this.INTERACTIVE.length = 0;
        const sx = -tv.W2 / PXL;
        const sw = tv.W1 / PXL;
        // tv.ctx.imageSmoothingEnabled = false;
        // Limit ourselves to up to 132 slices beyond the camera, and make the first couple of layers semi-transparent
        let o = 1;
        // const s = 0;
        const s = max(0, ROUND(CAMERA.y)) // If we want to add in fog and not rendering stuff far enough away;
        // for (let i = 0; i <= min(256, ROUND(CAMERA.y + 132)); i += 1) {
        for (let i = s; i <= min(256, ROUND(CAMERA.y + 132)); i += 1) {
            if (o) { tv.O(1-o); }
            const s = new ENT(CAMERA.x, i - 128, 0).PROJECT(0);
            const z = s[2];
            if (z === 0) {
                break;
            }
            const sp = z * PXL * 2;
            const beg = max(0,FLOOR(CAMERA.x + 128 - tv.W2 / sp)-4);
            const wide = min(256-beg,ceil(tv.W1 / sp)+8);
            tv.IMG(
                this.FLOOR.CVS,
                CAMERA.x + 128 - tv.W2 / sp,
                i,
                tv.W1 / sp,
                1,
                sx,
                (s[1] - tv.H2) / PXL,
                sw,
                z * 2
            );
            // Draw entities on this layer, determine the interactive elements
            EACH(SORT(this.GRID[i].filter(x=>x),SCREENSORT),x=>{
                x.DRAW(tv);
                if (x.CAN?.(PLAYER)) {
                    this.INTERACTIVE.unshift(x);
                }
            });
            if (o) {
                tv.O(1);
                o = max(0, o - z/4);
            }
        }
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
let world = new WORLD().GENERATE(localStorage.getItem(KEY) ? Date.now() : 13);
// let world = new WORLD().GENERATE(Date.now());

// let ground = STRIPE(11, y => new AREA().MOVE(y ? [0, -64, (1 - EHSIN(OF(y-1,9))) * 32 - 16] : [0, 0, 0]).ROT((y-0.5) * PIZZA[10]));
// let entities = [
//     // ...STRIPE(13, i => PUT(new BISON(), { y: -1 - i, x: rand.INT(16)-8 })),
//     // ...STRIPE(13, i => PUT(new PERSON(), { y: -1 - i, x: rand.INT(16) - 8 })),
//     // ...STRIPE(13, i => PUT(new DEER(), { y: -1 - i, x: rand.INT(16) - 8 })),
// ];
let CAMERA = new ENT(PLAYER.x, PLAYER.y + CAMERABACKP, PLAYER.z + CAMERAUPP);

// BEGIN DEBUGGING
// const corn = new CORN();
// const teepee = new TEEPEE();
// const dreamcatcher = new DREAMCATCHER();
// const bow = new BOW();
// const spear = new SPEAR();
// const hatchet = new HATCHET();
// const basket = new BASKET();
// const rock = new ROCK();
const person = new PERSON();person.UPDATE(0);
// END DEBUGGING

const TICK = (d) => {
    const t = d / 1000;
    if (!PAUSED) {
        // PXL += ROUND((32 - PXL) / 2);
        // UPDATE METRICS
        D += d * RATE;
        // DATE = FLOOR(D / DAY);
        HOUR = D % DAY / DAY;
        measure = FLOOR(D / 4000);
        bar = D % 4000 / 4000;
        beat = FLOOR(bar * 8);
        TCK = FLOOR(D / 250);
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
        EACH(world.ENTITIES, x => x.THINK?.());
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
    moon.PHASE = D ? FLOOR((28 + (D - SKYDELAY() * DAY) / DAY ) % 28) : 0;
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
    // WORLD
    TV.DO(() => {
        // Camera
        TV.T(W2, H2);
        TV.S(PXL, PXL);
        world.DRAW(TV);
    });
    // MUSIC VISUALIZER
    // if (DJ) {
    //     const v = DJ.DATA;
    //     const w = W1/(v.length*2-1);
    //     const h = H3/4;
    //     TV.DO(() => {
    //         TV.FP("#f00", [...v.slice().reverse(), ...v].reduce((p,y,x) => p.L(x*w, H1-y/256*h-PXL), PATH().M(0,H1)).L(W1,H1).C());
    //     })
    // }
    // MOUSE
    TV.DO(() => TV.T(MOUSE.x-2,MOUSE.y-2).S(4,4).R(CIRCLE*ESIN(now%4000/4000)).FP("#280c",MOUSE.PATH));
    MOUSE.TARGET = PAUSED ? null : world.INTERACTIVE.find(x=>TV.ctx.isPointInPath(x.CLICKAREA(), MOUSE.x, MOUSE.y));
    if (MOUSE.TARGET) {
        TV.DO(() => {
            const p = MOUSE.TARGET.CLICKAREA();
            TV.ctx.setLineDash([13,7]);
            TV.ctx.lineDashOffset = now/1000*20;
            TV.WP("#280", 1, p);    
        });
    }
    // INVENTORY DISPLAY
    const l = PLAYER.MAXINVENTORY;
    STRIPE(l, i=>TV.DO(_=>{
        // console.log(`Rendering inventory ${i} of ${l}`);
        const e = PLAYER.INVENTORY[i];
        const x = (TV.W1 - 128) / (l + 1) * (i+1) + 32;
        const y = max(TV.H3*2, TV.H1 - 128);
        TV.T(x,y).P().RR(0,0,64,64,4).C().F("#fff4");
        if (e) { e.DRAW(TV, true); }
    }));
    // CLICK TO BEGIN
    if (PAUSED) {
        TV.ctx.fillStyle = "#0f0";
        TV.ctx.font = '32px monospace';
        // const s = "Click to play";
        // TV.ctx.fillText(s, TV.W2-TV.ctx.measureText(s).width/2, TV.H3);
        EACH([
            "wasd = move",
            "shift = run",
            "esc = pause/resume",
            "mouse = interact",
            !DJ ? "click to play" : "- paused -"
        ], ((x, i) => TV.ctx.fillText(x, TV.W2 - TV.ctx.measureText(x).width/2, (i + 1) * 32)));
        EACH([
            "Use the fire to empty inventory.",
            "Drums can unlock new interactions",
            "Help each villager to unlock drums.",
        ], ((x, i) => TV.ctx.fillText(x, TV.W2 - TV.ctx.measureText(x).width/2, TV.H1 + (i + 1) * -32)));
    }
    if (PLAYER.DRUMS.length === 13) {
        TV.ctx.fillStyle = "#0f0";
        TV.ctx.font = '32px monospace';
        EACH([
            "Refresh to create a new world",
            "You collected all 13 drums.",
            "Congratulations!",
        ], ((x, i) => TV.ctx.fillText(x, TV.W2 - TV.ctx.measureText(x).width/2, TV.H1 + (i + 1) * -32)));
    }
    // BEGIN DEBUGGING
    if (DEBUG) {
        TV.DO(() => {
            // grid lines
            TV.P().M(0, 2 * H3).L(W1, 2 * H3).M(W2, 0).L(W2, H1).M(0, H2).L(W1, H2).W("#0f0", 0.125);
            TV.ctx.fillStyle = "#0f0";
            TV.ctx.font = '16px monospace';
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
            
            // TV.DO(() => TV.T(H2,32).DRAW(rock, true));
            // TV.DO(() => TV.T(H2,32).DRAW(basket));
            // TV.DO(() => TV.T(H2,32).DRAW(hatchet));
            // TV.DO(() => TV.T(H2,32).DRAW(spear));
            // TV.DO(() => TV.T(H2,32).DRAW(bow));
            // TV.DO(() => TV.T(H2,32).DRAW(dreamcatcher));
            // TV.DO(() => TV.T(H2,32).DRAW(teepee, true));
            // TV.DO(() => TV.T(H2,32).DRAW(corn, true));
        });
        TV.DO(() => TV.T(H2,128).DRAW(person, true));
    }
    // END DEBUGGING
    requestAnimationFrame(MAIN);
};
MAIN(0);

// Event handling
const KEYS = { w: 0, a: 0, s: 0, d: 0, get change() { return this.w + this.a + this.s + this.d; }, get MOVE() { let { w, a, s, d } = this; return { w, a, s, d }; } };
ONCE("mousedown", () => PAUSED = false);

ON("click",() => MOUSE.TARGET?.INTERACT(PLAYER));

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
    TV.RESIZE(min(1920, window.innerWidth), min(1080, window.innerHeight));
    // PUT(TV.REAL, p);
    // PUT(TV.CVS, p);
});
EACH(["visibilitychange","blur"],e=>ON(e,() => {
    // PAUSED = true;
    // EMIT("pause");
    EACH(Object.keys(KEYS),k=>KEYS[k]=0);
}));

// BEGIN DEBUGGING
// EACH(["mousedown", "mouseup", "mousemove", "keydown", "keyup", "visibilitychange","resize","blur"],
// e=>ON(e,(...x)=>console.log(e,...x)));
// END DEBUGGING

const LISTEN = (t,e,f)=>t.addEventListener(e,f);
EACH(
  ["mousedown", "mouseup", "mousemove", "click", "keydown", "keyup", "visibilitychange"],
  (e) => LISTEN(document, e, (...x) => EMIT(e, ...x))
);
EACH(["resize","blur"],e=>LISTEN(window, e, (...x) => EMIT(e, ...x)));
LISTEN(document,"click",()=>DJ=DJ||SOUND());
document.body.appendChild(TV.REAL);
