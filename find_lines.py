filename = "SoundingData.js"
with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Smit Carajá" in line or "Smit Craó" in line or "Classe 320" in line or "HULL 320" in line:
        print(f"{i+1}: {line.strip()}")
