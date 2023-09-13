const { watchFile, promises: { readFile, writeFile } } = require('fs');
const { PassThrough } = require("node:stream");
const StaticServer = require('static-server');
const yazl = require("yazl");
const { minify } = require("uglify-js");
const { Packer } = require("roadroller");
const server = new StaticServer({ rootPath: '.', port: 9080 });

// const CHAR = "$ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijlmnopqrstuvwxyz".split("");
const CHAR = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijlmnopqrstuvwxyz".split("");

const rename = (i) => {
    let r = i;
    const l = CHAR.length;
    let name = "";
    while(r > 0 || !name) {
        const m = r % l;
        r = Math.floor(r/l);
        name += CHAR[m];
    }
    return `$${name}`;
}

const IGNORE = ["PI","JSON","DJ"]

server.start(() => console.log('Server listening to', server.port));

const MAX = 13312;

const roadrollerit = async (data) => {
    const inputs = [{ data, type: 'js', action: 'eval'}];
    const packer = new Packer([{ data, type: 'js', action: 'eval'}], {});
    await packer.optimize();
    const { firstLine, secondLine } = packer.makeDecoder();
    return firstLine + secondLine;
}

const build = async () => {
    try {
        const raw = await readFile("./index.js", "utf-8");
        console.log(`${Buffer.byteLength(raw, "utf8")} bytes raw`);
        // let adjusted = raw.replace(/\(\) *=>/g, "$=>").replace(/\/\/ BEGIN DEBUGGING[\S\s]+?END DEBUGGING\n/gm, "");
        let adjusted = raw.replace(/\/\/ BEGIN DEBUGGING[\S\s]+?END DEBUGGING\n/gm, "");
 
        let { error, code, ...other } = minify(adjusted, { mangle: { toplevel: true, properties: false } });
        if (error) { throw error; }
        console.log(`${Buffer.byteLength(code, "utf8")} bytes minified`);

        // LOOK FOR POSSIBLE REPLACEMENT TOKENS
        // const allTokens = code
        //     .match(/\b(\d+(?:\.\d+)? *\/ *\d+(?:\.\d+)?|\d+(?:\.\d+)?|(?<=[. ])[a-z_]\w+)\b/gm)
        //     .map(x=>x.replace(/ +/g,""))
        //     .sort()
        //     .reduce((r, k) => ({ ...r, [k]:(r[k] ?? 0)+1 }), {});
        // console.log("All possible replacement tokens", allTokens);

        // CUSTOM RENAMING OF UPPERCASE TOKENS
        const tokens = [...new Set(code.match(/(?<![$.]])\b(?<!\[])[A-Z][A-Z0-9]{2,}(?!\])\b/gm))]
            .filter(x => !IGNORE.includes(x))
            .sort((a,b)=> a.length - b.length || (a < b ? 1 : -1))
            .reverse();

        // console.log(`Replacing ${tokens.length} tokens: ${rename(0)} through ${rename(tokens.length)}`);
        // console.log(tokens.map((x,i)=>`${x} = ${rename(i)}`).join("\n"));

        // This method worked, but the updated method shaves just a little bit more off the mark
        // tokens.forEach((t, i) => code = code.replace(new RegExp(`\\b${t}\\b`, "gm"), () => `$${i.toString(16).toUpperCase()}`));
        tokens.forEach((t, i) => code = code.replace(new RegExp(`(?<![$.]_])\\b${t}\\b`, "gm"), () => `$_${i}`));
        tokens.forEach((t, i) => code = code.replace(new RegExp(`\\$_${i}\\b`, "gm"), rename(i)));
        console.log(`${Buffer.byteLength(code, "utf8")} bytes tokenized`);

        // CUSTOM PROPERTY REPLACEMENT TOKENS       
        // const props = [
        //     'filter',
        //     'createOscillator',
        //     'createGain',
        //     'createStereoPanner',
        //     'frequency',
        //     'exponentialRampToValueAtTime',
        //     'connect',
        //     'destination',
        //     'currentTime',
        //     'createElement'
        // ];
        // props.forEach((p,i) => {
        //     code.replace(new RegExp("\\.${p}","gm"), `[P${i}]`);
        // });// console.log(`Found tokens`, vars);
        // code = `const ${props.map((p,i)=>`P${i}='${p}'`).join(",")};${code}`;

        code = `(()=>{${code}})()`;
        await writeFile("./index.min.js", code, "utf8");

        code = await roadrollerit(code);
        console.log(`${Buffer.byteLength(code, "utf8")} bytes via roadroller`);
        await writeFile("./index.pack.js", code, "utf8");
        const html = await readFile("./index.html", "utf-8");
        const final = html
            .replace(/\n/g, "")
            .replace(/<script.+\/script>/gm, `<script>${code}</script>`);
        console.log(`${Buffer.byteLength(final, "utf8")} bytes built`);
        const stream = new PassThrough();
        const zip = new yazl.ZipFile();
        zip.outputStream.pipe(stream);
        zip.addBuffer(Buffer.from(final), "index.html");
        zip.end({ forceZip64Format: false }, () => {});
        const buff = await new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (c) => chunks.push(Buffer.from(c)));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks)));
        });
        await writeFile("./index.min.html", final);
        await writeFile("./js13kgames-2023-13drums.zip", buff);
        const bytes = buff.length;
        const percent = (bytes / 13312 * 100).toFixed(1);
        console.log(`Built zip ${bytes}/${MAX} bytes (${percent}%)`);
    } catch(e) {
        console.error("Error building", e);
    }
};

watchFile("./index.js", build);
build();
