# **Documento de Arquitetura \- TUGLIFE Marine Suite**

**Autor:** Jossian Brito

**Versão:** 3.8 (Arquitetura Final de Produção)

**Data:** 06/01/2026

## **1\. Estrutura de Diretórios (Logical View)**

O sistema é composto por ficheiros independentes que se comunicam via LocalStorage:

* index.html → **Command Center**: Gestão de rotas e estado global.  
* calculator.html → **Módulo de Rotina**: Motor de interpolação bilinear (ROB).  
* assistant.html → **Módulo Logístico**: Planeamento de carga e lotes 5k/50L.  
* checklist.html → **Módulo de Compliance**: Formulário FOR-OPE-009 com assinaturas.  
* manual.html → **Módulo de Conhecimento**: Documentação técnica offline.  
* history.html → **Módulo de Dados**: Gestão de registos históricos em JSON.

## **2\. Camada de Persistência (LocalStorage Engine)**

Para garantir que o Rebocador selecionado no portal apareça automaticamente nos outros módulos, utilizamos o seguinte Schema:

### **2.1 Global State (Sincronização)**

Key: TUGLIFE\_GLOBAL

{  
  "vessel": "REBOCADOR CANINDÉ",  
  "port": "PORTO DE SANTOS",  
  "class": "C",  
  "last\_access": "2026-01-06T10:00:00Z"  
}

### **2.2 History Registry (Coleção)**

Key: TUGLIFE\_HISTORY

\[  
  {  
    "id": "BUNK-12345",  
    "type": "BUNKERING",  
    "timestamp": "2026-01-06T10:00:00Z",  
    "vessel": "REBOCADOR CANINDÉ",  
    "total\_lts": 15000,  
    "details": \[ ...lista\_tanques\_e\_reguas... \]  
  }  
\]

## **3\. Especificações Técnicas (Standardization)**

* **Frontend:** Tailwind CSS (via CDN para desenvolvimento / Local para produção).  
* **Icons:** Lucide Icons (Renderização SVG tática).  
* **Matemática:** JavaScript ES6 (Math functions para interpolação bilinear).  
* **Gráficos:** CSS Flexbox/Grid para visualização de volumetria de tanques.

## **4\. Matriz de Segurança e Regras de Negócio**

1. **Safety Clamp:** Volume autorizado \= $\\text{Capacidade} \\times 0.95$.  
2. **Logistics Mask:** Arredondamento forçado de 50L por tanque.  
3. **Bunker Mask:** Arredondamento global para múltiplos de 5000L.  
4. **Signature Pad:** Captura de coordenadas em tempo real no Canvas.

## **5\. Roadmap de Desenvolvimento (Status)**

1. \[x\] Modularização de Ecrãs (v2.3)  
2. \[x\] Integração Total de Inventário (v2.5)  
3. \[x\] Seleção Seletiva de Tanques no Assistente (v3.4)  
4. \[x\] Manual e Interface de Histórico (v3.6)  
5. \[x\] Arquitetura de Persistência LocalStorage (v3.8)  
6. \[ \] Implementação de PWA / Modo Instalável (Pendente)