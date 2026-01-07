/**
 * TUGLIFE Marine - Unified Sounding Database
 * Version: 4.5
 * Storage: JSON-in-JS for local file compatibility
 */

const VESSEL_DATA = {
    "classes": {
        "A": {
            "name": "Classe A (ASD 2411)",
            "unit": "cm",
            "trim_type": "bilinear",
            "tanks": [
                { "id": "TK4", "name": "TK4 Fuel Oil Header", "max_vol": 2825 },
                { "id": "TK5", "name": "TK5 Fuel Oil Header", "max_vol": 2825 },
                { "id": "TK6", "name": "TK6 Fuel Oil PS", "max_vol": 24286 },
                { "id": "TK7", "name": "TK7 Fuel Oil SB", "max_vol": 24286 },
                { "id": "TK11", "name": "TK11 Fuel Oil Aft PS", "max_vol": 11621 },
                { "id": "TK12", "name": "TK12 Fuel Oil Aft SB", "max_vol": 14827 }
            ],
            "tables": {
                "TK4": { "0": [{ s: 0, v: 729 }, { s: 220, v: 2601 }, { s: 260, v: 2825 }] },
                "TK5": { "0": [{ s: 0, v: 729 }, { s: 220, v: 2601 }, { s: 260, v: 2825 }] },
                "TK6": { "0": [{ s: 0, v: 1101 }, { s: 100, v: 14230 }, { s: 260, v: 24286 }] },
                "TK7": { "0": [{ s: 0, v: 1133 }, { s: 100, v: 14300 }, { s: 260, v: 24286 }] },
                "TK11": { "0": [{ s: 0, v: 22 }, { s: 100, v: 3742 }, { s: 250, v: 11621 }] },
                "TK12": { "0": [{ s: 0, v: 62 }, { s: 100, v: 4989 }, { s: 250, v: 14827 }] }
            }
        },
        "C": {
            "name": "Classe C (Canindé/Cascos 322-326)",
            "unit": "mm",
            "trim_type": "linear",
            "tanks": [
                { "id": "FODAY.P", "name": "Diário BB", "max_vol": 22623 },
                { "id": "FODAY.S", "name": "Diário BE", "max_vol": 22623 },
                { "id": "FO_AFT.P", "name": "Lateral BB", "max_vol": 21254 },
                { "id": "FO_AFT.S", "name": "Lateral BE", "max_vol": 21254 },
                { "id": "FO_DB.P", "name": "Duplo Fundo BB", "max_vol": 30231 },
                { "id": "FO_DB.BE", "name": "Duplo Fundo BE", "max_vol": 30231 },
                { "id": "FO_DB.C", "name": "Duplo Fundo Central", "max_vol": 44451 }
            ],
            "tables": {
                "FODAY.P": { "0": [{ s: 0, v: 132 }, { s: 2500, v: 20062 }, { s: 2900, v: 22623 }] },
                "FODAY.S": { "0": [{ s: 0, v: 132 }, { s: 2500, v: 20062 }, { s: 2900, v: 22623 }] },
                "FO_AFT.P": { "0": [{ s: 0, v: 4 }, { s: 2200, v: 20524 }, { s: 2248, v: 21254 }] },
                "FO_AFT.S": { "0": [{ s: 0, v: 4 }, { s: 2200, v: 20524 }, { s: 2248, v: 21254 }] },
                "FO_DB.P": { "0": [{ s: 0, v: 39 }, { s: 3005, v: 19828 }, { s: 3200, v: 30231 }] },
                "FO_DB.BE": { "0": [{ s: 0, v: 39 }, { s: 3200, v: 26584 }] },
                "FO_DB.C": { "0": [{ s: 0, v: 0 }, { s: 2400, v: 39924 }, { s: 2493, v: 44451 }] }
            }
        },
        "P": {
            "name": "Classe P",
            "unit": "mm",
            "trim_type": "linear",
            "tanks": [
                { "id": "DIARIO_BB", "name": "Diário BB", "max_vol": 10355 },
                { "id": "DIARIO_BE", "name": "Diário BE", "max_vol": 10355 },
                { "id": "DF_BB", "name": "Duplo Fundo BB", "max_vol": 8300 },
                { "id": "DF_BE", "name": "Duplo Fundo BE", "max_vol": 8300 },
                { "id": "DF_CENTRAL", "name": "Duplo Fundo Central", "max_vol": 39286 }
            ],
            "tables": {
                "DIARIO_BB": { "0": [{ s: 0, v: 263 }, { s: 2000, v: 7959 }] },
                "DIARIO_BE": { "0": [{ s: 0, v: 263 }, { s: 2000, v: 7959 }] },
                "DF_BB": { "0": [{ s: 0, v: 15 }, { s: 1000, v: 5724 }] },
                "DF_BE": { "0": [{ s: 0, v: 15 }, { s: 1000, v: 5724 }] },
                "DF_CENTRAL": { "0": [{ s: 0, v: 413 }, { s: 1000, v: 26371 }] }
            }
        },
        "T": {
            "name": "Classe T (Rampart 2500)",
            "unit": "mm",
            "trim_type": "bilinear",
            "tanks": [
                { "id": "DIARIO_BB", "name": "Diário BB", "max_vol": 7921 },
                { "id": "DIARIO_BE", "name": "Diário BE", "max_vol": 7921 },
                { "id": "LATERAL_BB", "name": "Lateral BB", "max_vol": 8314 },
                { "id": "LATERAL_BE", "name": "Lateral BE", "max_vol": 8314 },
                { "id": "CENTRAL", "name": "Central", "max_vol": 38074 }
            ],
            "tables": {
                "DIARIO_BB": { "0": [{ s: 0, v: 188 }, { s: 100, v: 565 }, { s: 1000, v: 4032 }, { s: 2000, v: 7921 }] },
                "DIARIO_BE": { "0": [{ s: 0, v: 188 }, { s: 100, v: 565 }, { s: 1000, v: 4032 }, { s: 2000, v: 7921 }] },
                "LATERAL_BB": { "0": [{ s: 0, v: 14 }, { s: 100, v: 95 }, { s: 1000, v: 6080 }, { s: 1240, v: 8314 }] },
                "LATERAL_BE": { "0": [{ s: 0, v: 14 }, { s: 100, v: 95 }, { s: 1000, v: 6080 }, { s: 1240, v: 8314 }] },
                "CENTRAL": { "0": [{ s: 0, v: 2678 }, { s: 1000, v: 31000 }, { s: 1220, v: 38074 }] }
            }
        },
        "LH1500": {
            "name": "Classe LH1500",
            "unit": "mm",
            "trim_type": "linear",
            "tanks": [
                { "id": "TQ4CT", "name": "T4 Central", "max_vol": 38312 },
                { "id": "TQ4BB", "name": "T4 BB", "max_vol": 22390 },
                { "id": "TQ4BE", "name": "T4 BE", "max_vol": 22390 },
                { "id": "TQ06", "name": "T06", "max_vol": 51295 },
                { "id": "SERVICO", "name": "Serviço", "max_vol": 7680 }
            ],
            "tables": {
                "TQ4CT": { "0": [{ s: 0, v: 0.6 }, { s: 130, v: 34971 }, { s: 140, v: 38312 }] },
                "TQ4BB": { "0": [{ s: 0, v: 960 }, { s: 110, v: 22390 }] },
                "TQ4BE": { "0": [{ s: 0, v: 960 }, { s: 110, v: 22390 }] },
                "TQ06": { "0": [{ s: 0, v: 73 }, { s: 400, v: 47385 }] },
                "SERVICO": { "0": [{ s: 0, v: 0 }, { s: 100, v: 7680 }] }
            }
        },
        "CHILE": {
            "name": "Chile / Holanda",
            "unit": "cm",
            "trim_type": "bilinear",
            "tanks": [
                { "id": "TK1_BB", "name": "TK1 BB", "max_vol": 9203 },
                { "id": "TK1_BE", "name": "TK1 BE", "max_vol": 9203 },
                { "id": "TK2_CENTRAL", "name": "TK2 Central", "max_vol": 12315 },
                { "id": "TK6_BB", "name": "TK6 BB", "max_vol": 13981 },
                { "id": "TK6_BE", "name": "TK6 BE", "max_vol": 11694 }
            ],
            "tables": {
                "TK1_BB": { "0": [{ s: 0, v: 17 }, { s: 200, v: 3216 }] },
                "TK1_BE": { "0": [{ s: 0, v: 17 }, { s: 200, v: 3216 }] },
                "TK2_CENTRAL": { "0": [{ s: 0, v: 1225 }, { s: 300, v: 3888 }] },
                "TK6_BB": { "0": [{ s: 0, v: 6 }, { s: 220, v: 13981 }] },
                "TK6_BE": { "0": [{ s: 0, v: 8 }, { s: 220, v: 11694 }] }
            }
        },
        "320": {
            "name": "Classe 320 (Craó/Carajá)",
            "unit": "mm",
            "trim_type": "linear",
            "tanks": [
                { "id": "DIARIO_BB", "name": "Diário BB", "max_vol": 15000 },
                { "id": "DIARIO_BE", "name": "Diário BE", "max_vol": 15000 },
                { "id": "LATERAL_BB", "name": "Lateral BB", "max_vol": 18000 },
                { "id": "LATERAL_BE", "name": "Lateral BE", "max_vol": 18000 },
                { "id": "CENTRAL", "name": "Central", "max_vol": 40000 }
            ],
            "tables": {
                "DIARIO_BB": { "0": [{ s: 0, v: 0 }, { s: 2000, v: 15000 }] },
                "DIARIO_BE": { "0": [{ s: 0, v: 0 }, { s: 2000, v: 15000 }] },
                "LATERAL_BB": { "0": [{ s: 0, v: 0 }, { s: 2000, v: 18000 }] },
                "LATERAL_BE": { "0": [{ s: 0, v: 0 }, { s: 2000, v: 18000 }] },
                "CENTRAL": { "0": [{ s: 0, v: 0 }, { s: 2000, v: 40000 }] }
            }
        }
    }
};
