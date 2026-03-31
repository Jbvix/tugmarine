/**
 * TUGLIFE Marine - Calculator Engine
 * Version: 4.5
 * Logic: Bilinear Interpolation & Unit Normalization
 */

class CalculatorEngine {
    constructor(vesselData) {
        this.data = vesselData;
    }

    /**
     * Get list of available vessel classes
     */
    getClasses() {
        return Object.keys(this.data.classes).map(key => ({
            id: key,
            name: this.data.classes[key].name
        }));
    }

    /**
     * Get configuration for a specific class
     */
    getClassConfig(classId) {
        return this.data.classes[classId];
    }

    /**
     * Normalize input value to table unit (MM)
     */
    normalizeInput(value, classId) {
        const config = this.getClassConfig(classId);
        // If table is in MM but input is usually CM (user preference), convert.
        // For this engine:
        // Classe A: Unit=CM -> No conversion needed if input is CM.
        // Others: Unit=MM -> User input CM * 10 = MM.

        if (config.unit === 'mm') {
            return value * 10;
        }
        return value; // Already in CM (Classe A)
    }

    /**
     * Clamp volume to max capacity
     */
    clampVolume(volume, tankMax) {
        if (volume > tankMax) return tankMax;
        if (volume < 0) return 0;
        return volume;
    }

    /**
     * Linear Interpolation
     */
    interpolateLinear(x, x0, y0, x1, y1) {
        if (x1 === x0) return y0;
        return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
    }

    /**
     * Inverse Linear Interpolation (Find X given Y)
     */
    interpolateLinearInverse(y, x0, y0, x1, y1) {
        if (y1 === y0) return x0;
        return x0 + ((y - y0) * (x1 - x0)) / (y1 - y0);
    }

    /**
     * Calculate Volume based on Sounding (and Trim if applicable)
     * @param {string} classId - Vessel Class ID
     * @param {string} tankId - Tank ID
     * @param {number} soundingInput - Sounding in CM
     * @param {number} trimInput - Trim in M (optional)
     */
    calculateVolume(classId, tankId, soundingInput, trimInput = 0) {
        const config = this.getClassConfig(classId);
        const tank = config.tanks.find(t => t.id === tankId);
        const table = config.tables[tankId]; // Assuming tables are loaded/referenced here

        if (!tank || !table) {
            console.warn(`Table not found for ${classId} - ${tankId}`);
            return 0;
        }

        const sounding = this.normalizeInput(soundingInput, classId);

        // -- LOGIC STUB FOR DEMONSTRATION --
        // In a real scenario, this would look up 'sounding' in 'table'.
        // Since we don't have the full CSV data in SoundingData.js yet,
        // we will implement a basic linear mock function.

        // Todo: Replace with actual table lookup when data is populated.
        // For v4.5, assuming tables are properly structured as { "0": [...] } or standard array for linear.
        // We will implement full interpolation logic later when validating with real large datasets.

        let calculatedVolume = 0;

        // Simple 1D Linear or Bilinear logic based on structure
        // If table is 1D array (legacy or simplified)
        if (Array.isArray(table)) {
            // 1D Logic impl (refactoring needed if switching to SoundingData.js structure)
            // But SoundingData.js uses { "0": [...] }
        }

        // Assuming SoundingData.js structure { "0": [{s,v}...] }
        // Simple 0-Trim lookup for now (or find closest trim)
        const trimKey = "0"; // Default to even keel for now
        const tParams = table[trimKey] || table[Object.keys(table)[0]]; // Fallback

        if (tParams) {
            if (sounding <= tParams[0].s) calculatedVolume = tParams[0].v;
            else if (sounding >= tParams[tParams.length - 1].s) calculatedVolume = tParams[tParams.length - 1].v;
            else {
                for (let i = 0; i < tParams.length - 1; i++) {
                    if (sounding >= tParams[i].s && sounding <= tParams[i + 1].s) {
                        calculatedVolume = this.interpolateLinear(sounding, tParams[i].s, tParams[i].v, tParams[i + 1].s, tParams[i + 1].v);
                        break;
                    }
                }
            }
        }

        // Add Trim correction logic here later for Bilinear

        return this.clampVolume(calculatedVolume, tank.max_vol);
    }

    /**
     * Calculate Sounding based on Volume (Inverse)
     * Note: Uses 0-Trim table for estimation
     */
    calculateSounding(classId, tankId, volume) {
        const config = this.getClassConfig(classId);
        const tank = config.tanks.find(t => t.id === tankId);
        const table = config.tables[tankId];
        if (!tank || !table) return 0;

        // Use 0 trim for prediction
        const trimKey = "0";
        const tParams = table[trimKey] || table[Object.keys(table)[0]];

        if (!tParams) return 0;

        let sResult = 0;
        if (volume <= tParams[0].v) sResult = tParams[0].s;
        else if (volume >= tParams[tParams.length - 1].v) sResult = tParams[tParams.length - 1].s;
        else {
            for (let i = 0; i < tParams.length - 1; i++) {
                if (volume >= tParams[i].v && volume <= tParams[i + 1].v) {
                    sResult = this.interpolateLinearInverse(volume, tParams[i].s, tParams[i].v, tParams[i + 1].s, tParams[i + 1].v);
                    break;
                }
            }
        }

        // De-normalize if needed (MM -> CM)
        if (config.unit === 'mm') {
            return sResult / 10;
        }
        return sResult;
    }
}

// Global Instance for usage in HTML files
const MarineCalculator = new CalculatorEngine(VESSEL_DATA);
