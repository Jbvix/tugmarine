# Controle de Acesso com Token — TUGLIFE Marine

> **Status:** DESABILITADO (v4.2.1) — código preservado em `index.html` como HTML comentado.  
> **Autor:** Jossian Brito | 2026

---

## Visão Geral

O sistema de controle de acesso implementa autenticação baseada em **tokens de uso único** gerados pelo administrador. O objetivo é restringir o acesso ao Command Center e módulos da suíte apenas a utilizadores autorizados (tripulação, engenheiros-chefe).

**Fluxo resumido:**

```
Admin gera token → Envia via WhatsApp → Usuário insere token → Sessão criada → Acesso liberado
```

---

## Arquitetura

### Componentes

| Componente | Localização | Função |
|-----------|-------------|--------|
| Auth Modal | `index.html` (HTML comentado) | UI de login com token + painel admin |
| `initAuth()` | `index.html` `<script>` | Verifica sessão ao carregar a página |
| `verifyAccess()` | `index.html` `<script>` | Valida token contra lista em localStorage |
| `verifyAdmin()` | `index.html` `<script>` | Valida senha mestra para acesso ao painel admin |
| Token Manager | `index.html` `<script>` | CRUD de tokens (gerar, listar, revogar) |

### Persistência (localStorage)

| Chave | Tipo | Conteúdo |
|-------|------|----------|
| `TUGLIFE_SESSION` | Object | `{ name, token, loginDate }` — sessão do usuário autenticado |
| `TUGLIFE_TOKENS` | Array | `[{ name, token, createdAt }, ...]` — lista de tokens ativos |

---

## Fluxo Detalhado

### 1. Inicialização (`initAuth`)

```
Página carrega
  ├── Lê TUGLIFE_SESSION do localStorage
  ├── Se NÃO existe sessão → Exibe modal de login (bloqueante)
  └── Se EXISTE sessão:
      ├── Lê TUGLIFE_TOKENS do localStorage
      ├── Verifica se o token da sessão existe na lista ativa
      ├── Se VÁLIDO → acesso liberado (modal fechado)
      └── Se REVOGADO → logout + reload (modal reaparece)
```

### 2. Login com Token (`verifyAccess`)

```
Usuário insere token no campo
  ├── Token é normalizado (trim + uppercase)
  ├── Busca na lista TUGLIFE_TOKENS
  ├── Se ENCONTRADO:
  │   ├── Cria sessão: { name, token, loginDate }
  │   ├── Salva em TUGLIFE_SESSION
  │   └── Fecha modal → Acesso liberado
  └── Se NÃO ENCONTRADO:
      └── Alert: "Token inválido ou revogado."
```

### 3. Painel Administrativo

#### Acesso (`verifyAdmin`)

```
Admin clica em "Administração" no modal
  ├── Exibe campo de senha mestra
  ├── Compara com MASTER_PASS (hardcoded: "tuglife2026")
  ├── Se CORRETO → Exibe dashboard admin
  └── Se INCORRETO → Alert: "Senha incorreta."
```

#### Geração de Token (`generateToken`)

```
Admin insere nome do usuário
  ├── Gera token aleatório de 6 caracteres (A-Z, 0-9)
  │   └── Math.random().toString(36).substring(2, 8).toUpperCase()
  ├── Cria registro: { name, token, createdAt }
  ├── Adiciona ao array TUGLIFE_TOKENS
  └── Salva em localStorage
```

#### Distribuição de Token

Duas opções de envio:

- **Copiar convite** (`copyInvite`): Copia mensagem formatada para clipboard
- **WhatsApp** (`sendWhatsApp`): Abre `wa.me` com mensagem pré-preenchida

Template da mensagem:
```
Olá *{NOME}*, aqui está seu acesso ao *TUGLIFE Marine Command Center*.

Link: {URL_DA_APP}
Token DE ACESSO: *{TOKEN}*

Insira este token para entrar.
```

#### Revogação de Token (`revokeToken`)

```
Admin clica em revogar
  ├── Confirmação via confirm()
  ├── Remove token do array TUGLIFE_TOKENS
  └── Salva em localStorage
  
  Efeito: Na próxima inicialização, initAuth() detecta token inválido → logout
```

---

## Modelo de Dados

### Token Object

```json
{
  "name": "João Silva",
  "token": "A3F9K2",
  "createdAt": "2026-03-15T10:30:00.000Z"
}
```

### Session Object

```json
{
  "name": "João Silva",
  "token": "A3F9K2",
  "loginDate": "2026-03-15T10:35:00.000Z"
}
```

---

## Interface do Modal

O modal possui 3 estados visuais mutuamente exclusivos:

| Estado | ID | Visível quando |
|--------|-----|----------------|
| Login | `loginState` | Utilizador não autenticado (padrão) |
| Admin Login | `adminLoginState` | Utilizador clica em "Administração" |
| Dashboard | `adminDashboard` | Admin autenticado com senha mestra |

### Navegação entre estados

```
loginState ──(Administração)──→ adminLoginState
adminLoginState ──(Voltar)──→ loginState
adminLoginState ──(Senha OK)──→ adminDashboard  
adminDashboard ──(Sair)──→ loginState
```

---

## Limitações Conhecidas

| Limitação | Descrição | Mitigação Futura |
|-----------|-----------|-----------------|
| **Sem backend** | Tokens armazenados apenas em localStorage do admin | Implementar API com banco de dados |
| **Senha hardcoded** | `MASTER_PASS = "tuglife2026"` visível no código-fonte | Mover para variável de ambiente / backend |
| **Sem expiração** | Tokens não têm data de validade | Adicionar campo `expiresAt` |
| **Sem auditoria** | Não registra logs de login/tentativas falhas | Adicionar logging |
| **Dispositivo-bound** | Tokens só existem no localStorage do dispositivo do admin | Sincronização cloud |
| **XSS risk** | Template literal com `t.name` injeta HTML direto no DOM | Sanitizar nomes antes de render |

---

## Como Reativar

Para reativar o controle de acesso em `index.html`:

1. **Descomentar** o bloco HTML do Auth Modal (entre `<!-- Auth Modal (DISABLED` e `Auth Modal END -->`)
2. **Descomentar** o botão Admin Trigger no footer
3. **Descomentar** a chamada `initAuth()` no `window.onload`

```js
// De:
// initAuth(); // DISABLED - Access control hidden

// Para:
initAuth();
```

---

## Referências

- [index.html](../index.html) — Implementação completa (comentada)
- [arquitetura.md](arquitetura.md) — Documento de arquitetura geral
- LocalStorage keys: `TUGLIFE_SESSION`, `TUGLIFE_TOKENS`
