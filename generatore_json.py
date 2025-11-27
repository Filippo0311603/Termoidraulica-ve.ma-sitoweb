import pandas as pd
import json
import os
import re

# --- CONFIGURAZIONE ---
CSV_FOLDER = 'dati_csv'
IMAGES_FOLDER = 'public/images' 
OUTPUT_FILE = 'public/products.json'

# FILE
FILE_LISTINO = os.path.join(CSV_FOLDER, 'CARGRO_Listino.csv')
FILE_CATEGORIE = os.path.join(CSV_FOLDER, 'CARGRO_Categorie.csv')
FILE_GIACENZE = os.path.join(CSV_FOLDER, 'CARGRO_Giacenze.csv')
FILE_PRODUTTORI = os.path.join(CSV_FOLDER, 'CARGRO_CodiciProduttori.csv')

def get_smart_image_path(codice_originale, file_list):
    """
    Cerca l'immagine con varie strategie:
    1. Esatta
    2. Con zeri davanti
    3. Rimuovendo suffisso (varianti)
    """
    if not codice_originale: return None
    
    codice_pulito = str(codice_originale).strip()
    possibili_nomi = []

    # STRATEGIA A: Codice Esatto
    possibili_nomi.append(codice_pulito)

    # STRATEGIA B: Padding con zeri (es. 100 -> 00100)
    for i in range(1, 4):
        possibili_nomi.append(f"{'0'*i}{codice_pulito}")

    # STRATEGIA C: Taglio Varianti (es. 7300802 -> 730080 -> 73008)
    if len(codice_pulito) > 4:
        possibili_nomi.append(codice_pulito[:-1])
        possibili_nomi.append(codice_pulito[:-2])
        possibili_nomi.append(codice_pulito[:-3])

    # STRATEGIA D: Rimuovi lettere finali (es. 100B -> 100)
    base_senza_lettere = re.sub(r'[A-Za-z]+$', '', codice_pulito)
    if base_senza_lettere != codice_pulito:
        possibili_nomi.append(base_senza_lettere)
        for i in range(1, 3):
            possibili_nomi.append(f"{'0'*i}{base_senza_lettere}")

    # CONTROLLO FINALE NEL FILE SYSTEM
    estensioni = ['.jpg', '.JPG', '.png', '.PNG', '.jpeg', '.JPEG']
    
    for nome in possibili_nomi:
        for ext in estensioni:
            test_file = f"{nome}{ext}"
            if test_file in file_list:
                return test_file
    
    return None

def run_etl():
    print("🔄 Inizio elaborazione dati (Versione Prezzo Corretto)...")

    # 1. Indicizzazione Immagini
    try:
        files_reali = set(os.listdir(IMAGES_FOLDER))
        print(f"📂 Immagini fisiche disponibili: {len(files_reali)}")
    except FileNotFoundError:
        print(f"❌ ERRORE: Cartella {IMAGES_FOLDER} non trovata.")
        return

    # 2. Lettura CSV
    try:
        df_listino = pd.read_csv(FILE_LISTINO, sep=';', encoding='latin1', dtype=str, decimal=',')
        df_cat = pd.read_csv(FILE_CATEGORIE, sep=';', encoding='latin1', dtype=str)
        df_giac = pd.read_csv(FILE_GIACENZE, sep=';', encoding='latin1', dtype=str)
        df_prod = pd.read_csv(FILE_PRODUTTORI, sep=';', encoding='latin1', dtype=str)
        
        for df in [df_listino, df_cat, df_giac, df_prod]:
            df.columns = df.columns.str.strip()
            
    except Exception as e:
        print(f"❌ Errore CSV: {e}")
        return

    # 3. Merging
    print("🔗 Unione dati...")
    df_merged = pd.merge(df_listino, df_cat, left_on='CAT.', right_on='Codice', how='left', suffixes=('', '_CAT'))
    df_merged = pd.merge(df_merged, df_giac, on='Codice', how='left', suffixes=('', '_GIAC'))
    df_merged = pd.merge(df_merged, df_prod, left_on='Codice', right_on='Codice_Interno', how='left', suffixes=('', '_EXTRA'))

    products_list = []
    stats_img = 0

    print("🚀 Generazione JSON...")
    
    for index, row in df_merged.iterrows():
        codice = str(row.get('Codice', '')).strip()
        if not codice: continue

        # --- CORREZIONE PREZZO ---
        # Prima prendeva 'PrezzoDefinitivo'. Ora prende 'Prezzo' (Listino)
        try:
            # Leggiamo la colonna 'Prezzo'
            val = str(row.get('Prezzo', '0'))
            # Pulizia formato (via simbolo €, via punti migliaia, virgola diventa punto)
            val_pulita = val.replace('€', '').replace('.', '').replace(',', '.')
            
            # Convertiamo in numero
            val_float = float(val_pulita)
            
            # Riformattiamo in Euro leggibile (es. 1.200,50)
            # Se il prezzo è 0, mettiamo "Su Richiesta"
            if val_float == 0:
                prezzo_fmt = "Su Richiesta"
            else:
                prezzo_fmt = f"€{val_float:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        except:
            prezzo_fmt = "Su Richiesta"

        # Immagine
        nome_img = get_smart_image_path(codice, files_reali)
        if nome_img:
            img_path = f"/images/{nome_img}"
            stats_img += 1
        else:
            img_path = "https://via.placeholder.com/600x400?text=No+Image"

        # Specifiche
        specs = []
        produttore = row.get('Produttore', '')
        if pd.notna(produttore) and produttore: specs.append(f"Marca: {produttore}")
        if pd.notna(row.get('BarCode')): specs.append(f"EAN: {str(row.get('BarCode')).replace('.0', '')}")
        
        try:
            h = float(str(row.get('Altezza cm', '0')).replace(',', '.'))
            if h > 0:
                dims = f"{row.get('Altezza cm')}x{row.get('Larghezza cm')}x{row.get('Lunghezza cm')} cm"
                specs.append(f"Dim: {dims}")
        except: pass

        # Giacenza
        try:
            stock = int(float(str(row.get('Giacenza', '0')).replace(',', '.')))
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

    # 4. Output (MODIFICATO PER SPLITTING)
    print(f"📊 REPORT FINALE:")
    print(f"✅ Prodotti Totali: {len(products_list)}")
    
    try:
        # SALVATAGGIO 1: File Lite (solo i primi 24 prodotti per avvio istantaneo)
        file_lite = 'public/products_lite.json'
        with open(file_lite, 'w', encoding='utf-8') as f:
            json.dump(products_list[:24], f, ensure_ascii=False, separators=(',', ':'))
        print(f"⚡ File Lite salvato ({len(products_list[:24])} prodotti).")

        # SALVATAGGIO 2: File Completo (tutto il resto)
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(products_list, f, ensure_ascii=False, separators=(',', ':'))
        print(f"💾 File Completo salvato in {OUTPUT_FILE}.")

    except Exception as e:
        print(f"❌ Errore salvataggio: {e}")

if __name__ == "__main__":
    run_etl()