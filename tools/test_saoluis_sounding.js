/**
 * Matriz São Luís ago/2026 — interpolação oficial, sem linha anterior.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js", "SoundingData.js"), "utf8") + "\nthis.VESSEL_DATA = VESSEL_DATA;", ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js", "CalculatorEngine.js"), "utf8") + "\nthis.CalculatorEngine = CalculatorEngine;", ctx);

const calc = new ctx.CalculatorEngine(ctx.VESSEL_DATA);

function almost(got, exp, tol = 0.6) {
    return Math.abs(got - exp) <= tol;
}

const cases = [
    { name: "Crao DAY.P 1290 → 10283", id: "320_CRAO", tank: "FO_DAY.P", input: 129.0, exp: 10283 },
    { name: "Crao OF.P 320 → 183", id: "320_CRAO", tank: "FO_OF.P", input: 32.0, exp: 183 },
    { name: "Charrua DB.P 1670 → 19218", id: "323_CHARRUA", tank: "FO_DB.P", input: 167.0, exp: 19218 },
    { name: "Charrua DB.S 1180 → 12667", id: "323_CHARRUA", tank: "FO_DB.S", input: 118.0, exp: 12667 },
    { name: "Charrua DB.C 300 → 1533", id: "323_CHARRUA", tank: "FO_DB.C", input: 30.0, exp: 1533 },
    { name: "Canindé DB.C 2120 → 37965", id: "321_CANINDE", tank: "FO_DB.C", input: 212.0, exp: 37965 },
    { name: "Canindé DB.P 150 → 179", id: "321_CANINDE", tank: "FO_DB.P", input: 15.0, exp: 179 },
    { name: "Mira 1BB 0.330 m → 1091", id: "C407_STARNAV", tank: "FO_DB.P", input: 0.330, exp: 1091 },
    { name: "Tiaki 1BE 2.210 m → 17151", id: "C407_STARNAV", tank: "FO_DB.S", input: 2.210, exp: 17151 },
    { name: "Águia 2C 1.540 m → 16474", id: "C417_AGUIA", tank: "FO_DB.C", input: 1.540, exp: 16474 },
    { name: "Crao DAY.S 1320 → 10522", id: "320_CRAO", tank: "FO_DAY.S", input: 132.0, exp: 10522 },
    { name: "Crao DAY.P 2270 → 18192", id: "320_CRAO", tank: "FO_DAY.P", input: 227.0, exp: 18192 },
    { name: "Crao DAY.S 2320 → 18598", id: "320_CRAO", tank: "FO_DAY.S", input: 232.0, exp: 18598 },
    { name: "Crao DB.P 1450 → 15723", id: "320_CRAO", tank: "FO_DB.P", input: 145.0, exp: 15723 },
    { name: "Crao DB.S 1630 ≈ 20727", id: "320_CRAO", tank: "FO_DB.S", input: 163.0, exp: 20727, tol: 30 },
    { name: "Crao FO_DB.P cheio 2182 → 30231", id: "320_CRAO", tank: "FO_DB.P", input: 218.2, exp: 30231 },
    { name: "Crao FO_DB.S cheio 2200 → 34110", id: "320_CRAO", tank: "FO_DB.S", input: 220.0, exp: 34110 },
    { name: "Classe C NÃO é Canindé no rótulo", id: "C", check: () => {
        const name = ctx.VESSEL_DATA.classes.C.name;
        return /NÃO usar no Canindé/i.test(name) && !/322-326/.test(name);
    }},
    { name: "Crao rótulo Hull 323", id: "320_CRAO", check: () => /323/.test(ctx.VESSEL_DATA.classes["320_CRAO"].name) },
    { name: "Canindé FO_DB.P não fecha em 2182", id: "321_CANINDE", check: () => {
        const last = ctx.VESSEL_DATA.classes["321_CANINDE"].tables["FO_DB.P"]["0"].slice(-1)[0];
        return last.s === 3485 && last.v === 30231;
    }},
    { name: "Canindé 150 mm não usa curva 323", id: "321_CANINDE", check: () => {
        const v321 = calc.calculateVolume("321_CANINDE", "FO_DB.P", 15);
        const v323 = calc.calculateVolume("320_CRAO", "FO_DB.P", 15);
        return almost(v321, 179) && !almost(v323, 179, 5);
    }}
];

let failed = 0;
for (const c of cases) {
    let ok;
    let detail = "";
    if (c.check) {
        ok = c.check();
        detail = ok ? "ok" : "rótulo/regra falhou";
    } else {
        const got = calc.calculateVolume(c.id, c.tank, c.input);
        ok = almost(got, c.exp, c.tol || 1.0);
        detail = `got ${got.toFixed(2)} exp ${c.exp}`;
    }
    if (!ok) failed += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${c.name}  ${detail}`);
}

if (failed) {
    console.error(`\n${failed} teste(s) falharam`);
    process.exit(1);
}
console.log(`\n${cases.length} testes OK`);
