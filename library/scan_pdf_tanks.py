import pypdf
import os

pdf_name = "Tabela de Sondagem - Trim_Crao_Caraja_Charrua_Caiapo_Caripuna_OCR.pdf"

if os.path.exists(pdf_name):
    try:
        reader = pypdf.PdfReader(pdf_name)
        print(f"Scanning {len(reader.pages)} pages...")
        with open("tank_scan_results_utf8.txt", "w", encoding="utf-8") as f:
             for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    lines = text.split('\n')
                    for line in lines:
                        if "TANK" in line.upper():
                            f.write(f"Page {i+1}: {line.strip()}\n")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("PDF not found")
