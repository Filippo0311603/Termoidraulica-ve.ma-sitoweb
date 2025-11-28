from PIL import Image
import os

# CONFIGURAZIONE FILE
# Mappiamo il file originale -> larghezza desiderata (pixel)
TARGETS = [
   # (Percorso File, Larghezza Max, Qualità)
    
    # 1. IMMAGINI PRINCIPALI
    ("src/logoo.png", 150, 90),       # Logo
    
    # ATTENZIONE: Se hai spostato hero in public come suggerito, usa questa riga:
    ("public/hero.webp", 1200, 70),   # Hero (Quality 70 è ok per sfondi scuri)
    # Se invece è ancora in src, usa: ("src/hero.webp", 1200, 70),

    ("src/negozio.webp", 800, 75),    # Chi Siamo

    # 2. IMMAGINI FORNITURE (Quelle che Lighthouse segnalava!)
    ("src/foto-forniture.webp", 600, 75),
    ("src/foto-forniture2.webp", 600, 75),
    # Attenzione allo spazio nel nome del file se presente nel tuo sistema
    ("src/foto forniture3.webp", 600, 75),
]

def ridimensiona_tutto():
    print("🖼️  INIZIO OTTIMIZZAZIONE IMMAGINI...")

    for file_path, target_width, quality in TARGETS:
        if not os.path.exists(file_path):
            print(f"❌ File non trovato: {file_path}")
            continue

        try:
            with Image.open(file_path) as img:
                # Calcola il peso originale
                size_old = os.path.getsize(file_path) / 1024 # KB

                # Se l'immagine è già più piccola del target, saltala
                if img.size[0] <= target_width:
                    print(f"⏭️  {file_path} è già ottimizzata ({img.size[0]}px).")
                    continue

                # Calcola la nuova altezza mantenendo le proporzioni (aspect ratio)
                ratio = target_width / float(img.size[0])
                new_height = int((float(img.size[1]) * float(ratio)))

                # Ridimensiona (Usa LANCZOS per alta qualità)
                img_resized = img.resize((target_width, new_height), Image.Resampling.LANCZOS)

                # Salva sovrascrivendo il file originale
                # Se è PNG mantiene la trasparenza, se è WEBP usa la qualità specificata
                if file_path.endswith(".png"):
                    img_resized.save(file_path, optimize=True)
                else:
                    img_resized.save(file_path, quality=quality, optimize=True)

                # Calcola nuovo peso
                size_new = os.path.getsize(file_path) / 1024 # KB
                risparmio = size_old - size_new
                
                print(f"✅ {file_path}: {int(size_old)}KB -> {int(size_new)}KB (Risparmiati {int(risparmio)}KB)")

        except Exception as e:
            print(f"⚠️ Errore su {file_path}: {e}")

    print("✨ Finito! Ora lancia 'npm run build' per vedere la differenza.")

if __name__ == "__main__":
    ridimensiona_tutto()