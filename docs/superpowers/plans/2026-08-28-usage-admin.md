# Usage Admin Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Let any SAAM Brasil chemaq submit a correct/incorrect ROB session and let the author review and reply from `/app/admin`.

**Architecture:** Static Command Center + calculator POST to Netlify Functions. Sessions live in site-scoped Blobs. Admin PIN is only on the server.

**Tech Stack:** Vanilla HTML/JS, Netlify Functions, `@netlify/blobs`, Tailwind CDN.

## Global Constraints

- Âmbito: todas as filiais SAAM Brasil da spec, não só São Luís.
- Sem email, WhatsApp, Identity, fotos no servidor.
- Classe apelido não escolhe tabela de sondagem.
- `ADMIN_PIN` via `Netlify.env.get`, nunca hardcoded.
- Redirect `/*` sem `force`.

## Files

- `data/branches.js`, `data/fleet.js` — listas oficiais
- `netlify/functions/_shared/usage.js` — validação, stats, mensagens
- `netlify/functions/api.js` — rotas `/api/*`
- `app/admin.html`, `app/calculator.html`, `index.html`
- `tools/test_usage_api.js`
- `package.json`, `.gitignore`, `netlify.toml`, `README.md`
