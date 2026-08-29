# ⚓ TUGLIFE Marine Suite v4.5

> **Engineering & Operations Hub** - A progressive web suite for maritime operations, consolidating calculation, compliance, and logistics into a unified mobile-first interface.

## 📋 Overview

**TUGLIFE Marine** is a high-performance PWA (Progressive Web App) designed to streamline daily tasks for tugboat engineers and captains. It replaces scattered spreadsheets and physical forms with a centralized, persistent, and intelligent digital command center.

**Version:** 4.5 (Consolidated)
**Platform:** Web (Mobile-First / Desktop Compatible)

---

## 🚀 Core Architecture

The suite is built on a modular architecture using Vanilla JavaScript and TailwindCSS, ensuring zero build-step requirements and instant local execution.

### File Structure

```
tugmarine/
├── index.html                      # Command Center (entrada principal)
├── netlify.toml                    # Config de deploy Netlify
├── README.md
│
├── app/                            # Módulos da aplicação
│   ├── calculator.html             # Marine Calculator (Sondagem → Volume)
│   ├── bunkering-assistant.html    # Advanced Bunkering Assistant
│   ├── bunkering-checklist.html    # Checklist Compliance (FOR-OPE-009)
│   ├── validation-log.html         # Auto Validation Log
│   ├── history.html                # Histórico de Operações
│   ├── manual.html                 # User Manual (EN)
│   └── manual-pt.html              # Manual do Utilizador (PT)
│
├── js/                             # Motor de cálculo
│   ├── CalculatorEngine.js         # Interpolação bilinear/linear
│   └── SoundingData.js             # Base de dados de calibração (VESSEL_DATA)
│
├── data/                           # Dados de referência
│   └── bilinear-interpolation.json # Tabelas com correção de trim
│
├── docs/                           # Documentação técnica
│   └── arquitetura.md              # Documento de Arquitetura
│
├── tools/                          # Pipeline de extração de dados
│   ├── extract_excel_tables.py     # Excel → JSON
│   ├── extract_pdf_dump.py         # PDF → texto
│   ├── inspect_excel.py             # Auditoria de planilhas
│   ├── scan_pdf_tanks.py           # Scanner de nomes de tanques
│   └── output/                     # Saídas dos scripts
│
└── sources/                        # Tabelas de sondagem originais
    ├── classe-a/                   # ASD 2411
    ├── classe-c/                   # Hull 323 série + Canindé Hull 321 (livro próprio)
    ├── classe-p/
    ├── classe-t/                   # Rampart 2500
    ├── classe-lh1500/
    └── pdf/                        # PDFs de referência
```

---

## 🛠️ Modules & Features

### 1. 🧮 Marine Calculator (v4.5)

* **Unified Engine:** Supports multiple vessel classes (ASD 2411, Rampart 2500, etc.) with automatic unit detection (cm/mm).
* **Consolidated Log:** Allows registering multiple tank measurements in a single session.
* **Photo Evidence (NEW):**
  * Integrated camera support (`capture="environment"`) to attach photos of sounding tapes directly to the log.
  * Thumbnail previews in the measurement list.
* **Smart Sharing:**
  * **Mobile:** Uses the **Web Share API** to share a complete report text + attached photo files directly to WhatsApp.
  * **Desktop:** detailed text summary generation via WhatsApp Web.
* **Visual Logic:** Dynamic tank visualization showing real-time fill percentage and color-coded alerts.

### 2. ✅ Bunkering Checklist

* **Compliance:** Digitized **FOR-OPE-009** standard.
* **UI/UX:**
  * **Light Mode:** Clean, white-paper aesthetic for readability in direct sunlight.
  * **Radio Logic:** Explicit "Sim / Não / N/A" options for every check.
* **Workflow:** Segregated into Pre-Check, Monitoring (every 30m), and Post-Check phases.
* **Responsiveness:** Optimized specifically for mobile screens (Xiaomi Poco X6 Pro reference) with vertical stacking grids.

### 3. 🛡️ Command Center v4.2 (Admin Controlled)

* **Access Control (NEW):** Restricted access system with "Lock" icon entry.
* **Admin Dashboard:**
  * Protected by Master Password.
  * Generators for unique 6-character access tokens.
  * **WhatsApp Invitations:** Send access tokens directly to crew members via WhatsApp link.
  * **Revocation:** Instantly revoke access for specific tokens.
* **Global Identity:** Persists vessel name, port, and Chief Engineer name across all modules using `LocalStorage`.
* **Navigation:** Central access point to all tools (Calculator, Bunkering, Auto Auditor, History).

---

## 🚢 Supported Classes

The system currently includes calibration tables for:

* **Classe A (ASD 2411)** - *Unit: CM*
* **Classe C genérica Ramparts 3000 (GHS Hull 323)** — *não usar no Canindé*
* **SAAM CRAO / CHARRUA — Hull 323** — mesma GHS No Trim (inclui overflow)
* **SAAM CARAJÁ — Hull 326** — série GHS 323 (carimbo Excel)
* **SAAM CANINDÉ — Hull 321** — livro próprio (FO_DB.P = 3485 mm)
* **STARNAV** — três livros, sem misturar: C407–C414, C398 Altair, C417 Águia
* **Classe P / T / LH1500 / Chile** — sem alteração (sem tabela nova no Drive)

---

## 📱 Mobile Optimization

Technical adjustments made for **Xiaomi Poco X6 Pro 5G** and similar devices:

* **Grid System:** `grid-cols-1` (Mobile) -> `grid-cols-2` (Desktop) automatic switching.
* **Touch Targets:** Enlarged input fields and buttons (48px+ min-height).
* **Viewports:** Proper safe-area padding and `meta viewport` configuration.

---

## 💻 Technical Stack

* **Core:** HTML5, JavaScript (ES6 Modules)
* **Styling:** TailwindCSS (CDN)
* **Icons:** Lucide Icons
* **Persistence:** `window.localStorage`
* **Sharing:** `navigator.share` (Level 2)

## 👤 Author

**Jossian Brito** | 2026
*Marine Operations Hub*

## Licença e Copyright

**Copyright (c) 2026 Jossian Brito**

Este projeto é licenciado sob a **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

- Uso comercial não é permitido sem autorização expressa prévia do autor.
- A atribuição ao autor original é obrigatória.

O texto completo da licença está no arquivo [LICENSE](LICENSE).