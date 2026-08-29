# Spec: validação de uso e admin (filiais SAAM Brasil)

**Data:** 2026-08-28  
**App:** TUGLIFE Marine v4.5 — https://tugmarine.netlify.app  
**Estado:** aprovado em conversa (fluxo, dados, frota oficial)  
**Âmbito:** todas as filiais SAAM Towage no Brasil — não é exclusivo de São Luís.

## Problema

O autor precisa ver, em qualquer filial do Brasil, quem usou a calculadora, qual saldo saiu, se o chemaq marcou o resultado como correto, e poder responder-lhe no próprio app — sem email e sem WhatsApp.

## Fora de âmbito

- Email, WhatsApp, Netlify Identity
- Envio de fotos de sondagem para o servidor
- Inventar tabelas de sondagem (Hugo, Philippe, A/T/P sem livro no Drive)
- Alterar interpolação GHS/Detroit já publicada

## Utilizador (chemaq)

1. No Command Center escolhe o **rebocador na lista oficial da frota** e a **filial/porto SAAM Brasil** (listas, não texto livre). O nome do chemaq continua livre.
2. Na calculadora monta o log de tanques e o total.
3. Com total > 0, aparece: **Resultado correto** / **Resultado incorreto** + comentário opcional. Um veredito por sessão (saldo consolidado).
4. O envio grava a sessão no servidor. O telemóvel guarda `deviceSessionId` em `localStorage` (`TUGLIFE_DEVICE_ID`).
5. Se o admin tiver respondido, a calculadora mostra um aviso no topo com a mensagem. O chemaq pode responder na mesma thread.

Identidade da sessão: navio oficial + IMO/MMSI/classe apelido da frota + filial SAAM Brasil + chemaq + device id. Uma sessão em Santos e outra em Itaqui são independentes; o admin vê as duas.

## Admin

- URL: `/app/admin.html` (não há atalho no Command Center; o autor guarda o endereço).
- Entrada com PIN (`ADMIN_PIN` no Netlify). Sem PIN correto, a API admin devolve 401.
- Números: sessões totais, sessões hoje, filiais distintas, navios distintos, chemaq distintos, % correto / incorreto. Os totais são nacionais, com breakdown por filial.
- Lista filtrável por filial, navio, classe apelido, veredito, data.
- Detalhe: identidade, tanques (sondagem + litros), total, veredito, comentário, thread. Campo para escrever. A mensagem fica `unread` para o device até ele abrir a calculadora.

## Frota oficial

A planilha de frota (VESSEL, IMO, MMSI, YEAR, faixa de idade, BP, PROP, FIFI, design class, classe apelido) passa a `data/fleet.js` (`FLEET_VESSELS`). Transcrever só o que a captura mostra com clareza; não inventar IMO/MMSI. O autor pode completar linhas depois.

- O select de rebocador usa `VESSEL` (ex.: `SAAM CRAÓ`, `SAAM CANINDÉ`).
- A sessão guarda `vessel`, `imo`, `mmsi`, `classeApelido`, `designClass`.
- A classe apelido **não escolhe** a tabela de sondagem. A calculadora continua com as chaves atuais (`321_CANINDE`, `320_CRAO`, `C407_STARNAV`, …). A frota só identifica o casco para o admin.
- Hugo / Philippe entram na lista de identidade; não recebem livro de sondagem novo.

## Filiais SAAM Brasil

`data/branches.js` (`SAAM_BRANCHES`) — select de porto/filial no Command Center. Lista inicial (completar se faltar alguma):

Santos, Itaguaí, Rio de Janeiro, Angra dos Reis, Vitória, Tubarão, Salvador, Ilhéus, Aracaju, Maceió, Recife, Suape, Natal, Fortaleza, Pecém, São Luís (Itaqui), Belém, Manaus, Paranaguá, São Francisco do Sul, Itajaí, Imbituba, Rio Grande.

- A sessão guarda `port` exatamente como na lista (ex.: `Santos`, `São Luís (Itaqui)`).
- Sem filial da lista → 400 no `POST /api/sessions`.
- São Luís é uma filial entre as outras; não há lógica, filtro default, nem campanha exclusiva.

Mapeamento só informativo (admin / notas), não automático no motor:

| Classe apelido | Livro na calculadora (se existir) |
|---|---|
| Classe 3.000 - C | GHS 323 (Crao/Charrua/…) ou `321_CANINDE` |
| Classe 80 CAT / 80 MTU / 70 MTU | livros STARNAV C407 / C417 / C398 |
| Classe 2.500 - T / P, Classe A, INACE FIFI | só o que já está no JS |

## API

Funções Netlify, path `/api/...`. Redirect `/* → index.html` **sem** `force`; ficheiros em `/app/` e funções `/api/` não são engolidos.

| Método | Path | Auth | Função |
|---|---|---|---|
| POST | `/api/sessions` | nenhuma | Cria sessão (identidade + tanques + total + veredito + device id) |
| GET | `/api/sessions/inbox?device=` | device id | Sessões desse device com mensagens (para o banner) |
| POST | `/api/sessions/:id/reply` | device id no body | Resposta do chemaq |
| GET | `/api/admin/stats` | header `X-Admin-Pin` | Totais |
| GET | `/api/admin/sessions` | PIN | Lista + filtros query |
| GET | `/api/admin/sessions/:id` | PIN | Detalhe |
| POST | `/api/admin/sessions/:id/messages` | PIN | Mensagem do admin |

Corpo de `POST /api/sessions`:

```json
{
  "deviceId": "uuid",
  "vessel": "SAAM CRAÓ",
  "imo": "9457438",
  "mmsi": "710005670",
  "classeApelido": "Classe 3.000 - C",
  "designClass": "RA 3.000 - DETROIT",
  "port": "Santos",
  "chemaq": "Nome",
  "calcClassId": "320_CRAO",
  "calcClassName": "SAAM CRAO — Hull 323",
  "tanks": [{ "tankId": "FO_DAY.P", "tankName": "Serviço BB", "sounding": 129, "volume": 10283 }],
  "totalLiters": 57438,
  "verdict": "correct",
  "comment": ""
}
```

`verdict` só aceita `correct` | `incorrect`. `totalLiters` deve ser a soma dos tanques (servidor recalcula e usa a soma). Sem `vessel` da frota, sem `port` da lista de filiais, ou sem tanques → 400. `GET /api/admin/sessions` aceita `?port=`.

## Persistência

Store Netlify Blobs `tugmarine-usage`, consistência `strong`.

- `session:{id}` — documento da sessão + `messages[]`
- `index` — array leve para lista/stats (id, datas, port, navio, chemaq, veredito, total, unread flags)

Volume esperado: sessões de todas as filiais. Se o índice ficar pesado, migrar para Netlify Database sem mudar o contrato da API.

## Segurança e erros

- PIN só no servidor (`Netlify.env.get("ADMIN_PIN")`). Nunca no JS do admin em claro; o PIN fica em `sessionStorage` do browser depois do login da página e vai no header.
- Sem PIN configurado, rotas admin respondem 503.
- Rate limit simples em memória da função: máximo 30 POST `/api/sessions` por IP / 10 min (melhor esforço).
- Rede em falha na calculadora: o botão mostra erro e o log local não se apaga; o chemaq pode reenviar.
- Inbox falha em silêncio (banner ausente); não bloqueia o cálculo.

## Testes mínimos

- POST sessão Crao com 2 tanques → total = soma, aparece no admin.
- Veredito `correct` incrementa % correto.
- Mensagem admin → inbox do mesmo `deviceId` devolve a mensagem; outro device não vê.
- Reply com device errado → 403.
- GET admin sem PIN → 401.
- Select do Command Center só lista nomes de `FLEET_VESSELS` e filiais de `SAAM_BRANCHES`.
- Duas sessões do mesmo navio em filiais diferentes (ex.: Santos e Itaqui) aparecem as duas no admin; o filtro `?port=Santos` esconde a de Itaqui.

## Ficheiros a criar/alterar

- `data/fleet.js` — catálogo da planilha
- `data/branches.js` — filiais SAAM Brasil
- `netlify/functions/sessions.mts` (e admin no mesmo handler ou `_shared/`)
- `app/admin.html`
- `app/calculator.html` — barra de veredito + banner
- `index.html` — select da frota e da filial
- `netlify.toml` — garantir `/api/*` e `/app/*`
- `.env` local não vai para o git; documentar `ADMIN_PIN` no README
