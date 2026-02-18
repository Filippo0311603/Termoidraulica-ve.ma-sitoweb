/**
 * ============================================================
 * MOTORE DI RICERCA AVANZATO - Ver. 2.0
 * Stile Amazon/B2B per catalogo termoidraulico
 * ============================================================
 *
 * Funzionalità:
 *  - Dizionario sinonimi specifico per il settore idrotermosanitario
 *  - Normalizzazione testo (accenti, maiuscole, caratteri speciali)
 *  - Ricerca multi-token con logica AND (tutti i termini devono matchare)
 *  - Scoring ponderato: codice > nome > categoria > specs/marca > descrizione
 *  - Match parziale (substring) oltre al match esatto di parola
 *  - Fuzzy matching (Levenshtein) come fallback per tolleranza ai typo
 *  - Boost per brand riconosciuti e match codice articolo
 *  - Risultati ordinati per punteggio (più rilevante prima)
 */

import type { Product } from '../types';

// ─────────────────────────────────────────────
// 1. DIZIONARIO SINONIMI (IT → termini tecnici)
// ─────────────────────────────────────────────
// Chiave = termine che l'utente potrebbe usare
// Valore = lista di termini tecnici equivalenti nel catalogo

const SYNONYMS: Record<string, string[]> = {
    // ── Sanitari / WC ──────────────────────────────────────
    tazza:        ['wc', 'water', 'vaso', 'sanitari', 'toilette', 'gabinetto'],
    water:        ['wc', 'tazza', 'vaso', 'sanitari', 'toilette'],
    toilette:     ['wc', 'water', 'tazza', 'vaso', 'sanitari'],
    gabinetto:    ['wc', 'water', 'tazza', 'sanitari'],
    cesso:        ['wc', 'water', 'tazza', 'sanitari'],
    sanitario:    ['wc', 'water', 'tazza', 'lavabo', 'bidet', 'ceramica'],
    ceramica:     ['sanitari', 'wc', 'lavabo', 'bidet', 'piatto'],
    vaso:         ['wc', 'water', 'tazza', 'sanitari', 'vasi', 'espansione', 'autoclave'],
    sospesi:      ['sospeso', 'pensile', 'parete'],

    // ── Cassette / Scarico ──────────────────────────────────
    cassetta:     ['cassette', 'incasso', 'zaino', 'scarico'],
    cassette:     ['cassetta', 'incasso', 'zaino', 'scarico'],
    incasso:      ['cassetta', 'cassette', 'sigma', 'omega', 'duofix', 'combifix'],
    fantasma:     ['incasso', 'cassetta', 'scomparsa', 'sigma', 'omega'],
    scomparsa:    ['incasso', 'cassetta', 'sigma', 'omega', 'fantasma'],
    zaino:        ['cassetta', 'cassette', 'ap116', 'ap123'],
    scarico:      ['cassetta', 'batteria', 'meccanismo', 'sifone', 'piletta'],
    placca:       ['placche', 'pulsante', 'geberit'],
    galleggiante: ['rubinetto', 'valvola', 'batteria', 'cassetta'],
    batteria:     ['galleggiante', 'valvola', 'cassetta', 'scarico'],
    meccanismo:   ['cassetta', 'batteria', 'scarico', 'ricambi'],

    // ── Lavabi / Cucina ─────────────────────────────────────
    lavandino:    ['lavabo', 'lavello', 'bacino', 'lavabi'],
    lavello:      ['lavabo', 'lavandino', 'inox', 'cucina'],
    lavabo:       ['lavandino', 'lavello', 'lavabi', 'bacino'],
    lavabi:       ['lavabo', 'lavandino', 'complemento'],
    bacino:       ['lavabo', 'lavandino'],

    // ── Bidet ───────────────────────────────────────────────
    bidet:        ['bidet', 'sospesi', 'modulo'],

    // ── Doccia ──────────────────────────────────────────────
    doccia:       ['piatto', 'box', 'soffione', 'doccetta', 'colonna', 'pannello'],
    piatto:       ['doccia', 'ceramica', 'acrilico', 'resina'],
    box:          ['doccia', 'vasca', 'cristallo', 'vetro'],
    soffione:     ['doccia', 'doccetta', 'abs', 'ottone'],
    doccetta:     ['soffione', 'doccia', 'grohe', 'hansgrohe'],
    colonna:      ['doccia', 'set', 'saliscendi', 'pannello'],
    saliscendi:   ['doccia', 'colonna', 'set'],

    // ── Vasca ───────────────────────────────────────────────
    vasca:        ['acrilico', 'acciaio', 'vasca da bagno', 'box'],

    // ── Rubinetteria ────────────────────────────────────────
    rubinetto:    ['miscelatore', 'rubinetteria', 'monocomando', 'tre fori'],
    rubinetti:    ['miscelatore', 'rubinetteria', 'monocomando'],
    miscelatore:  ['rubinetto', 'rubinetteria', 'monocomando', 'tre fori', 'termostatico'],
    miscelatori:  ['rubinetto', 'rubinetteria', 'monocomando', 'termostatico'],
    monocomando:  ['miscelatore', 'rubinetto', 'rubinetteria'],
    cartuccia:    ['cartucce', 'ricambio', 'miscelatore'],
    cartucce:     ['cartuccia', 'ricambio', 'miscelatore'],
    termostatico: ['termostatica', 'miscelatori', 'valvola', 'paini'],
    termostatica: ['termostatico', 'miscelatori', 'valvola'],
    sottolavabo:  ['rubinetto', 'rubinetti', 'valvolette'],
    temporizzato: ['temporizzata', 'pulsante', 'rubinetteria'],
    fotocellula:  ['sensore', 'rubinetteria', 'grohe'],

    // ── Sifoni / Pilette / Scarichi ─────────────────────────
    sifone:       ['sifoni', 'piletta', 'pilette', 'scarico'],
    sifoni:       ['sifone', 'piletta', 'pilette', 'scarico'],
    piletta:      ['pilette', 'sifone', 'scarico', 'ottone', 'pvc'],
    pilette:      ['piletta', 'sifone', 'scarico', 'ottone', 'pvc'],
    canalina:     ['canaline', 'sifone', 'canale'],

    // ── Riscaldamento ───────────────────────────────────────
    caldaia:      ['caldaie', 'gas', 'ferroli', 'vaillant', 'beretta', 'baxi', 'immergas'],
    caldaie:      ['caldaia', 'gas', 'ferroli', 'vaillant', 'beretta'],
    scaldabagno:  ['scaldabagni', 'elettrico', 'dianboiler', 'termoboiler', 'boiler'],
    scaldabagni:  ['scaldabagno', 'elettrico', 'dianboiler', 'termoboiler'],
    boiler:       ['scaldabagno', 'scaldabagni', 'elettrico', 'bollitore'],
    bollitore:    ['boiler', 'scaldabagno', 'solare', 'puffer'],
    scaldino:     ['scaldini', 'gas', 'ferroli', 'vaillant', 'beretta', 'hermann'],
    scaldini:     ['scaldino', 'gas', 'ferroli', 'vaillant', 'beretta'],
    radiatore:    ['radiatori', 'alluminio', 'fondital', 'ferroli', 'acciaio'],
    radiatori:    ['radiatore', 'alluminio', 'fondital', 'ferroli', 'acciaio'],
    termosifone:  ['radiatore', 'radiatori', 'riscaldamento'],
    scaldasalviette: ['scaldasalviette', 'elettrico', 'acciaio', 'radiatori'],
    pellet:       ['stufe', 'biomassa', 'linea'],
    stufa:        ['stufe', 'pellet', 'legna'],
    stufe:        ['stufa', 'pellet', 'legna', 'gas', 'italkero'],
    termocamino:  ['termocamini', 'stufa', 'caldaia', 'biomassa'],
    valvola:      ['valvole', 'termostatica', 'sfera', 'sicurezza', 'ritegno'],
    valvole:      ['valvola', 'termostatica', 'sfera', 'sicurezza'],
    termostato:   ['termostati', 'cronotermostato', 'temperatura'],
    termostati:   ['termostato', 'cronotermostato'],
    cronotermostato: ['termostato', 'programmatore', 'orologio'],

    // ── Solare / Climatizzazione ─────────────────────────────
    solare:       ['kit', 'pannelli', 'circolazione', 'bollitore', 'puffer'],
    pannelli:     ['solari', 'solare', 'kit', 'ferroli'],
    climatizzatore:  ['climatizzatori', 'condizionatore', 'ferroli', 'tcl', 'argo'],
    climatizzatori:  ['climatizzatore', 'condizionatore', 'ferroli', 'tcl'],
    condizionatore:  ['climatizzatore', 'climatizzatori', 'pompa', 'calore'],
    pompa:        ['pompe', 'calore', 'circolatore', 'elettropompa'],
    pompe:        ['pompa', 'calore', 'circolatori', 'elettropompe'],
    circolatore:  ['circolatori', 'pompa', 'grundfos', 'ebara'],
    circolatori:  ['circolatore', 'pompa', 'grundfos'],

    // ── Idraulica / Valvole ──────────────────────────────────
    flessibile:   ['flessibili', 'inox', 'acciaio', 'antivibrante'],
    flessibili:   ['flessibile', 'inox', 'acciaio', 'antivibrante', 'parigi'],
    raccordo:     ['raccordi', 'ottone', 'rame', 'multistrato'],
    raccordi:     ['raccordo', 'ottone', 'rame', 'multistrato'],
    tubo:         ['tubi', 'rame', 'multistrato', 'polietilene', 'pvc'],
    tubi:         ['tubo', 'rame', 'multistrato', 'polietilene'],
    collettore:   ['collettori', 'valvole', 'detentori', 'tiemme', 'icma'],
    collettori:   ['collettore', 'valvole', 'detentori'],
    guarnizione:  ['guarnizioni', 'tenuta', 'morsetti'],
    filtro:       ['filtri', 'addolcitore', 'autopulente'],
    filtri:       ['filtro', 'addolcitore'],
    addolcitore:  ['addolcitori', 'sale', 'filtro'],
    autoclave:    ['autoclavi', 'vaso', 'membrana', 'espansione'],
    riduttore:    ['riduttori', 'pressione', 'acqua'],

    // ── Accessori Bagno ──────────────────────────────────────
    sedile:       ['sedili', 'wc', 'abs', 'termoindurente'],
    sedili:       ['sedile', 'wc', 'abs'],
    accessori:    ['accessori', 'bagno', 'ottone'],
    specchio:     ['specchi', 'abs', 'filo', 'applique'],
    mobile:       ['mobili', 'bagno', 'classici', 'moderni'],
    mobilebagno:  ['mobili', 'bagno', 'arredo'],

    // ── Fumisteria / Gas ─────────────────────────────────────
    canna:        ['fumaria', 'fumisteria', 'tubo', 'inox'],
    griglia:      ['griglie', 'aerazione', 'ventilazione'],
    sospeso:      ['sospesi', 'pensile', 'parete'],

    // ── Misure / Attributi ───────────────────────────────────
    '24kw':  ['24', 'kw', 'kilowatt'],
    '18kw':  ['18', 'kw'],
    '28kw':  ['28', 'kw'],
    grande:  ['xxl', 'grande', 'maxi'],
    piccolo: ['mini', 'compact', 'ridotto'],
    incassato: ['incasso', 'a incasso'],
    parete:    ['sospeso', 'murale', 'a parete'],
    terra:     ['a terra', 'tradizionale', 'classico'],
};

// ─────────────────────────────────────────────
// 2. ALIAS BRAND (nomi alternativi → nome nel catalogo)
// ─────────────────────────────────────────────
const BRAND_ALIASES: Record<string, string[]> = {
    'ger':        ['geberit'],
    'geber':      ['geberit'],
    'grohe':      ['grohe'],
    'ideal':      ['ideal standard', 'ideal star'],
    'is':         ['ideal standard'],
    'vaillant':   ['vaillant'],
    'ferroli':    ['ferroli'],
    'beretta':    ['beretta'],
    'baxi':       ['baxi'],
    'grundfos':   ['grundfos'],
    'ebara':      ['ebara'],
    'paini':      ['paini'],
    'mamoli':     ['mamoli'],
    'honeywell':  ['honeywell'],
    'hansgrohe':  ['hansgrohe'],
    'hans':       ['hansgrohe'],
    'gedy':       ['gedy'],
    'duravit':    ['duravit'],
    'azzurra':    ['azzurra'],
    'alice':      ['alice'],
    'tiemme':     ['tiemme'],
    'icma':       ['icma'],
    'frattini':   ['frattini'],
    'immergas':   ['immergas'],
    'pucci':      ['pucci'],
    'geberit':    ['geberit', 'sigma', 'duofix', 'combifix', 'omega'],
};

// ─────────────────────────────────────────────
// 3. MAPPA INTENTO → CATEGORIE PRIMARIE
// ─────────────────────────────────────────────
// Quando l'utente cerca un termine generico (es. "tazza"),
// queste sono le categorie che contengono il PRODOTTO VERO
// (non gli accessori, non i ricambi).
// Le keyword devono combaciare come SUBSTRING del campo category normalizzato.

const INTENT_PRIMARY_CATS: Record<string, string[]> = {
    // ── WC / Tazza ──────────────────────────────────────────
    tazza:       ['sanitari in ceramica'],
    wc:          ['sanitari in ceramica'],
    water:       ['sanitari in ceramica'],
    gabinetto:   ['sanitari in ceramica'],
    cesso:       ['sanitari in ceramica'],
    sanitario:   ['sanitari in ceramica'],
    sanitari:    ['sanitari in ceramica'],
    vaso:        ['sanitari in ceramica'],

    // ── Bidet ────────────────────────────────────────────────
    bidet:       ['sanitari in ceramica', 'moduli fix'],

    // ── Lavabo / Lavandino ───────────────────────────────────
    lavabo:      ['sanitari in ceramica', 'lavabi'],
    lavabi:      ['sanitari in ceramica', 'lavabi'],
    lavandino:   ['sanitari in ceramica', 'lavabi'],
    lavello:     ['lavelli inox'],
    lavelli:     ['lavelli inox'],

    // ── Piatti doccia / Box ──────────────────────────────────
    piatto:      ['piatti doccia'],
    doccia:      ['piatti doccia', 'box doccia', 'set colonna'],
    box:         ['box doccia'],
    vasca:       ['vasche'],

    // ── Soffioni / Set doccia ────────────────────────────────
    soffione:    ['soffioni'],
    soffioni:    ['soffioni'],
    doccetta:    ['doccette'],
    doccette:    ['doccette'],
    saliscendi:  ['saliscendi'],
    colonna:     ['set colonna'],

    // ── Cassette ─────────────────────────────────────────────
    cassetta:    ['cassette incasso', 'cassette a zaino'],
    cassette:    ['cassette incasso', 'cassette a zaino'],
    incasso:     ['cassette incasso'],
    zaino:       ['cassette a zaino'],

    // ── Rubinetteria ─────────────────────────────────────────
    rubinetto:   ['rubinetteria monocomando', 'rubinetteria tre fori', 'rubinetteria tradizionale', 'rubinetteria leva'],
    rubinetti:   ['rubinetteria monocomando', 'rubinetteria tre fori', 'rubinetteria tradizionale'],
    miscelatore: ['rubinetteria monocomando', 'rubinetteria tre fori', 'miscelatori termostatici'],
    miscelatori: ['rubinetteria monocomando', 'rubinetteria tre fori', 'miscelatori termostatici'],
    monocomando: ['rubinetteria monocomando'],

    // ── Caldaie ───────────────────────────────────────────────
    caldaia:     ['caldaie a gas'],
    caldaie:     ['caldaie a gas'],

    // ── Scaldabagni ───────────────────────────────────────────
    scaldabagno: ['scaldabagni'],
    scaldabagni: ['scaldabagni'],
    boiler:      ['scaldabagni'],
    bollitore:   ['bollitori'],
    scaldino:    ['scaldini a gas'],
    scaldini:    ['scaldini a gas'],

    // ── Radiatori ─────────────────────────────────────────────
    radiatore:   ['radiatori in alluminio', 'radiatori tubolari', 'radiatori a gas'],
    radiatori:   ['radiatori in alluminio', 'radiatori tubolari', 'radiatori a gas'],
    termosifone: ['radiatori in alluminio', 'radiatori tubolari'],
    scaldasalviette: ['radiatori scaldasalviette'],

    // ── Stufe / Camini ────────────────────────────────────────
    stufa:       ['stufe a pellet', 'stufe a legna'],
    stufe:       ['stufe a pellet', 'stufe a legna'],
    pellet:      ['stufe a pellet'],
    termocamino: ['termocamini'],

    // ── Termostati ────────────────────────────────────────────
    termostato:  ['termostati ambiente', 'cronotermostati'],
    termostati:  ['termostati ambiente', 'cronotermostati'],
    cronotermostato: ['cronotermostati'],

    // ── Valvole ───────────────────────────────────────────────
    valvola:     ['valvole a sfera', 'valvole e detentori'],
    valvole:     ['valvole a sfera', 'valvole e detentori'],

    // ── Pompe / Circolatori ───────────────────────────────────
    pompa:       ['elettropompe'],
    pompe:       ['elettropompe'],
    circolatore: ['circolatori'],
    circolatori: ['circolatori'],

    // ── Collettori ────────────────────────────────────────────
    collettore:  ['collettori complanari', 'collettori lineari'],
    collettori:  ['collettori complanari', 'collettori lineari'],

    // ── Mobili / Arredo ───────────────────────────────────────
    mobile:      ['mobili da bagno', 'mobili sottolavelli', 'mobili lavatoi'],
    mobili:      ['mobili da bagno', 'mobili sottolavelli', 'mobili lavatoi'],
    specchio:    ['specchi'],
    specchi:     ['specchi'],

    // ── Sifoni / Pilette ──────────────────────────────────────
    sifone:      ['sifoni'],
    sifoni:      ['sifoni'],
    piletta:     ['pilette'],
    pilette:     ['pilette'],

    // ── Flessibili ────────────────────────────────────────────
    flessibile:  ['flessibili inox', 'flessibili acciaio'],
    flessibili:  ['flessibili inox', 'flessibili acciaio'],

    // ── Climatizzatori ────────────────────────────────────────
    climatizzatore: ['climatizzatori'],
    climatizzatori: ['climatizzatori'],
    condizionatore: ['climatizzatori'],
};

// ─────────────────────────────────────────────
// 4. TIER DEL PRODOTTO (Main / Accessory / Spare)
// ─────────────────────────────────────────────

/** Classificazione tier del prodotto basata sul nome della categoria */
type ProductTier = 'main' | 'accessory' | 'spare';

// Keyword nel nome categoria che indicano ricambi (ultimo posto)
const SPARE_KEYWORDS = ['ricambi', 'ricambio', 'cerniere di ricambio', 'paracolpi di ricambio'];

// Keyword nel nome categoria che indicano accessori/kit (posto intermedio)
const ACCESSORY_KEYWORDS = [
    'accessori', 'complementi', 'cerniere', 'paracolpi',
    'kit fissaggio', 'kit montaggio', 'fissaggi', 'supporti',
    'tappi', 'riduzione', 'rosette', 'rosoni',
];

function detectProductTier(category: string): ProductTier {
    const cat = normalize(category);
    if (SPARE_KEYWORDS.some(k => cat.includes(k))) return 'spare';
    if (ACCESSORY_KEYWORDS.some(k => cat.includes(k))) return 'accessory';
    return 'main';
}

// ─────────────────────────────────────────────
// 5. INTENTO DELLA QUERY
// ─────────────────────────────────────────────

/** L'utente sta cercando esplicitamente ricambi o accessori? */
function detectQueryIntent(queryTokens: string[]): 'spare' | 'accessory' | 'main' {
    const spareSignals = ['ricambi', 'ricambio', 'pezzo', 'pezzi', 'sostituzione', 'spare'];
    const accessorySignals = ['accessori', 'accessorio', 'kit', 'complementi'];

    if (queryTokens.some(t => spareSignals.includes(t))) return 'spare';
    if (queryTokens.some(t => accessorySignals.includes(t))) return 'accessory';
    return 'main';
}

/**
 * Controlla se la categoria del prodotto corrisponde alle categorie primarie
 * per almeno uno dei token della query.
 * Ritorna true se il prodotto è il "prodotto principale" per questa ricerca.
 */
function isPrimaryProductForQuery(categoryNorm: string, queryTokens: string[]): boolean {
    for (const token of queryTokens) {
        // Controlla il token e tutti i suoi sinonimi
        const expanded = [token, ...(SYNONYMS[token] ?? [])];
        for (const term of expanded) {
            const primaryCats = INTENT_PRIMARY_CATS[term];
            if (!primaryCats) continue;
            if (primaryCats.some(pc => categoryNorm.includes(normalize(pc)))) {
                return true;
            }
        }
    }
    return false;
}

// ─────────────────────────────────────────────
// 6. FUNZIONI DI NORMALIZZAZIONE
// ─────────────────────────────────────────────

/** Normalizza una stringa: minuscolo, rimuove accenti, unifica separatori */
export function normalize(str: string): string {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // rimuove segni diacritici (accenti)
        .replace(/['"«»]/g, '')          // rimuove virgolette
        .replace(/[_/\\|]/g, ' ')        // separatori → spazio
        .replace(/\s+/g, ' ')
        .trim();
}

/** Tokenizza testo normalizzato in array di token significativi */
function tokenize(str: string): string[] {
    return normalize(str)
        .split(/[\s,;.]+/)
        .filter(t => t.length >= 2); // ignora token brevissimi tipo "e", "a"
}

// ─────────────────────────────────────────────
// 7. FUZZY MATCHING (Levenshtein)
// ─────────────────────────────────────────────

/** Calcola la distanza di Levenshtein tra due stringhe */
function levenshtein(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    const curr = new Array<number>(b.length + 1).fill(0);

    for (let i = 1; i <= a.length; i++) {
        curr[0] = i;
        for (let j = 1; j <= b.length; j++) {
            curr[j] = a[i - 1] === b[j - 1]
                ? prev[j - 1]
                : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
        }
        prev.splice(0, prev.length, ...curr);
    }
    return prev[b.length];
}

/**
 * Controlla se un token è "vicino" a una parola nel testo via Levenshtein.
 * Soglie: parole brevi (≤5 chr) → max 1 errore, parole lunghe → max 2 errori.
 */
function fuzzyContains(token: string, textTokens: string[]): boolean {
    if (token.length < 3) return false; // troppo corto per fuzzy
    const maxDist = token.length <= 5 ? 1 : 2;
    return textTokens.some(word =>
        Math.abs(word.length - token.length) <= maxDist &&
        levenshtein(token, word) <= maxDist
    );
}

// ─────────────────────────────────────────────
// 8. ESPANSIONE TOKEN CON SINONIMI
// ─────────────────────────────────────────────

/** Restituisce il token + tutti i suoi sinonimi */
function expand(token: string): string[] {
    const syns = SYNONYMS[token] ?? [];
    const brandAliases = BRAND_ALIASES[token] ?? [];
    // Deduplica
    return [...new Set([token, ...syns, ...brandAliases])];
}

// ─────────────────────────────────────────────
// 9. SCORING PER SINGOLO TOKEN
// ─────────────────────────────────────────────

interface FieldData {
    text: string;
    tokens: string[];
}

/**
 * Calcola il punteggio di un singolo token contro un campo.
 * Ritorna il punteggio massimo trovato (direct/synonym/fuzzy).
 */
function scoreTokenAgainstField(token: string, field: FieldData): number {
    const expanded = expand(token);

    // ── DIRECT exact word match ──
    if (field.tokens.includes(token)) return 10;

    // ── DIRECT substring match ──
    if (field.text.includes(token)) return 8;

    // ── SYNONYM exact word match ──
    for (const syn of expanded.slice(1)) {  // slice(1) per saltare il token stesso
        if (field.tokens.includes(syn)) return 6;
        if (field.text.includes(syn)) return 4;
    }

    // ── FUZZY fallback ──
    if (fuzzyContains(token, field.tokens)) return 2;

    return 0;
}

// ─────────────────────────────────────────────
// 10. FUNZIONE PRINCIPALE DI SCORING PRODOTTO
// ─────────────────────────────────────────────

/**
 * Pesi per campo (name > id/codice > category > specs > desc).
 * Un match nel nome vale molto di più che nella descrizione.
 */
const FIELD_WEIGHTS = {
    id:       8,     // codice articolo – se l'utente cerca il codice esatto
    name:     5,     // nome prodotto
    category: 3,     // categoria
    specs:    2.5,   // marca, EAN, ecc.
    desc:     1,     // note/descrizione
};

export interface ScoredProduct {
    product: Product;
    score: number;
}

/**
 * Calcola il punteggio totale di un prodotto per una lista di token di query.
 * Include:
 *  - AND logic (tutti i token devono matchare)
 *  - Bonus per match nel nome / categoria
 *  - Bonus per codice articolo
 *  - Sistema TIER: prodotto principale > accessorio > ricambio
 *  - Se l'utente cerca esplicitamente "ricambi" → tier ignorato
 */
function scoreProduct(product: Product, queryTokens: string[], queryIntent: 'main' | 'accessory' | 'spare'): number {
    // Prepara i campi del prodotto normalizzati
    const idText = normalize(String(product.id));
    const nameText = normalize(product.name);
    const catText = normalize(product.category);
    const specsText = normalize((product.specs ?? []).join(' '));
    const descText = normalize(product.desc ?? '');

    const fields: Record<keyof typeof FIELD_WEIGHTS, FieldData> = {
        id:       { text: idText,    tokens: tokenize(idText) },
        name:     { text: nameText,  tokens: tokenize(nameText) },
        category: { text: catText,   tokens: tokenize(catText) },
        specs:    { text: specsText, tokens: tokenize(specsText) },
        desc:     { text: descText,  tokens: tokenize(descText) },
    };

    let totalScore = 0;
    let allTokensMatched = true;

    for (const token of queryTokens) {
        let bestTokenScore = 0;

        // Cerca il punteggio migliore tra tutti i campi
        for (const [fieldName, fieldData] of Object.entries(fields) as [keyof typeof FIELD_WEIGHTS, FieldData][]) {
            const s = scoreTokenAgainstField(token, fieldData) * FIELD_WEIGHTS[fieldName];
            if (s > bestTokenScore) bestTokenScore = s;
        }

        // Logica AND: se un token non matcha da nessuna parte → prodotto escluso
        if (bestTokenScore === 0) {
            allTokensMatched = false;
            break;
        }

        totalScore += bestTokenScore;
    }

    if (!allTokensMatched) return 0;

    // ── BONUS BASE ───────────────────────────────────────────
    // Bonus se TUTTI i token matchano nel solo campo nome
    const allInName = queryTokens.every(t =>
        expand(t).some(e => fields.name.text.includes(e))
    );
    if (allInName) totalScore += 15;

    // Bonus se TUTTI i token matchano nella sola categoria
    const allInCategory = queryTokens.every(t =>
        expand(t).some(e => fields.category.text.includes(e))
    );
    if (allInCategory) totalScore += 5;

    // Bonus per match esatto del codice articolo (ricerca per codice)
    const normalizedId = normalize(String(product.id));
    if (queryTokens.some(t => normalizedId === t || normalizedId.startsWith(t))) {
        totalScore += 30;
    }

    // ── SISTEMA TIER ─────────────────────────────────────────
    // Se l'utente cerca ricambi/accessori specificamente → non applicare tier
    if (queryIntent === 'main') {
        const tier = detectProductTier(product.category);
        const isPrimary = isPrimaryProductForQuery(catText, queryTokens);

        if (isPrimary && tier === 'main') {
            // Il prodotto È quello che l'utente cerca: fortissimo boost
            totalScore += 50;
        } else if (tier === 'main') {
            // Prodotto principale ma non il tipo primario (es. cassette quando cerco tazza)
            totalScore += 10;
        } else if (tier === 'accessory') {
            // Accessori: leggero calo
            totalScore -= 10;
        } else if (tier === 'spare') {
            // Ricambi: penalità forte → finiscono in fondo
            totalScore -= 40;
        }
    } else if (queryIntent === 'accessory') {
        const tier = detectProductTier(product.category);
        if (tier === 'accessory') totalScore += 20;
        if (tier === 'spare')     totalScore -= 20;
    }
    // queryIntent === 'spare': niente aggiustamenti, l'utente vuole i ricambi

    return totalScore;
}

// ─────────────────────────────────────────────
// 11. API PUBBLICA
// ─────────────────────────────────────────────

/**
 * Ricerca avanzata nel catalogo prodotti.
 *
 * @param products - Lista completa (o già filtrata per categoria)
 * @param query    - Stringa di ricerca dell'utente
 * @returns Lista di prodotti ordinata per rilevanza (score decrescente)
 */
export function smartSearch(products: Product[], query: string): Product[] {
    const trimmed = query.trim();
    if (!trimmed) return products;

    const queryTokens = tokenize(trimmed);
    if (queryTokens.length === 0) return products;

    const queryIntent = detectQueryIntent(queryTokens);

    const scored: ScoredProduct[] = products
        .map(product => ({
            product,
            score: scoreProduct(product, queryTokens, queryIntent),
        }))
        .filter(sp => sp.score > 0);

    scored.sort((a, b) => b.score - a.score);

    return scored.map(sp => sp.product);
}

/**
 * Versione con score esposto (utile per debug o highlight).
 */
export function smartSearchWithScore(products: Product[], query: string): ScoredProduct[] {
    const trimmed = query.trim();
    if (!trimmed) return products.map(p => ({ product: p, score: 0 }));

    const queryTokens = tokenize(trimmed);
    if (queryTokens.length === 0) return products.map(p => ({ product: p, score: 0 }));

    const queryIntent = detectQueryIntent(queryTokens);

    return products
        .map(product => ({ product, score: scoreProduct(product, queryTokens, queryIntent) }))
        .filter(sp => sp.score > 0)
        .sort((a, b) => b.score - a.score);
}
