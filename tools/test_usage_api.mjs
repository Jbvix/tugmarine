import * as usage from "../netlify/functions/_shared/usage.mjs";

function assert(cond, name) {
    if (!cond) throw new Error("FAIL " + name);
    console.log("PASS", name);
}

const crao = usage.validateCreate({
    deviceId: "dev-a",
    vessel: "SAAM CRAÓ",
    port: "Santos",
    chemaq: "João",
    verdict: "correct",
    calcClassId: "320_CRAO",
    tanks: [
        { tankId: "FO_DAY.P", tankName: "Serviço BB", sounding: 129, volume: 10283 },
        { tankId: "FO_OF.P", tankName: "Overflow", sounding: 32, volume: 183 }
    ],
    totalLiters: 1
});
assert(crao.session.totalLiters === 10466, "soma dos tanques ignora total do cliente");
assert(crao.session.imo === "9457438", "IMO oficial do Crao");
assert(crao.session.port === "Santos", "filial Santos");

const badPort = usage.validateCreate({
    deviceId: "dev-a",
    vessel: "SAAM CRAÓ",
    port: "Manaus",
    chemaq: "João",
    verdict: "correct",
    tanks: [{ tankId: "X", tankName: "X", sounding: 1, volume: 10 }]
});
assert(badPort.status === 400, "filial fora da lista");

const badVessel = usage.validateCreate({
    deviceId: "dev-a",
    vessel: "REBOCADOR X",
    port: "Santos",
    chemaq: "João",
    verdict: "correct",
    tanks: [{ tankId: "X", tankName: "X", sounding: 1, volume: 10 }]
});
assert(badVessel.status === 400, "navio fora da frota");

const itaqui = usage.validateCreate({
    id: "s2",
    createdAt: "2026-08-28T12:00:00.000Z",
    deviceId: "dev-b",
    vessel: "SAAM CRAÓ",
    port: "São Luís (Itaqui)",
    chemaq: "João",
    verdict: "incorrect",
    tanks: [{ tankId: "X", tankName: "X", sounding: 1, volume: 50 }]
});
const index = [usage.toIndexRow(crao.session), usage.toIndexRow(itaqui.session)];
const stats = usage.computeStats(index);
assert(stats.total === 2, "duas sessões nacionais");
assert(stats.ports === 2, "duas filiais");
assert(stats.correct === 1 && stats.incorrect === 1, "vereditos");
assert(usage.filterIndex(index, { port: "Santos" }).length === 1, "filtro port=Santos esconde Itaqui");
assert(usage.filterIndex(index, { port: "Santos" })[0].port === "Santos", "filtro mantém Santos");

assert(usage.checkAdminPin("", "secret").status === 401, "admin sem PIN");
assert(usage.checkAdminPin("secret", "secret").ok === true, "admin com PIN");
assert(usage.checkAdminPin("secret", "").status === 503, "ADMIN_PIN ausente");

const session = JSON.parse(JSON.stringify(crao.session));
const denied = usage.addMessage(session, "user", "oi", "outro-device");
assert(denied.status === 403, "reply de outro device");
const ok = usage.addMessage(session, "admin", "confirme o overflow", null);
assert(ok.session.unreadByUser === true, "mensagem admin marca unread");
assert(usage.inboxForDevice([ok.session], "dev-a").length === 1, "inbox do device A");
assert(usage.inboxForDevice([ok.session], "dev-z").length === 0, "outro device não vê");

assert(usage.SAAM_BRANCHES.includes("Santana (Macapá)"), "Santana na lista");
assert(usage.SAAM_BRANCHES.length === 16, "16 filiais oficiais");
assert(usage.FLEET_VESSELS.some((v) => v.vessel === "SAAM CANINDÉ"), "Canindé na frota");
assert(!usage.SAAM_BRANCHES.includes("Manaus"), "Manaus não está na lista");

console.log("\nuso/admin: todos os testes OK");
