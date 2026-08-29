/**
 * TUGLIFE Marine - Calculator Engine
 * Version: 4.5
 * Logic: Linear interpolation between official neighbors only.
 * GHS: sounding tables in mm, 100 mm step. Detroit: UI in m, 0.01 m step.
 */

class CalculatorEngine {
    constructor(vesselData) {
        this.data = vesselData;
    }

    getClasses() {
        return Object.keys(this.data.classes).map(key => ({
            id: key,
            name: this.data.classes[key].name,
            group: this.data.classes[key].group || "Outras",
            notes: this.data.classes[key].notes || ""
        }));
    }

    getClassConfig(classId) {
        return this.data.classes[classId];
    }

    /**
     * UI unit → table millimetres.
     * mm classes: operator types centimetres.
     * m classes (Detroit): operator types metres.
     */
    normalizeInput(value, classId) {
        const config = this.getClassConfig(classId);
        if (config.unit === "mm") return value * 10;
        if (config.unit === "m") return value * 1000;
        return value;
    }

    denormalizeSounding(soundingMm, classId) {
        const config = this.getClassConfig(classId);
        if (config.unit === "mm") return soundingMm / 10;
        if (config.unit === "m") return soundingMm / 1000;
        return soundingMm;
    }

    clampVolume(volume, tankMax) {
        if (tankMax == null || Number.isNaN(Number(tankMax))) return volume;
        if (volume > tankMax) return tankMax;
        if (volume < 0) return 0;
        return volume;
    }

    interpolateLinear(x, x0, y0, x1, y1) {
        if (x1 === x0) return y0;
        return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
    }

    interpolateLinearInverse(y, x0, y0, x1, y1) {
        if (y1 === y0) return x0;
        return x0 + ((y - y0) * (x1 - x0)) / (y1 - y0);
    }

    maxGapMm(config) {
        const step = Number(config.step_mm) || 100;
        return step * 1.5;
    }

    getTrimSeries(table) {
        if (!table) return [];
        if (Array.isArray(table)) return table.slice().sort((a, b) => a.s - b.s);
        const trimKey = "0";
        const raw = table[trimKey] || table[Object.keys(table)[0]] || [];
        return raw.slice().sort((a, b) => a.s - b.s);
    }

    lookupVolume(classId, tankId, soundingInput, trimInput = 0) {
        const config = this.getClassConfig(classId);
        if (!config) {
            return { volume: 0, status: "missing", message: "Classe não encontrada" };
        }
        const tank = config.tanks.find(t => t.id === tankId);
        const table = config.tables[tankId];
        if (!tank || !table) {
            return { volume: 0, status: "missing", message: `Tabela não encontrada: ${classId} ${tankId}` };
        }

        const sounding = this.normalizeInput(soundingInput, classId);
        const series = this.getTrimSeries(table);
        if (!series.length) {
            return { volume: 0, status: "incomplete", message: "Sem linhas oficiais neste tanque" };
        }

        const maxGap = this.maxGapMm(config);
        let calculatedVolume = null;
        let status = "ok";
        let message = "";

        const first = series[0];
        const last = series[series.length - 1];

        if (Math.abs(sounding - first.s) < 1e-9) {
            calculatedVolume = first.v;
        } else if (Math.abs(sounding - last.s) < 1e-9) {
            calculatedVolume = last.v;
        } else if (sounding < first.s) {
            if (first.s <= maxGap) {
                calculatedVolume = this.interpolateLinear(sounding, 0, 0, first.s, first.v);
            } else {
                status = "incomplete";
                message = "Abaixo da primeira linha oficial — não interpolar neste intervalo";
                calculatedVolume = 0;
            }
        } else if (sounding > last.s) {
            calculatedVolume = last.v;
            if (sounding - last.s > maxGap) {
                status = "incomplete";
                message = "Acima da última linha oficial";
            }
        } else {
            for (let i = 0; i < series.length - 1; i++) {
                const a = series[i];
                const b = series[i + 1];
                if (sounding >= a.s && sounding <= b.s) {
                    if (Math.abs(sounding - a.s) < 1e-9) {
                        calculatedVolume = a.v;
                    } else if (Math.abs(sounding - b.s) < 1e-9) {
                        calculatedVolume = b.v;
                    } else if ((b.s - a.s) > maxGap) {
                        status = "incomplete";
                        message = `Sem linha vizinha (passo ${config.step_mm || 100} mm). Não usar a linha anterior.`;
                        calculatedVolume = 0;
                    } else {
                        calculatedVolume = this.interpolateLinear(sounding, a.s, a.v, b.s, b.v);
                    }
                    break;
                }
            }
        }

        if (calculatedVolume == null) {
            return { volume: 0, status: "incomplete", message: "Sem interpolação válida" };
        }

        return {
            volume: this.clampVolume(calculatedVolume, tank.max_vol),
            status,
            message
        };
    }

    /**
     * @param {string} classId
     * @param {string} tankId
     * @param {number} soundingInput - CM for mm tables, metres for Detroit
     */
    calculateVolume(classId, tankId, soundingInput, trimInput = 0) {
        return this.lookupVolume(classId, tankId, soundingInput, trimInput).volume;
    }

    calculateSounding(classId, tankId, volume) {
        const config = this.getClassConfig(classId);
        const tank = config.tanks.find(t => t.id === tankId);
        const table = config.tables[tankId];
        if (!tank || !table) return 0;

        const series = this.getTrimSeries(table);
        if (!series.length) return 0;

        let sResult = 0;
        if (volume <= series[0].v) sResult = series[0].s;
        else if (volume >= series[series.length - 1].v) sResult = series[series.length - 1].s;
        else {
            for (let i = 0; i < series.length - 1; i++) {
                if (volume >= series[i].v && volume <= series[i + 1].v) {
                    sResult = this.interpolateLinearInverse(
                        volume, series[i].s, series[i].v, series[i + 1].s, series[i + 1].v
                    );
                    break;
                }
            }
        }

        return this.denormalizeSounding(sResult, classId);
    }
}

const MarineCalculator = new CalculatorEngine(VESSEL_DATA);
