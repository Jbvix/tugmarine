/**
 * Filiais SAAM Towage Brasil — lista oficial da spec 2026-08-28.
 */
const SAAM_BRANCHES = [
    "Santos",
    "Itaguaí",
    "Rio",
    "Angra",
    "Vitória",
    "Salvador",
    "Suape",
    "Pecém",
    "São Luís (Itaqui)",
    "Belém",
    "Paranaguá",
    "São Francisco do Sul",
    "Itajaí",
    "Imbituba",
    "Rio Grande",
    "Santana (Macapá)"
];

if (typeof window !== "undefined") window.SAAM_BRANCHES = SAAM_BRANCHES;
if (typeof module !== "undefined" && module.exports) module.exports = { SAAM_BRANCHES };
