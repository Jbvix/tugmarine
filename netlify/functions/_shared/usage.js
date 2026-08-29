const { SAAM_BRANCHES } = require("../../../data/branches.js");
const { FLEET_VESSELS } = require("../../../data/fleet.js");

function findVessel(name) {
    return FLEET_VESSELS.find((v) => v.vessel === name) || null;
}

function checkAdminPin(headerPin, envPin) {
    if (!envPin) return { status: 503, error: "ADMIN_PIN não configurado" };
    if (!headerPin || headerPin !== envPin) return { status: 401, error: "PIN inválido" };
    return { ok: true };
}

function validateCreate(body) {
    if (!body || !body.deviceId) return { error: "deviceId obrigatório", status: 400 };
    if (!["correct", "incorrect"].includes(body.verdict)) return { error: "verdict inválido", status: 400 };
    if (!Array.isArray(body.tanks) || body.tanks.length === 0) return { error: "tanques obrigatórios", status: 400 };
    const vessel = findVessel(body.vessel);
    if (!vessel) return { error: "navio fora da frota", status: 400 };
    if (!SAAM_BRANCHES.includes(body.port)) return { error: "filial inválida", status: 400 };
    if (!body.chemaq || !String(body.chemaq).trim()) return { error: "chemaq obrigatório", status: 400 };

    const tanks = body.tanks.map((t) => ({
        tankId: String(t.tankId || ""),
        tankName: String(t.tankName || ""),
        sounding: Number(t.sounding) || 0,
        volume: Number(t.volume) || 0
    }));
    const totalLiters = Math.round(tanks.reduce((a, t) => a + t.volume, 0) * 100) / 100;

    return {
        session: {
            id: body.id || crypto.randomUUID(),
            createdAt: body.createdAt || new Date().toISOString(),
            deviceId: String(body.deviceId),
            vessel: vessel.vessel,
            imo: vessel.imo,
            mmsi: vessel.mmsi,
            classeApelido: vessel.classeApelido,
            designClass: vessel.designClass,
            port: body.port,
            chemaq: String(body.chemaq).trim(),
            calcClassId: String(body.calcClassId || ""),
            calcClassName: String(body.calcClassName || ""),
            tanks,
            totalLiters,
            verdict: body.verdict,
            comment: String(body.comment || "").slice(0, 500),
            messages: [],
            unreadByUser: false,
            unreadByAdmin: true
        }
    };
}

function toIndexRow(session) {
    return {
        id: session.id,
        createdAt: session.createdAt,
        port: session.port,
        vessel: session.vessel,
        chemaq: session.chemaq,
        classeApelido: session.classeApelido,
        verdict: session.verdict,
        totalLiters: session.totalLiters,
        unreadByAdmin: !!session.unreadByAdmin,
        unreadByUser: !!session.unreadByUser
    };
}

function computeStats(index) {
    const today = new Date().toISOString().slice(0, 10);
    const ports = new Set(index.map((r) => r.port));
    const vessels = new Set(index.map((r) => r.vessel));
    const chemaqs = new Set(index.map((r) => r.chemaq));
    const correct = index.filter((r) => r.verdict === "correct").length;
    const byPort = {};
    for (const r of index) {
        byPort[r.port] = byPort[r.port] || { total: 0, correct: 0 };
        byPort[r.port].total += 1;
        if (r.verdict === "correct") byPort[r.port].correct += 1;
    }
    return {
        total: index.length,
        today: index.filter((r) => (r.createdAt || "").startsWith(today)).length,
        ports: ports.size,
        vessels: vessels.size,
        chemaqs: chemaqs.size,
        correct,
        incorrect: index.filter((r) => r.verdict === "incorrect").length,
        correctPct: index.length ? Math.round((correct / index.length) * 100) : 0,
        byPort
    };
}

function filterIndex(index, q = {}) {
    return index
        .filter((r) => {
            if (q.port && r.port !== q.port) return false;
            if (q.vessel && r.vessel !== q.vessel) return false;
            if (q.verdict && r.verdict !== q.verdict) return false;
            if (q.classeApelido && r.classeApelido !== q.classeApelido) return false;
            return true;
        })
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function addMessage(session, from, text, deviceId) {
    if (from === "user" && session.deviceId !== deviceId) {
        return { error: "device não autorizado", status: 403 };
    }
    const msg = { from, text: String(text || "").trim().slice(0, 1000), at: new Date().toISOString() };
    if (!msg.text) return { error: "mensagem vazia", status: 400 };
    session.messages = session.messages || [];
    session.messages.push(msg);
    if (from === "admin") {
        session.unreadByUser = true;
        session.unreadByAdmin = false;
    } else {
        session.unreadByAdmin = true;
        session.unreadByUser = false;
    }
    return { session };
}

function inboxForDevice(sessions, deviceId) {
    return sessions
        .filter((s) => s.deviceId === deviceId)
        .map((s) => ({
            id: s.id,
            vessel: s.vessel,
            port: s.port,
            createdAt: s.createdAt,
            unreadByUser: !!s.unreadByUser,
            messages: s.messages || []
        }))
        .filter((s) => s.messages.length > 0);
}

module.exports = {
    SAAM_BRANCHES,
    FLEET_VESSELS,
    findVessel,
    checkAdminPin,
    validateCreate,
    toIndexRow,
    computeStats,
    filterIndex,
    addMessage,
    inboxForDevice
};
