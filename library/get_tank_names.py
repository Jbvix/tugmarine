import pypdf
import os

pdf_name = "Tabela de Sondagem - Trim_Crao_Caraja_Charrua_Caiapo_Caripuna_OCR.pdf"

if os.path.exists(pdf_name):
    try:
        reader = pypdf.PdfReader(pdf_name)
        print(f"Total Pages: {len(reader.pages)}")
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            # Print first 200 chars to see headers/tank names
            header = text[:300].replace('\n', ' | ')
            print(f"Page {i+1}: {header}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print(f"File {pdf_name} not found.")
