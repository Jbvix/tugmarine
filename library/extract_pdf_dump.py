import pypdf
import os

pdf_name = "Tabela de Sondagem - Trim_Crao_Caraja_Charrua_Caiapo_Caripuna_OCR.pdf"

print("CWD:", os.getcwd())
print("Files in CWD:")
for f in os.listdir("."):
    print(f" - {f}")

    with open("pdf_dump_utf8.txt", "w", encoding="utf-8") as f:
        if os.path.exists(pdf_name):
            f.write(f"File '{pdf_name}' FOUND.\n")
            try:
                reader = pypdf.PdfReader(pdf_name)
                f.write(f"Total Pages: {len(reader.pages)}\n")
                for i, page in enumerate(reader.pages):
                    f.write(f"--- Page {i+1} ---\n")
                    f.write(page.extract_text())
                    f.write("\n----------------\n")
            except Exception as e:
                f.write(f"Error reading PDF: {e}\n")
        else:
            f.write(f"File '{pdf_name}' NOT FOUND.\n")
