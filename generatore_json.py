import pandas as pd
import json
import os
import re

# --- CONFIGURAZIONE ---
CSV_FOLDER = 'dati_csv'
IMAGES_FOLDER = 'public/images' 
OUTPUT_DIR = 'public' # Cartella di destinazione
FILE_LITE = os.path.join(OUTPUT_DIR, 'products_lite.json')
FILE_FULL = os.path.join(OUTPUT_DIR, 'products.json')

# FILE INPUT
FILE_LISTINO = os.path.join(CSV_FOLDER, 'CARGRO_Listino.csv')
FILE_CATEGORIE = os.path.join(CSV_FOLDER, 'CARGRO_Categorie.csv')
FILE_GIACENZE = os.path.join(CSV_FOLDER, 'CARGRO_Giacenze.csv')
FILE_PRODUTTORI = os.path.join(CSV_FOLDER, 'CARGRO_CodiciProduttori.csv')

def get_smart_image_path(codice_originale, file_list):
    if not codice_originale: return None
    codice_pulito = str(codice_originale).strip()
    possibili_nomi = []

    # STRATEGIA A: Codice Esatto
    possibili_nomi.append(codice_pulito)
    # STRATEGIA B: Padding zeri
    for i in range(1, 4): possibili_nomi.append(f"{'0'*i}{codice_pulito}")
    # STRATEGIA C: Taglio Varianti
    if len(codice_pulito) > 4:
        possibili_nomi.append(codice_pulito[:-1])
        possibili_nomi.append(codice_pulito[:-2])
        possibili_nomi.append(codice_pulito[:-3])
    # STRATEGIA D: Rimuovi lettere finali
    base_senza_lettere = re.sub(r'[A-Za-z]+$', '', codice_pulito)
    if base_senza_lettere != codice_pulito:
        possibili_nomi.append(base_senza_lettere)
        for i in range(1, 3): possibili_nomi.append(f"{'0'*i}{base_senza_lettere}")

    estensioni = ['.jpg', '.JPG', '.png', '.PNG', '.jpeg', '.JPEG', '.webp']
    for nome in possibili_nomi:
        for ext in estensioni:
            test_file = f"{nome}{ext}"
            if test_file in file_list: return test_file
    return None

def run_etl():
    print("🔄 Inizio elaborazione dati...")

    # 1. Indicizzazione Immagini
    try:
        files_reali = set(os.listdir(IMAGES_FOLDER))
        print(f"📂 Immagini trovate: {len(files_reali)}")
    except FileNotFoundError:
        print(f"❌ ERRORE: Cartella {IMAGES_FOLDER} non trovata.")
        return

    # 2. Lettura CSV (Gestione Encoding)
    try:
        try:
            print("📖 Provo lettura UTF-8...")
            df_listino = pd.read_csv(FILE_LISTINO, sep=';', encoding='utf-8', dtype=str, decimal=',')
            df_cat = pd.read_csv(FILE_CATEGORIE, sep=';', encoding='utf-8', dtype=str)
            df_giac = pd.read_csv(FILE_GIACENZE, sep=';', encoding='utf-8', dtype=str)
            df_prod = pd.read_csv(FILE_PRODUTTORI, sep=';', encoding='utf-8', dtype=str)
        except UnicodeDecodeError:
            print("⚠️ UTF-8 fallito, passo a Latin1...")
            df_listino = pd.read_csv(FILE_LISTINO, sep=';', encoding='latin1', dtype=str, decimal=',')
            df_cat = pd.read_csv(FILE_CATEGORIE, sep=';', encoding='latin1', dtype=str)
            df_giac = pd.read_csv(FILE_GIACENZE, sep=';', encoding='latin1', dtype=str)
            df_prod = pd.read_csv(FILE_PRODUTTORI, sep=';', encoding='latin1', dtype=str)
        
        # Pulizia nomi colonne
        for df in [df_listino, df_cat, df_giac, df_prod]:
            df.columns = df.columns.str.strip()
            
    except Exception as e:
        print(f"❌ Errore apertura CSV: {e}")
        return

    # 3. Merging
    print("🔗 Unione tabelle...")
    df_merged = pd.merge(df_listino, df_cat, left_on='CAT.', right_on='Codice', how='left', suffixes=('', '_CAT'))
    df_merged = pd.merge(df_merged, df_giac, on='Codice', how='left', suffixes=('', '_GIAC'))
    df_merged = pd.merge(df_merged, df_prod, left_on='Codice', right_on='Codice_Interno', how='left', suffixes=('', '_EXTRA'))

    products_list = []
    
    print("🚀 Elaborazione righe...")
    for index, row in df_merged.iterrows():
        codice = str(row.get('Codice', '')).strip()
        if not codice: continue

        # Gestione Prezzo
        try:
            val = str(row.get('Prezzo', '0')) # Prezzo listino
            val_pulita = val.replace('€', '').replace('.', '').replace(',', '.')
            val_float = float(val_pulita)
            if val_float == 0: prezzo_fmt = "Su Richiesta"
            else: prezzo_fmt = f"€{val_float:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        except: prezzo_fmt = "Su Richiesta"

        # Gestione Immagine
        nome_img = get_smart_image_path(codice, files_reali)
        img_path = f"/images/{nome_img}" if nome_img else "https://via.placeholder.com/600x400?text=No+Image"

        # Specs
        specs = []
        if pd.notna(row.get('Produttore')): specs.append(f"Marca: {row.get('Produttore')}")
        if pd.notna(row.get('BarCode')): specs.append(f"EAN: {str(row.get('BarCode')).replace('.0', '')}")
        
        # Stock
        try: stock = int(float(str(row.get('Giacenza', '0')).replace(',', '.')))
        except: stock = 0

        products_list.append({
            "id": codice,
            "category": row.get('Descrizione_CAT', "Generico"),
            "name": row.get('Descrizione', 'Articolo'),
            "price": prezzo_fmt,
            "image": img_path,
            "desc": row.get('Note') if pd.notna(row.get('Note')) else row.get('Descrizione'),
            "specs": specs,
            "stock": stock
        })

    # 4. OUTPUT OTTIMIZZATO (QUI LA MAGIA PER LIGHTHOUSE!)
    print(f"📊 REPORT: {len(products_list)} prodotti totali.")
    
    try:
        # A. FILE LITE: Solo 12 prodotti e SOLO campi essenziali (niente descrizioni lunghe)
        lite_data = []
        for p in products_list[:12]: # Prendiamo solo i primi 12
            lite_data.append({
                "id": p["id"],
                "name": p["name"],
                "category": p["category"],
                "price": p["price"],
                "image": p["image"],
                "stock": p["stock"]
                # NOTA: Ho rimosso 'desc' e 'specs' per rendere il file leggerissimo
            })

        with open(FILE_LITE, 'w', encoding='utf-8') as f:
            json.dump(lite_data, f, ensure_ascii=False, separators=(',', ':'))
        print(f"⚡ File Lite salvato: {FILE_LITE} (Peso piuma!)")

        # B. FILE FULL: Tutto il database
        with open(FILE_FULL, 'w', encoding='utf-8') as f:
            json.dump(products_list, f, ensure_ascii=False, separators=(',', ':'))
        print(f"💾 File Completo salvato: {FILE_FULL}")

    except Exception as e:
        print(f"❌ Errore salvataggio JSON: {e}")

if __name__ == "__main__":
    run_etl()