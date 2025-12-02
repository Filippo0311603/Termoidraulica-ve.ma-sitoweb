from PIL import Image
import os

# CONFIGURAZIONE FILE
# Mappiamo il file originale -> larghezza desiderata (pixel)
TARGETS = [
   # (Percorso File, Larghezza Max, Qualità)
    
    # 1. IMMAGINI PRINCIPALI
    ("public/logoo.png", 150, 90),       # Logo
    
    # ATTENZIONE: Se hai spostato hero in public come suggerito, usa questa riga:
    ("public/hero.webp", 1200, 70),   # Hero (Quality 70 è ok per sfondi scuri)
    # Se invece è ancora in src, usa: ("src/hero.webp", 1200, 70),

    ("src/assets/images/negozio.webp", 800, 75),    # Chi Siamo

    # 2. IMMAGINI FORNITURE (Quelle che Lighthouse segnalava!)
    ("src/assets/images/foto-forniture.webp", 382, 60),
    ("src/assets/images/foto-forniture2.webp", 382, 60),
    # Attenzione allo spazio nel nome del file se presente nel tuo sistema
    ("src/assets/images/foto forniture3.webp", 382, 60),
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

                img_to_save = img

                # Se l'immagine è più grande del target, ridimensiona
                if img.size[0] > target_width:
                    # Calcola la nuova altezza mantenendo le proporzioni (aspect ratio)
                    ratio = target_width / float(img.size[0])
                    new_height = int((float(img.size[1]) * float(ratio)))
                    # Ridimensiona (Usa LANCZOS per alta qualità)
                    img_to_save = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
                else:
                    print(f"ℹ️  {file_path} dimensioni ok ({img.size[0]}px), ottimizzo solo qualità.")

                # Salva sovrascrivendo il file originale
                # Se è PNG mantiene la trasparenza, se è WEBP usa la qualità specificata
                if file_path.endswith(".png"):
                    img_to_save.save(file_path, optimize=True)
                else:
                    img_to_save.save(file_path, quality=quality, optimize=True)

                # Calcola nuovo peso
                size_new = os.path.getsize(file_path) / 1024 # KB
                risparmio = size_old - size_new
                
                print(f"✅ {file_path}: {int(size_old)}KB -> {int(size_new)}KB (Risparmiati {int(risparmio)}KB)")

        except Exception as e:
            print(f"⚠️ Errore su {file_path}: {e}")

    print("✨ Finito! Ora lancia 'npm run build' per vedere la differenza.")

if __name__ == "__main__":
    ridimensiona_tutto()