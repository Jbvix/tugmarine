/**
 * Rebuild SoundingData.js for SAAM São Luís ago/2026.
 * Source of GHS 323/326 No Trim: existing 320_CARAJA tables (Excel SMIT CARAJÁ).
 * Does not invent Detroit/Canindé storage curves — official points only.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const srcPath = path.join(root, "js", "SoundingData.js");
const outPath = srcPath;

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(srcPath, "utf8") + "\nthis.VESSEL_DATA = VESSEL_DATA;", ctx);
const current = ctx.VESSEL_DATA;

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function remapTables(tables, map) {
    const out = {};
    for (const [oldId, table] of Object.entries(tables)) {
        out[map[oldId] || oldId] = clone(table);
    }
    return out;
}

function appendPoint(series, s, v) {
    if (!series.some((p) => p.s === s)) {
        series.push({ s, v });
        series.sort((a, b) => a.s - b.s);
    }
}

const ID_MAP = {
    FO_DAY_P: "FO_DAY.P",
    FO_DAY_S: "FO_DAY.S",
    FO_DB_AFT_P: "FO_AFT.P",
    FO_DB_AFT_S: "FO_AFT.S",
    FO_DB_P: "FO_DB.P",
    FO_DB_S: "FO_DB.S",
    FO_DB_C: "FO_DB.C",
    FO_OF_P: "FO_OF.P"
};

const caraja = current.classes["320_CARAJA"];
const ghsTables = remapTables(caraja.tables, ID_MAP);
appendPoint(ghsTables["FO_DAY.P"]["0"], 2900, 22623);

const GHS_323_TANKS = [
    { id: "FO_DAY.P", name: "Serviço BB (FO_DAY.P)", max_vol: 22623 },
    { id: "FO_DAY.S", name: "Serviço BE (FO_DAY.S)", max_vol: 22623 },
    { id: "FO_AFT.P", name: "Lateral BB (FO_AFT.P)", max_vol: 21254 },
    { id: "FO_AFT.S", name: "Lateral BE (FO_AFT.S)", max_vol: 21254 },
    { id: "FO_DB.P", name: "Armaz. BB (FO_DB.P)", max_vol: 30231 },
    { id: "FO_DB.S", name: "Armaz. BE (FO_DB.S)", max_vol: 34110 },
    { id: "FO_DB.C", name: "Central (FO_DB.C)", max_vol: 44451 },
    { id: "FO_OF.P", name: "Overflow BB (FO_OF.P)", max_vol: 3533 }
];

function hull323(name, extra = {}) {
    return {
        name,
        unit: "mm",
        trim_type: "linear",
        book: "GHS No Trim — Hull 323 (Crao/Charrua/Caiapo/Caripuna/Carajá)",
        step_mm: 100,
        group: extra.group || "Ramparts 3000 — GHS Hull 323",
        notes: extra.notes || "",
        tanks: GHS_323_TANKS,
        tables: ghsTables,
        ...extra
    };
}

function pts(pairs) {
    return { "0": pairs.map(([s, v]) => ({ s, v })) };
}

const canindeDayP = clone(ghsTables["FO_DAY.P"]);
const canindeDayS = clone(ghsTables["FO_DAY.S"]);
const canindeDbC = clone(ghsTables["FO_DB.C"]);

const classes = {};

// Keep A first
classes.A = current.classes.A;
classes.A.group = "Outras classes (não alterar)";

classes.C = hull323("Classe C genérica Ramparts 3000 — NÃO usar no Canindé", {
    notes: "Livro GHS No Trim Hull 323. Canindé é Hull 321 (chave 321_CANINDE)."
});

classes["320_CRAO"] = hull323("SAAM CRAO — Hull 323", {
    notes: "Mesma GHS No Trim do Crao/Charrua/Caiapo/Caripuna. Overflow entra no saldo."
});

classes["323_CHARRUA"] = hull323("SAAM CHARRUA — Hull 323 (GHS do Crao)", {
    notes: "Charrua usa a GHS No Trim do Crao (323), não a do Canindé (321)."
});

classes["320_CARAJA"] = hull323("SAAM CARAJÁ — Hull 326 (série GHS 323)", {
    notes: "Carimbo Excel: SMIT CARAJÁ Hull 326, Ramparts 3000, No Trim. Série = Crao/Charrua/Caiapo/Caripuna."
});

classes["321_CANINDE"] = {
    name: "SAAM CANINDÉ — Hull 321",
    unit: "mm",
    trim_type: "linear",
    book: "GHS 11.00 SMIT CANINDE Hull 321, 14/01/2009, No Trim",
    step_mm: 100,
    group: "Canindé — Hull 321 (livro próprio)",
    notes: "FO_DB.P fecha em 3485 mm / 30.231 L — não é a curva do 323 (2182 mm). Armazéns só com pontos oficiais até o PDF completo.",
    tanks: [
        { id: "FO_DAY.P", name: "Serviço BB (FO_DAY.P)", max_vol: 22623 },
        { id: "FO_DAY.S", name: "Serviço BE (FO_DAY.S)", max_vol: 22623 },
        { id: "FO_DB.C", name: "Central (FO_DB.C)", max_vol: 44451 },
        { id: "FO_DB.P", name: "Armaz. 03 BB (FO_DB.P)", max_vol: 30231, table_complete: false },
        { id: "FO_DB.S", name: "Armaz. 04 BE (FO_DB.S)", max_vol: 34110, table_complete: false }
    ],
    tables: {
        "FO_DAY.P": canindeDayP,
        "FO_DAY.S": canindeDayS,
        "FO_DB.C": canindeDbC,
        "FO_DB.P": pts([
            [0, 39],
            [150, 179],
            [3485, 30231]
        ]),
        "FO_DB.S": pts([
            [3500, 34110]
        ])
    }
};

classes.C407_STARNAV = {
    name: "STARNAV C407–C414 (Canis/Mira/Tiaki…)",
    unit: "m",
    trim_type: "linear",
    book: "C407-000199-01 — cascos C408 a C414 (Rev. B tubo 2 C Canis; Rev. A série)",
    step_mm: 10,
    group: "STARNAV — três livros, não misturar",
    notes: "Serviço = visor (modo G). 2 C Rev. B 3,588 m / Rev. A 3,665 m = 30.522 m³. Não forçar 29.199 L no saldo Mira.",
    tanks: [
        { id: "FO_DAY.P", name: "Diário BB (visor)", max_vol: 21153, gauge: true, table_complete: false },
        { id: "FO_DAY.S", name: "Diário BE (visor)", max_vol: 21153, gauge: true, table_complete: false },
        { id: "FO_DB.C", name: "2 C (Rev. B 3,588 m)", max_vol: 30522, table_complete: false },
        { id: "FO_DB.P", name: "1 BB", max_vol: 36700, table_complete: false },
        { id: "FO_DB.S", name: "1 BE", max_vol: 35772, table_complete: false }
    ],
    tables: {
        "FO_DAY.P": pts([
            [2150, 17492],
            [2300, 21153]
        ]),
        "FO_DAY.S": pts([
            [2150, 17492],
            [2300, 21153]
        ]),
        "FO_DB.C": pts([
            [2490, 29199],
            [3588, 30522]
        ]),
        "FO_DB.P": pts([
            [50, 173],
            [330, 1091],
            [1930, 14275],
            [6724, 36700]
        ]),
        "FO_DB.S": pts([
            [30, 26],
            [400, 1421],
            [2210, 17151],
            [6642, 35772]
        ])
    }
};

classes.C398_ALTAIR = {
    name: "STARNAV ALTAIR C-398 (série C398–C399)",
    unit: "m",
    trim_type: "linear",
    book: "C398-000199-03 — ALTAIR C-398",
    step_mm: 10,
    group: "STARNAV — três livros, não misturar",
    notes: "Não usar livro C407. Serviço 2,15 m na linha ≈ 10.200 L ≠ laudo visor 17.500 L.",
    tanks: [
        { id: "DO-3P", name: "Armaz. BB (DO-3P)", max_vol: null, depth_mm: 6020, table_complete: false },
        { id: "DO-4C", name: "Central (DO-4C)", max_vol: null, depth_mm: 3490, table_complete: false },
        { id: "DO-5S", name: "Armaz. BE (DO-5S)", max_vol: null, depth_mm: 6285, table_complete: false },
        { id: "DO-6P", name: "Diário BB (DO-6P, visor)", max_vol: null, depth_mm: 4472, gauge: true, table_complete: false },
        { id: "DO-7S", name: "Diário BE (DO-7S, visor)", max_vol: null, depth_mm: 4458, gauge: true, table_complete: false }
    ],
    tables: {
        "DO-3P": pts([[4130, 26282]]),
        "DO-4C": pts([[620, 4991]]),
        "DO-5S": pts([[4630, 27285]]),
        "DO-6P": pts([[2150, 10200]]),
        "DO-7S": pts([[2150, 10200]])
    }
};

classes.C417_AGUIA = {
    name: "STARNAV ÁGUIA C-417",
    unit: "m",
    trim_type: "linear",
    book: "C417-000199-01 — ÁGUIA C-417 (não usar C407)",
    step_mm: 10,
    group: "STARNAV — três livros, não misturar",
    notes: "Diário: coluna da tabela é visor. 2 C 1,540 m = 16.474 L. Serviço 2,15 m visor = 16.200 L (não a linha 20.212 m³).",
    tanks: [
        { id: "FO_DAY.P", name: "Diário BB (visor)", max_vol: 16200, depth_mm: 2710, gauge: true, table_complete: false },
        { id: "FO_DAY.S", name: "Diário BE (visor)", max_vol: 16200, depth_mm: 2710, gauge: true, table_complete: false },
        { id: "FO_DB.C", name: "2 C", max_vol: null, depth_mm: 2648, table_complete: false },
        { id: "FO_DB.P", name: "1 BB", max_vol: null, depth_mm: 6089, table_complete: false },
        { id: "FO_DB.S", name: "1 BE", max_vol: null, depth_mm: 6089, table_complete: false }
    ],
    tables: {
        "FO_DAY.P": pts([[2150, 16200]]),
        "FO_DAY.S": pts([[2150, 16200]]),
        "FO_DB.C": pts([[1540, 16474]]),
        "FO_DB.P": pts([]),
        "FO_DB.S": pts([])
    }
};

// Preserve remaining books unchanged — do not copy Starnav onto them
["P", "T", "LH1500", "CHILE"].forEach((key) => {
    if (current.classes[key]) {
        classes[key] = current.classes[key];
        classes[key].group = "Outras classes (não alterar)";
    }
});

const header = `/**
 * TUGLIFE Marine - Unified Sounding Database
 * Version: 4.5
 * São Luís ago/2026: GHS Hull 323 partilhado; Canindé 321 separado; STARNAV em 3 livros.
 * Storage: JSON-in-JS for local file compatibility
 */

const GHS_323_TANKS = ${JSON.stringify(GHS_323_TANKS, null, 4)};

const GHS_323_TABLES = ${JSON.stringify(ghsTables, null, 4)};

`;

function dumpClass(id, cls) {
    const copy = { ...cls };
    const usesShared = copy.tables === ghsTables && copy.tanks === GHS_323_TANKS;
    if (usesShared) {
        delete copy.tanks;
        delete copy.tables;
    }
    const json = JSON.stringify(copy, null, 4).replace(/^/gm, "        ").replace(/^        \{/, "{");
    if (usesShared) {
        return `        "${id}": Object.assign(${json}, { tanks: GHS_323_TANKS, tables: GHS_323_TABLES })`;
    }
    return `        "${id}": ${json}`;
}

const body = Object.keys(classes).map((id) => dumpClass(id, classes[id])).join(",\n");

const file = `${header}const VESSEL_DATA = {
    "classes": {
${body}
    }
};
`;

fs.writeFileSync(outPath, file, "utf8");
console.log("Wrote", outPath);
console.log("Classes:", Object.keys(classes).join(", "));
