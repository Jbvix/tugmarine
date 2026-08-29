import { getStore } from "@netlify/blobs";
import * as usage from "./_shared/usage.mjs";

const hits = new Map();

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
}

function adminPin() {
    try {
        return Netlify.env.get("ADMIN_PIN");
    } catch {
        return process.env.ADMIN_PIN;
    }
}

function rateLimited(ip) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    if (list.length >= 30) return true;
    list.push(now);
    hits.set(ip, list);
    return false;
}

function store() {
    return getStore({ name: "tugmarine-usage", consistency: "strong" });
}

async function loadIndex(s) {
    return (await s.get("index", { type: "json" })) || [];
}

async function saveIndex(s, index) {
    await s.setJSON("index", index);
}

async function loadSession(s, id) {
    return s.get(`session:${id}`, { type: "json" });
}

async function saveSession(s, session) {
    await s.setJSON(`session:${id(session)}`, session);
    const index = await loadIndex(s);
    const row = usage.toIndexRow(session);
    const i = index.findIndex((r) => r.id === session.id);
    if (i >= 0) index[i] = row;
    else index.push(row);
    await saveIndex(s, index);
}

function id(session) {
    return session.id;
}

function requireAdmin(req) {
    return usage.checkAdminPin(req.headers.get("x-admin-pin") || "", adminPin());
}

export default async (req, context) => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/$/, "") || "/";
    const method = req.method;

    if (method === "OPTIONS") {
        return new Response("", { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    try {
        if (method === "POST" && path === "/api/sessions") {
            if (rateLimited(context.ip || "unknown")) return json({ error: "muitas tentativas" }, 429);
            const body = await req.json();
            const result = usage.validateCreate(body);
            if (result.error) return json({ error: result.error }, result.status);
            const s = store();
            await saveSession(s, result.session);
            return json({ ok: true, id: result.session.id, totalLiters: result.session.totalLiters }, 201);
        }

        if (method === "GET" && path === "/api/sessions/inbox") {
            const device = url.searchParams.get("device") || "";
            if (!device) return json({ error: "device obrigatório" }, 400);
            const s = store();
            const index = await loadIndex(s);
            const sessions = [];
            for (const row of index) {
                const full = await loadSession(s, row.id);
                if (full && full.deviceId === device) {
                    if (full.unreadByUser) {
                        full.unreadByUser = false;
                        await saveSession(s, full);
                    }
                    sessions.push(full);
                }
            }
            return json({ sessions: usage.inboxForDevice(sessions, device) });
        }

        const replyMatch = path.match(/^\/api\/sessions\/([^/]+)\/reply$/);
        if (method === "POST" && replyMatch) {
            const body = await req.json();
            const s = store();
            const session = await loadSession(s, replyMatch[1]);
            if (!session) return json({ error: "sessão não encontrada" }, 404);
            const result = usage.addMessage(session, "user", body.text, body.deviceId);
            if (result.error) return json({ error: result.error }, result.status);
            await saveSession(s, result.session);
            return json({ ok: true });
        }

        if (path.startsWith("/api/admin/")) {
            const auth = requireAdmin(req);
            if (!auth.ok) return json({ error: auth.error }, auth.status);
            const s = store();

            if (method === "GET" && path === "/api/admin/stats") {
                return json(usage.computeStats(await loadIndex(s)));
            }

            if (method === "GET" && path === "/api/admin/sessions") {
                const q = {
                    port: url.searchParams.get("port") || "",
                    vessel: url.searchParams.get("vessel") || "",
                    verdict: url.searchParams.get("verdict") || "",
                    classeApelido: url.searchParams.get("classeApelido") || ""
                };
                return json({ sessions: usage.filterIndex(await loadIndex(s), q) });
            }

            const msgMatch = path.match(/^\/api\/admin\/sessions\/([^/]+)\/messages$/);
            if (method === "POST" && msgMatch) {
                const body = await req.json();
                const session = await loadSession(s, msgMatch[1]);
                if (!session) return json({ error: "sessão não encontrada" }, 404);
                const result = usage.addMessage(session, "admin", body.text, null);
                if (result.error) return json({ error: result.error }, result.status);
                await saveSession(s, result.session);
                return json({ ok: true });
            }

            const oneMatch = path.match(/^\/api\/admin\/sessions\/([^/]+)$/);
            if (method === "GET" && oneMatch) {
                const session = await loadSession(s, oneMatch[1]);
                if (!session) return json({ error: "sessão não encontrada" }, 404);
                return json(session);
            }
        }

        return json({ error: "não encontrado" }, 404);
    } catch (err) {
        return json({ error: err.message || "erro interno" }, 500);
    }
};

export const config = {
    path: [
        "/api/sessions",
        "/api/sessions/inbox",
        "/api/sessions/:id/reply",
        "/api/admin/stats",
        "/api/admin/sessions",
        "/api/admin/sessions/:id",
        "/api/admin/sessions/:id/messages"
    ]
};
