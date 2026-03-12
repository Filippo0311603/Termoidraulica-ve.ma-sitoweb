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

    // ════════════════════════════════════════════════════════════
    // SANITARI IN CERAMICA
    // ════════════════════════════════════════════════════════════

    // ── WC / Vaso ────────────────────────────────────────────
    // NOTE: 'wc' DEVE avere un'entry perché molti vasi si chiamano
    // "VASO ESEDRA SOSPESO" senza la parola 'wc' nel nome.
    // NON aggiungere 'tazza': causerebbe falsi match con "TAZZA TRASPARENTE"
    // (ricambio riduttori pressione) e "FRESE A TAZZA" (utensili).
    wc:              ['vaso', 'sanitari', 'water', 'toilette'],
    tazza:           ['wc', 'water', 'vaso', 'sanitari', 'toilette'],
    water:           ['wc', 'tazza', 'vaso', 'sanitari', 'toilette'],
    toilette:        ['wc', 'water', 'tazza', 'vaso', 'sanitari'],
    gabinetto:       ['wc', 'water', 'tazza', 'vaso', 'sanitari'],
    cesso:           ['wc', 'water', 'tazza', 'vaso', 'sanitari'],
    latrina:         ['wc', 'water', 'gabinetto', 'vaso', 'sanitari'],
    tazzone:         ['vaso', 'wc', 'tazza', 'sanitari'],
    // "vaso" da solo può essere vaso WC o vaso d'espansione; il TIER decide
    vaso:            ['wc', 'water', 'tazza', 'sanitari'],
    sanitario:       ['wc', 'water', 'tazza', 'lavabo', 'bidet', 'ceramica'],
    ceramica:        ['sanitari', 'wc', 'lavabo', 'bidet', 'piatto'],
    // aggettivi posizione
    sospeso:         ['sospesi', 'pensile', 'parete', 'murale'],
    sospesi:         ['sospeso', 'pensile', 'parete'],
    filo:            ['filo parete', 'parete', 'sospeso'],   // "filo parete"

    // ── Sedile / Copriwater ───────────────────────────────────
    sedile:          ['sedili', 'abs', 'termoindurente', 'copriwater', 'tavoletta'],
    sedili:          ['sedile', 'abs', 'termoindurente', 'copriwater'],
    copriwater:      ['sedile', 'sedili', 'abs', 'termoindurente'],
    tavoletta:       ['sedile', 'sedili', 'abs', 'termoindurente', 'copriwater'],
    asse:            ['sedile', 'sedili', 'abs', 'termoindurente', 'copriwater'],
    ciambella:       ['sedile', 'sedili', 'copriwater'],
    coperchio:       ['sedile', 'sedili', 'copriwater'],

    // ── Bidet ─────────────────────────────────────────────────
    bidet:           ['sanitari', 'sospeso', 'modulo'],

    // ── Lavabo ────────────────────────────────────────────────
    lavabo:          ['lavandino', 'lavello', 'lavabi', 'bacino', 'catinella'],
    lavabi:          ['lavabo', 'lavandino', 'complemento', 'appoggio'],
    lavandino:       ['lavabo', 'lavello', 'bacino', 'lavabi'],
    catinella:       ['lavabo', 'lavandino', 'lavabi'],
    bacino:          ['lavabo', 'lavandino'],
    semifonte:       ['lavabo', 'lavandino', 'colonna'],   // "lavabo semifonte"
    appoggio:        ['lavabo', 'lavabi', 'appoggio'],

    // ── Lavello cucina ────────────────────────────────────────
    lavello:         ['lavabi', 'inox', 'cucina', 'acquaio', 'lavapiatti'],
    lavelli:         ['lavello', 'inox', 'cucina'],
    acquaio:         ['lavello', 'cucina', 'inox'],
    lavapiatti:      ['lavello', 'cucina', 'inox'],

    // ── Pilozzo / Lavatoio ────────────────────────────────────
    lavatoio:        ['lavatoi', 'panni', 'pilozzi'],
    lavatoi:         ['lavatoio', 'panni', 'pilozzi'],
    pilozzo:         ['lavatoio', 'lavatoi', 'panni'],
    pilozzi:         ['pilozzo', 'lavatoi', 'panni'],

    // ── Piatto doccia ─────────────────────────────────────────
    piatto:          ['doccia', 'ceramica', 'acrilico', 'resina', 'mineral'],
    'piatto doccia': ['piatti doccia', 'ceramica', 'acrilico', 'resina'],
    ultraflat:       ['piatto', 'doccia', 'mineral', 'basso'],
    antiscivolo:     ['piatto', 'doccia', 'ceramica', 'acrilico'],

    // ── Vasca da bagno ────────────────────────────────────────
    vasca:           ['vasche', 'acrilico', 'acciaio', 'box'],
    vasche:          ['vasca', 'acrilico', 'acciaio'],
    idromassaggio:   ['vasca', 'vasche', 'jacuzzi', 'whirlpool'],
    jacuzzi:         ['vasca', 'idromassaggio', 'vasche'],
    'vasca da bagno':['vasche', 'acrilico', 'acciaio'],

    // ── Box doccia / Cabina ───────────────────────────────────
    box:             ['doccia', 'cabina', 'cristallo', 'vetro', 'acrilico'],
    cabina:          ['box', 'doccia', 'cristallo', 'vetro'],
    vetri:           ['box', 'doccia', 'cristallo', 'vetro'],
    soffietto:       ['box', 'pvc', 'doccia'],

    // ════════════════════════════════════════════════════════════
    // CASSETTE DI SCARICO
    // ════════════════════════════════════════════════════════════
    cassetta:        ['cassette', 'incasso', 'zaino', 'scarico', 'sciacquone'],
    cassette:        ['cassetta', 'incasso', 'zaino', 'scarico'],
    sciacquone:      ['cassetta', 'cassette', 'scarico', 'meccanismo'],
    vaschetta:       ['cassetta', 'cassette', 'zaino', 'scarico'],
    cisterna:        ['cassetta', 'cassette', 'scarico', 'incasso'],
    incasso:         ['cassetta', 'sigma', 'omega', 'duofix', 'combifix'],
    zaino:           ['cassetta', 'cassette', 'ap116', 'ap123', 'cr'],
    fantasma:        ['incasso', 'cassetta', 'scomparsa', 'sigma', 'omega'],
    scomparsa:       ['incasso', 'cassetta', 'sigma', 'omega', 'fantasma'],
    scarico:         ['cassetta', 'batteria', 'meccanismo', 'sifone', 'piletta'],
    placca:          ['placche', 'pulsante', 'comando', 'geberit', 'grohe'],
    placche:         ['placca', 'pulsante', 'comando', 'geberit'],
    pulsante:        ['placca', 'placche', 'scarico', 'tasto', 'bottone'],
    bottone:         ['placca', 'placche', 'pulsante', 'tasto'],
    tastiera:        ['placca', 'placche', 'comando', 'scarico'],
    tasto:           ['placca', 'placche', 'pulsante', 'comando'],
    galleggiante:    ['rubinetto', 'valvola', 'batteria', 'cassetta'],
    batteria:        ['galleggiante', 'valvola', 'cassetta', 'catis', 'ricambio'],
    meccanismo:      ['cassetta', 'batteria', 'scarico', 'ricambi'],
    cannotto:        ['tubo', 'raccordo', 'cacciata', 'collegamento'],
    cacciata:        ['cannotto', 'tubo', 'cassetta', 'scarico'],
    canotto:         ['cannotto', 'tubo', 'wc', 'collegamento'],

    // ════════════════════════════════════════════════════════════
    // RUBINETTERIA
    // ════════════════════════════════════════════════════════════
    rubinetto:       ['rubinetteria', 'miscelatore', 'monocomando', 'tre fori', 'leva'],
    rubinetti:       ['rubinetteria', 'miscelatore', 'monocomando'],
    rubinetteria:    ['rubinetto', 'rubinetti', 'miscelatore', 'monocomando'],
    miscelatore:     ['rubinetto', 'rubinetteria', 'monocomando', 'tre fori', 'termostatico'],
    miscelatori:     ['rubinetto', 'rubinetteria', 'monocomando', 'termostatico'],
    monocomando:     ['miscelatore', 'rubinetto', 'rubinetteria', 'leva'],
    'tre fori':      ['rubinetteria', 'miscelatore', 'tradizionale'],
    biforo:          ['rubinetteria', 'miscelatore', 'tre fori'],
    monoforo:        ['rubinetto', 'rubinetteria', 'monocomando'],
    fontana:         ['rubinetto', 'rubinetteria', 'miscelatore'],
    rubinettino:     ['rubinetto', 'sottolavabo', 'mini'],
    valvoletta:      ['sottolavabo', 'rubinetto', 'intercettazione'],
    sottolavabo:     ['rubinetto', 'rubinetti', 'valvoletta', 'intercettazione'],
    intercettatore:  ['valvola', 'rubinetto', 'sottolavabo'],
    cartuccia:       ['cartucce', 'ricambio', 'miscelatore', 'vitone'],
    cartucce:        ['cartuccia', 'ricambio', 'miscelatore'],
    vitone:          ['cartuccia', 'cartucce', 'miscelatore', 'ricambio'],
    termostatico:    ['termostatica', 'miscelatori', 'valvola', 'paini'],
    termostatica:    ['termostatico', 'miscelatori', 'valvola'],
    temporizzato:    ['temporizzata', 'pulsante', 'rubinetteria', 'flussometro'],
    fotocellula:     ['sensore', 'infrarossi', 'rubinetteria', 'automatico'],
    pedale:          ['rubinetteria', 'sanitaria', 'leva'],
    'a pulsante':    ['temporizzato', 'rubinetteria', 'pulsante'],
    leva:            ['rubinetteria', 'monocomando', 'miscelatore'],
    bocchettone:     ['raccordo', 'entrata', 'flessibile', 'collegamento'],
    eccentrici:      ['distanziatori', 'rubinetteria', 'tre fori'],
    distanziatori:   ['eccentrici', 'rubinetteria', 'raccordi'],
    aeratore:        ['aeratori', 'rompigetto', 'rubinetteria', 'neoperl'],
    aeratori:        ['aeratore', 'rompigetto', 'rubinetteria', 'neoperl'],
    rompigetto:      ['aeratore', 'aeratori', 'rubinetteria'],
    retina:          ['aeratore', 'aeratori', 'filtro'],
    filtrino:        ['aeratore', 'aeratori', 'filtro'],

    // ════════════════════════════════════════════════════════════
    // DOCCIA – accessori
    // ════════════════════════════════════════════════════════════
    doccia:          ['piatto', 'box', 'soffione', 'doccetta', 'colonna', 'pannello', 'set'],
    soffione:        ['doccia', 'doccetta', 'abs', 'ottone', 'inox', 'cromato'],
    soffioni:        ['soffione', 'doccia', 'doccetta'],
    doccetta:        ['soffione', 'doccette', 'doccia', 'grohe', 'hansgrohe'],
    doccette:        ['doccetta', 'soffione', 'doccia'],
    doccino:         ['doccetta', 'doccette', 'doccia', 'soffione'],
    doccione:        ['soffione', 'soffioni'],
    cipolla:         ['soffione', 'soffioni'],
    pigna:           ['soffione', 'soffioni'],
    microfono:       ['doccetta', 'doccette', 'doccia'],
    'set doccia':    ['colonna', 'saliscendi', 'soffione', 'doccetta'],
    saliscendi:      ['doccia', 'colonna', 'asta', 'barra'],
    asta:            ['saliscendi', 'doccia', 'colonna', 'barra'],
    palo:            ['saliscendi', 'doccia', 'colonna', 'asta'],
    barra:           ['saliscendi', 'asta'],
    laccio:          ['flessibile', 'flessibili', 'doccia', 'tubo spirale'],
    cordino:         ['flessibile', 'flessibili', 'doccia'],
    'tubo doccia':   ['flessibile', 'flessibili', 'doccia', 'laccio'],
    'pannello doccia': ['pannelli doccia', 'colonna', 'inox', 'abs'],
    duplex:          ['pannelli doccia', 'colonna doccia', 'set doccia'],
    braccio:         ['bracci doccia', 'soffione'],
    sgabello:        ['sgabelli doccia', 'durolite'],

    // ════════════════════════════════════════════════════════════
    // SIFONI / PILETTE / SCARICHI
    // ════════════════════════════════════════════════════════════
    sifone:          ['sifoni', 'piletta', 'pilette', 'scarico', 'geberit'],
    sifoni:          ['sifone', 'piletta', 'pilette', 'scarico'],
    piletta:         ['pilette', 'sifone', 'scarico', 'ottone', 'pvc'],
    pilette:         ['piletta', 'sifone', 'scarico', 'ottone', 'pvc'],
    saltarello:      ['piletta', 'pilette', 'scarico', 'tappo'],
    tappo:           ['pilette', 'piletta', 'scarico', 'copriforo'],
    copriforo:       ['tappo', 'piletta', 'lavello'],
    canalina:        ['canaline', 'sifone', 'scarico', 'geberit'],
    canaline:        ['canalina', 'sifone', 'scarico'],
    troppopieno:     ['sifone', 'piletta', 'scarico', 'scarico vasca'],
    collo:           ['sifone', 'sifoni', 'scarico'],        // "collo d'oca"
    stura:           ['molle', 'sturalavandino', 'scarico'],
    sturalavandino:  ['molle', 'stura', 'scarico'],
    'collo doca':    ['sifone', 'sifoni', 'scarico'],

    // ════════════════════════════════════════════════════════════
    // FLESSIBILI
    // ════════════════════════════════════════════════════════════
    flessibile:      ['flessibili', 'inox', 'acciaio', 'antivibrante', 'treccia'],
    flessibili:      ['flessibile', 'inox', 'acciaio', 'antivibrante', 'parigi'],
    treccia:         ['flessibile', 'flessibili', 'inox', 'trecciato'],
    tubo:            ['tubi', 'rame', 'multistrato', 'polietilene', 'pvc', 'pex'],
    tubi:            ['tubo', 'rame', 'multistrato', 'polietilene'],
    tubetto:         ['tubo', 'cromato', 'rame', 'ottone'],
    tubetti:         ['tubetto', 'tubo', 'cromato', 'rame'],
    raccordo:        ['raccordi', 'ottone', 'rame', 'multistrato', 'bronzo'],
    raccordi:        ['raccordo', 'ottone', 'rame', 'multistrato'],
    giunto:          ['raccordo', 'raccordi', 'giunti', 'dielettrico'],
    giunti:          ['giunto', 'raccordi', 'dielettrico'],
    niple:           ['raccordo', 'niples', 'manicotto', 'prolunga'],
    niples:          ['niple', 'raccordo', 'manicotto'],
    manicotto:       ['raccordo', 'raccordi', 'giunzione', 'niple'],
    gomito:          ['raccordo', 'curva', 'angolo', '90'],
    curva:           ['gomito', 'raccordo', 'angolo', 'curva'],
    braga:           ['raccordo', 'te', 'derivazione', 'pvc'],
    tee:             ['raccordo', 'derivazione', 'te', 'giunzione'],
    derivazione:     ['tee', 'te', 'raccordo', 'braga'],
    riduzione:       ['raccordo', 'riduzione', 'riduttore di diametro'],
    flangia:         ['flange', 'raccordo', 'saldare'],
    flange:          ['flangia', 'raccordi', 'saldare'],
    multistrato:     ['tubo', 'tubi', 'raccordo', 'pex', 'ape', 'tiemme', 'unidelta'],
    pex:             ['multistrato', 'cobra', 'tubo', 'polietilene'],
    polietilene:     ['pex', 'tubo', 'multistrato', 'tubi'],
    rame:            ['tubo', 'tubi', 'raccordi', 'saldare'],

    // ════════════════════════════════════════════════════════════
    // VALVOLE
    // ════════════════════════════════════════════════════════════
    valvola:         ['valvole', 'sfera', 'sicurezza', 'ritegno', 'termostatica'],
    valvole:         ['valvola', 'sfera', 'sicurezza', 'ritegno'],
    'valvola a sfera': ['valvole a sfera', 'intercettazione', 'sfera'],
    intercettazione: ['valvola', 'sfera', 'rubinetto', 'sottolavabo'],
    detentore:       ['detentori', 'valvola', 'valvole', 'radiatore'],
    detentori:       ['detentore', 'valvola', 'valvole'],
    manopola:        ['valvola', 'termostatica', 'detentore', 'radiatore'],
    rotella:         ['valvola', 'termostatica', 'detentore', 'radiatore'],
    termoscopico:    ['valvola', 'termostatica', 'testa', 'radiatore'],
    'valvola di sicurezza': ['sicurezza', 'scaldabagno', 'caldaia'],
    sicurezza:       ['valvola', 'valvole', 'scaldabagno', 'caldaia'],
    ritegno:         ['valvola', 'ritegno', 'non ritorno'],
    sfogo:           ['valvola', 'sfogo aria', 'radiatori'],
    sfiato:          ['sfogo', 'valvola', 'aria', 'radiatori'],

    // ════════════════════════════════════════════════════════════
    // COLLETTORI / IMPIANTI A PANNELLI
    // ════════════════════════════════════════════════════════════
    collettore:      ['collettori', 'valvole', 'detentori', 'tiemme', 'icma', 'manifold'],
    collettori:      ['collettore', 'valvole', 'detentori'],
    manifold:        ['collettore', 'collettori', 'riscaldamento'],
    zona:            ['valvola', 'zona', 'motorizzata', 'collettore'],

    // ════════════════════════════════════════════════════════════
    // RISCALDAMENTO – CALDAIE
    // ════════════════════════════════════════════════════════════
    caldaia:         ['caldaie', 'gas', 'ferroli', 'vaillant', 'beretta', 'baxi', 'immergas', 'murale'],
    caldaie:         ['caldaia', 'gas', 'ferroli', 'vaillant', 'beretta'],
    murale:          ['caldaia', 'caldaie', 'a parete', 'sospeso'],
    combinata:       ['caldaia', 'caldaie', 'acqua calda', 'riscaldamento'],
    condensazione:   ['caldaia', 'caldaie', 'gas', 'efficienza'],
    biomassa:        ['stufa', 'stufe', 'pellet', 'legna', 'caldaia'],
    candeletta:      ['elettrodo', 'caldaia', 'accensione', 'ricambi'],
    elettrodo:       ['candeletta', 'caldaia', 'accensione', 'ricambi'],
    pressostato:     ['pressostati', 'pressione', 'caldaia', 'pompa'],

    // ── Scaldabagni ───────────────────────────────────────────
    scaldabagno:     ['scaldabagni', 'elettrico', 'boiler', 'termoboiler', 'dianboiler'],
    scaldabagni:     ['scaldabagno', 'elettrico', 'boiler', 'termoboiler'],
    boiler:          ['scaldabagno', 'scaldabagni', 'elettrico', 'bollitore'],
    scaldacqua:      ['scaldabagno', 'scaldabagni', 'boiler', 'elettrico'],
    bollitore:       ['boiler', 'scaldabagno', 'solare', 'puffer', 'novasolar'],
    puffer:          ['bollitore', 'solare', 'accumulo'],

    // ── Scaldini a gas ────────────────────────────────────────
    scaldino:        ['scaldini', 'gas', 'ferroli', 'vaillant', 'beretta', 'hermann', 'baxi'],
    scaldini:        ['scaldino', 'gas', 'ferroli', 'vaillant', 'beretta'],
    'scaldino a gas':['scaldini', 'gas', 'beretta', 'vaillant'],

    // ── Radiatori ─────────────────────────────────────────────
    radiatore:       ['radiatori', 'alluminio', 'fondital', 'ferroli', 'acciaio', 'tubolare'],
    radiatori:       ['radiatore', 'alluminio', 'fondital', 'ferroli', 'acciaio'],
    termosifone:     ['radiatore', 'radiatori', 'riscaldamento', 'acciaio'],
    calorifero:      ['radiatore', 'radiatori', 'alluminio', 'termosifone'],
    elemento:        ['radiatore', 'radiatori', 'alluminio', 'fondital'],
    elementi:        ['radiatore', 'radiatori', 'alluminio'],
    tubolare:        ['radiatori tubolari', 'radiatore', 'acciaio'],
    'radiatore a gas': ['radiatori a gas', 'fondital', 'italkero'],
    scaldasalviette: ['scaldasalviette', 'termoarredo', 'elettrico', 'acciaio'],
    termoarredo:     ['scaldasalviette', 'radiatori', 'acciaio', 'portasciugamani'],
    portasciugamani: ['scaldasalviette', 'termoarredo', 'elettrico'],
    asciugamani:     ['scaldasalviette', 'termoarredo', 'elettrico', 'portasciugamani'],

    // ── Stufe / Camini ────────────────────────────────────────
    stufa:           ['stufe', 'pellet', 'legna', 'gas', 'italkero'],
    stufe:           ['stufa', 'pellet', 'legna', 'gas'],
    pellet:          ['stufe a pellet', 'biomassa', 'linea'],
    camino:          ['termocamino', 'stufa', 'legna', 'fumisteria'],
    termocamino:     ['termocamini', 'stufa', 'caldaia', 'biomassa'],
    caminetto:       ['camino', 'termocamino', 'stufa', 'legna'],
    infrarossi:      ['stufa', 'pannello', 'riscaldamento', 'elettrico'],

    // ── Termoregolazione ──────────────────────────────────────
    termostato:      ['termostati', 'cronotermostato', 'temperatura', 'programmatore', 'centralina'],
    termostati:      ['termostato', 'cronotermostato', 'programmatore'],
    cronotermostato: ['termostato', 'programmatore', 'orologio', 'centralina'],
    programmatore:   ['cronotermostato', 'termostato', 'orologio', 'timer'],
    centralina:      ['cronotermostato', 'termostato', 'programmatore'],
    timer:           ['programmatore', 'cronotermostato', 'orologio'],

    // ── Ventilconvettori ──────────────────────────────────────
    ventilconvettore:['ventilconvettori', 'fancoil', 'climatizzazione'],
    fancoil:         ['ventilconvettore', 'ventilconvettori', 'climatizzazione'],

    // ════════════════════════════════════════════════════════════
    // CLIMATIZZAZIONE
    // ════════════════════════════════════════════════════════════
    climatizzatore:  ['climatizzatori', 'condizionatore', 'split', 'ferroli', 'tcl', 'argo', 'daitsu'],
    climatizzatori:  ['climatizzatore', 'condizionatore', 'split', 'ferroli', 'tcl'],
    condizionatore:  ['climatizzatore', 'climatizzatori', 'split', 'pompa di calore'],
    'aria condizionata': ['climatizzatore', 'climatizzatori', 'split', 'condizionatore'],
    split:           ['climatizzatore', 'climatizzatori', 'condizionatore'],
    monosplit:       ['climatizzatore', 'split', 'condizionatore'],
    multisplit:      ['climatizzatore', 'split', 'condizionatore'],
    pompa:           ['pompe', 'calore', 'circolatore', 'elettropompa', 'grundfos', 'ebara'],
    pompe:           ['pompa', 'calore', 'circolatori', 'elettropompe'],
    'pompa di calore': ['climatizzatore', 'condizionatore', 'inverter'],
    circolatore:     ['circolatori', 'pompa', 'grundfos', 'ebara', 'wilo'],
    circolatori:     ['circolatore', 'pompa', 'grundfos', 'ebara'],
    elettropompa:    ['pompa', 'pompe', 'grundfos', 'ebara', 'ideal star'],
    elettropompe:    ['elettropompa', 'pompa', 'grundfos'],
    ventola:         ['unita esterna', 'condizionatore', 'climatizzatore'],
    'unita esterna': ['climatizzatore', 'split', 'condizionatore'],
    deumidificatore: ['daitsu', 'clima', 'umidita'],
    gas:             ['gas', 'r32', 'r410', 'refrigerante', 'bombola'],

    // ════════════════════════════════════════════════════════════
    // IMPIANTO SOLARE
    // ════════════════════════════════════════════════════════════
    solare:          ['pannelli solari', 'kit solare', 'circolazione', 'bollitore', 'puffer', 'far'],
    pannello:        ['pannelli doccia', 'pannelli solari', 'colonna', 'solare', 'inox', 'ferroli'],
    pannelli:        ['pannello', 'solari', 'solare', 'kit', 'ferroli'],
    'kit solare':    ['solare', 'pannelli', 'circolazione', 'bollitore'],
    termico:         ['solare', 'pannelli', 'collettore'],

    // ════════════════════════════════════════════════════════════
    // TENUTA / SIGILLANTI / MINUTERIA
    // ════════════════════════════════════════════════════════════
    guarnizione:     ['guarnizioni', 'tenuta', 'morsetti', 'oring', 'gommino'],
    guarnizioni:     ['guarnizione', 'tenuta', 'morsetti'],
    gommino:         ['guarnizione', 'guarnizioni', 'tenuta', 'oring'],
    oring:           ['guarnizione', 'guarnizioni', 'tenuta', 'gommino', 'anello'],
    anellino:        ['guarnizione', 'guarnizioni', 'oring', 'tenuta'],
    morsetto:        ['guarnizione', 'fascetta', 'collare', 'tenuta'],
    fascetta:        ['morsetto', 'collare', 'stringitubi'],
    collare:         ['fascetta', 'morsetto', 'riparazione'],
    teflon:          ['ptfe', 'nastro', 'sigillante', 'tenuta', 'canapa'],
    ptfe:            ['teflon', 'nastro', 'tenuta'],
    nastro:          ['teflon', 'ptfe', 'sigillante', 'isolante'],
    canapa:          ['stoppa', 'sigillante', 'tenuta', 'lino', 'teflon'],
    stoppa:          ['canapa', 'sigillante', 'tenuta'],
    silicone:        ['sigillante', 'sigillanti', 'soudal', 'henkel', 'biffi'],
    sigillante:      ['silicone', 'sigillanti', 'canapa', 'teflon', 'soudal'],
    sigillanti:      ['sigillante', 'silicone', 'soudal', 'henkel'],
    antigelo:        ['antigelo', 'glicole', 'anticongelante', 'liquido'],
    anticongelante:  ['antigelo', 'glicole', 'liquido'],
    cemento:         ['cemento', 'colla', 'pvc', 'giunzione'],

    // ════════════════════════════════════════════════════════════
    // FILTRI / ADDOLCITORI / VASI ESPANSIONE
    // ════════════════════════════════════════════════════════════
    filtro:          ['filtri', 'addolcitore', 'autopulente', 'contenitore'],
    filtri:          ['filtro', 'addolcitore', 'autopulente'],
    addolcitore:     ['addolcitori', 'sale', 'filtro', 'resina'],
    addolcitori:     ['addolcitore', 'sale', 'filtro'],
    'vaso espansione': ['vasi espansione', 'autoclave', 'membrana'],
    autoclave:       ['autoclavi', 'vaso', 'membrana', 'espansione', 'pressione'],
    autoclavi:       ['autoclave', 'vaso', 'membrana'],
    membrana:        ['vaso', 'autoclave', 'espansione', 'diaframma'],
    riduttore:       ['riduttori', 'pressione', 'acqua', 'honeywell', 'far'],
    riduttori:       ['riduttore', 'pressione', 'acqua'],
    'riduttore di pressione': ['riduttori', 'pressione', 'acqua', 'honeywell'],
    manometro:       ['manometri', 'pressione', 'misura'],
    manometri:       ['manometro', 'pressione'],

    // ════════════════════════════════════════════════════════════
    // FUMISTERIA / SCARICO FUMI
    // ════════════════════════════════════════════════════════════
    canna:           ['fumaria', 'fumisteria', 'tubo', 'inox', 'alluminio'],
    fumaria:         ['canna', 'fumisteria', 'tubo', 'scarico fumi'],
    fumisteria:      ['canna fumaria', 'scarico fumi', 'tubi', 'inox'],
    'canna fumaria': ['fumisteria', 'tubo', 'inox', 'monoparete', 'doppia parete'],
    coassiale:       ['tubi coassiali', 'caldaia', 'scarico fumi'],
    monoparete:      ['canna fumaria', 'fumisteria', 'tubo inox'],
    'doppia parete': ['canna fumaria', 'fumisteria', 'inox'],
    terminale:       ['terminali', 'caldaia', 'scarico fumi', 'coassiale'],
    esalatore:       ['copricaldaia', 'caldaia', 'scarico fumi'],

    // ════════════════════════════════════════════════════════════
    // MOBILE BAGNO / ARREDO
    // ════════════════════════════════════════════════════════════
    mobile:          ['mobili', 'bagno', 'classici', 'moderni', 'sottolavello'],
    mobiletto:       ['mobile', 'mobili', 'bagno', 'arredo'],
    mobili:          ['mobile', 'bagno', 'classici', 'moderni'],
    armadietto:      ['mobile', 'arredo bagno', 'specchio', 'contenitore'],
    specchio:        ['specchi', 'abs', 'filo', 'applique', 'arredo'],
    specchiera:      ['specchio', 'specchi', 'mobile', 'bagno'],
    applique:        ['specchio', 'illuminazione', 'bagno'],
    pensile:         ['mobile', 'sospeso', 'bagno', 'arredo'],
    colonna:         ['set colonna', 'mobile', 'bagno', 'pensile', 'arredo'],
    'porta biancheria': ['porta biancheria', 'cestino', 'bagno'],
    'porta scopino': ['porta scopino', 'scopino', 'bagno'],

    // ── Accessori bagno ───────────────────────────────────────
    accessori:       ['accessori bagno', 'ottone', 'gedy', 'saniplast'],
    portasapone:     ['sapone', 'accessori', 'bagno', 'gedy'],
    portarotolo:     ['carta', 'accessori', 'bagno', 'gedy'],
    portasalviette:  ['salviette', 'accessori', 'bagno'],
    gancio:          ['appendino', 'accessori', 'bagno'],
    appendino:       ['gancio', 'accessori', 'bagno'],
    porta:           ['portasciugamani', 'portasalviette', 'bagno', 'accessori'],
    scopino:         ['porta scopino', 'wc', 'bagno', 'accessori'],
    piantana:        ['portarotolo', 'scopino', 'bagno', 'colonna'],

    // ════════════════════════════════════════════════════════════
    // UTENSILERIA / ATTREZZI
    // ════════════════════════════════════════════════════════════

    // ── Pinze / Morse ─────────────────────────────────────────
    pinza:           ['pinze', 'pinzette', 'tronchese', 'morse'],
    pinze:           ['pinza', 'pinzette', 'tronchese'],
    pinzette:        ['pinza', 'pinze', 'tronchese', 'morse'],
    morse:           ['pinza', 'pinze', 'tronchese', 'morsa'],
    morsa:           ['morse', 'morsetto'],
    tronchese:       ['tronchesi', 'pinza', 'taglio diagonale'],
    tronchesi:       ['tronchese', 'pinza', 'taglio'],
    forbici:         ['forbice', 'cesoie', 'tronchese'],
    forbice:         ['forbici', 'cesoie'],
    cesoie:          ['forbici', 'tronchese', 'taglio'],

    // ── Chiavi ────────────────────────────────────────────────
    chiave:          ['chiavi', 'brugola', 'esagonale', 'dinamometrica', 'radiatore'],
    chiavi:          ['chiave', 'brugola', 'esagonale'],
    brugola:         ['chiave', 'esagonale', 'imbus', 'chiavi', 'allen'],
    imbus:           ['brugola', 'esagonale', 'allen', 'chiave'],
    allen:           ['brugola', 'imbus', 'esagonale'],
    esagonale:       ['brugola', 'chiave', 'imbus', 'allen'],
    dinamometrica:   ['chiave', 'chiavi', 'coppia'],

    // ── Cacciaviti ────────────────────────────────────────────
    cacciavite:      ['cacciaviti', 'giravite', 'phillips', 'taglio'],
    cacciaviti:      ['cacciavite', 'giravite'],
    giravite:        ['cacciavite', 'cacciaviti'],

    // ── Martelli / Mazze ──────────────────────────────────────
    martello:        ['mazza', 'maglio'],
    mazza:           ['martello', 'maglio'],

    // ── Sbavatori / Calibratori ───────────────────────────────
    sbavatore:       ['sbavatori', 'calibratore', 'calibratori'],
    sbavatori:       ['sbavatore', 'calibratore'],
    calibratore:     ['sbavatore', 'sbavatori', 'calibratori'],

    // ── Tagliatubi / Seghetti ─────────────────────────────────
    tagliatubi:      ['taglio', 'tubi', 'cutter'],
    seghetto:        ['sega', 'taglio', 'metallo'],
    sega:            ['seghetto', 'taglio'],
    cutter:          ['taglierino', 'taglio', 'lama'],

    // ── Saldatura ─────────────────────────────────────────────
    saldatura:       ['saldare', 'stagno', 'brasatura', 'disossidante', 'cannello'],
    saldare:         ['saldatura', 'stagno', 'brasatura'],
    brasatura:       ['saldatura', 'saldare', 'cannello'],
    stagno:          ['saldatura', 'saldare', 'lega', 'piombo'],
    disossidante:    ['stagno', 'saldatura', 'flussante'],
    cannello:        ['cannelli', 'saldatura', 'brasatura'],
    cannelli:        ['cannello', 'saldatura', 'brasatura'],

    // ── Frese ─────────────────────────────────────────────────
    fresa:           ['frese', 'hss', 'punte', 'utensileria'],
    frese:           ['fresa', 'hss', 'punta', 'utensileria'],

    // ── Curvatubi ─────────────────────────────────────────────
    curvatubi:       ['curva tubi', 'rame', 'condizionamento', 'piegatura'],
    piegatubi:       ['curvatubi', 'piegatura', 'rame'],

    // ════════════════════════════════════════════════════════════
    // GAS / CONTATORI / REGOLATORI
    // ════════════════════════════════════════════════════════════
    contatore:       ['contatori', 'acqua', 'gas', 'sportello'],
    contatori:       ['contatore', 'acqua', 'gas'],
    sportello:       ['cassetto', 'contatore', 'gas', 'acqua'],
    regolatore:      ['regolatori gas', 'bombola', 'cavagna', 'novacomet'],
    regolatori:      ['regolatore', 'gas', 'bombola', 'pressione'],
    bombola:         ['gas', 'regolatore', 'rubinetto'],
    elettrovalvola:  ['elettrovalvole', 'gas', 'acqua', 'valvola'],
    elettrovalvole:  ['elettrovalvola', 'gas', 'acqua'],
    manichetta:      ['manichette', 'gas', 'flessibile', 'cucine'],
    manichette:      ['manichetta', 'gas', 'cucine'],

    // ════════════════════════════════════════════════════════════
    // PRODOTTI CHIMICI / TRATTAMENTO ACQUA
    // ════════════════════════════════════════════════════════════
    anticalcare:     ['disincrostante', 'trattamento', 'acqua', 'magnetico'],
    disincrostante:  ['anticalcare', 'acido', 'pulizia', 'impianto'],
    descaler:        ['anticalcare', 'disincrostante', 'caldaia'],
    liquido:         ['antigelo', 'glicole', 'trattamento', 'impianto'],
    glicole:         ['antigelo', 'liquido', 'trattamento'],
    'prodotti chimici': ['biffi', 'camon', 'faren', 'soudal'],
    neutralizzatore: ['condensa', 'caldaia', 'acido'],

    // ════════════════════════════════════════════════════════════
    // SCARICHI PVC / RACCOLTA
    // ════════════════════════════════════════════════════════════
    pozzetto:        ['pozzetti', 'chiusino', 'scarico', 'raccolta'],
    pozzetti:        ['pozzetto', 'chiusini', 'scarico'],
    chiusino:        ['pozzetto', 'pozzetti', 'coperchio'],
    griglia:         ['griglie', 'aerazione', 'piletta', 'scarico'],
    griglie:         ['griglia', 'aerazione', 'scarico', 'piletta'],
    canale:          ['canaline', 'griglia', 'scarico'],

    // ════════════════════════════════════════════════════════════
    // ISOLAMENTO / TUBI
    // ════════════════════════════════════════════════════════════
    isolante:        ['tubo', 'nastro', 'isolamento', 'espanso'],
    fonoisolante:    ['tubi', 'ppc', 'sitech', 'scarico', 'silenzioso'],
    'tubo gas':      ['manichetta', 'gas', 'guaina', 'tubazione'],

    // ════════════════════════════════════════════════════════════
    // MISURE / ATTRIBUTI GENERALI
    // ════════════════════════════════════════════════════════════
    '24kw':          ['24', 'kw', 'kilowatt'],
    '18kw':          ['18', 'kw'],
    '28kw':          ['28', 'kw'],
    '32kw':          ['32', 'kw'],
    grande:          ['xxl', 'grande', 'maxi'],
    piccolo:         ['mini', 'compact', 'ridotto'],
    incassato:       ['incasso', 'a incasso'],
    terra:           ['a terra', 'tradizionale', 'classico', 'colonna'],
    parete:          ['sospeso', 'murale', 'a parete', 'parete'],
    inox:            ['acciaio inox', 'acciaio', 'inossidabile'],
    cromato:         ['cromo', 'cromata', 'cromati'],
    bianco:          ['bianca', 'bianchi', 'bianche'],
    nero:            ['nera', 'neri', 'nere', 'nero matt', 'opaco'],
    opaco:           ['nero', 'bianco', 'satinato', 'matt'],
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
    tazzone:     ['sanitari in ceramica'],
    wc:          ['sanitari in ceramica'],
    water:       ['sanitari in ceramica'],
    gabinetto:   ['sanitari in ceramica'],
    cesso:       ['sanitari in ceramica'],
    sanitario:   ['sanitari in ceramica'],
    sanitari:    ['sanitari in ceramica'],
    vaso:        ['sanitari in ceramica'],

    // ── Sedili / Copriwater ───────────────────────────────────
    sedile:      ['sedili wc', 'accessori wc'],
    sedili:      ['sedili wc', 'accessori wc'],
    copriwater:  ['sedili wc', 'accessori wc'],
    tavoletta:   ['sedili wc', 'accessori wc'],
    asse:        ['sedili wc', 'accessori wc'],
    ciambella:   ['sedili wc', 'accessori wc'],

    // ── Sciacquone / Cassette ─────────────────────────────────
    sciacquone:  ['cassette incasso', 'cassette a zaino'],
    vaschetta:   ['cassette incasso', 'cassette a zaino'],

    // ── Placche scarico ───────────────────────────────────────
    placca:      ['placche di comando', 'accessori cassette'],
    placche:     ['placche di comando', 'accessori cassette'],
    pulsante:    ['placche di comando', 'accessori cassette'],
    bottone:     ['placche di comando', 'accessori cassette'],
    tastiera:    ['placche di comando', 'accessori cassette'],

    // ── Bidet ────────────────────────────────────────────────
    bidet:       ['sanitari in ceramica', 'moduli fix'],

    // ── Lavabo / Lavandino ───────────────────────────────────
    lavabo:      ['sanitari in ceramica', 'lavabi'],
    lavabi:      ['sanitari in ceramica', 'lavabi'],
    lavandino:   ['sanitari in ceramica', 'lavabi'],
    catinella:   ['sanitari in ceramica', 'lavabi'],
    lavello:     ['lavelli inox'],
    lavelli:     ['lavelli inox'],
    acquaio:     ['lavelli inox'],
    lavapiatti:  ['lavelli inox'],
    lavatoio:    ['lavatoi'],
    pilozzo:     ['lavatoi'],

    // ── Piatti doccia / Box ──────────────────────────────────
    piatto:      ['piatti doccia'],
    base:        ['piatti doccia'],
    pannello:    ['pannelli doccia', 'pannelli solari'],
    doccia:      ['piatti doccia', 'box doccia', 'set colonna'],
    box:         ['box doccia'],
    vasca:       ['vasche'],
    cabina:      ['box doccia'],
    vetri:       ['box doccia'],

    // ── Soffioni / Set doccia ────────────────────────────────
    soffione:    ['soffioni'],
    soffioni:    ['soffioni'],
    cipolla:     ['soffioni'],
    doccione:    ['soffioni'],
    pigna:       ['soffioni'],
    doccetta:    ['doccette'],
    doccette:    ['doccette'],
    doccino:     ['doccette'],
    microfono:   ['doccette'],

    saliscendi:  ['saliscendi'],
    asta:        ['saliscendi'],
    palo:        ['saliscendi'],
    barra:       ['saliscendi'],
    colonna:     ['set colonna'],
    braccio:     ['bracci doccia'],
    sgabello:    ['sgabelli doccia'],

    // ── Cassette ─────────────────────────────────────────────
    cassetta:    ['cassette incasso', 'cassette a zaino'],
    cassette:    ['cassette incasso', 'cassette a zaino'],
    incasso:     ['cassette incasso'],
    zaino:       ['cassette a zaino'],

    // ── Rubinetteria ─────────────────────────────────────────
    rubinetto:   ['rubinetteria monocomando', 'rubinetteria tre fori', 'rubinetteria tradizionale', 'rubinetteria leva'],
    rubinetti:   ['rubinetteria monocomando', 'rubinetteria tre fori', 'rubinetteria tradizionale'],
    fontana:     ['rubinetteria monocomando', 'rubinetteria tre fori'],
    miscelatore: ['rubinetteria monocomando', 'rubinetteria tre fori', 'miscelatori termostatici'],
    miscelatori: ['rubinetteria monocomando', 'rubinetteria tre fori', 'miscelatori termostatici'],
    monocomando: ['rubinetteria monocomando'],

    // ── Caldaie ───────────────────────────────────────────────
    caldaia:     ['caldaie a gas'],
    caldaie:     ['caldaie a gas'],

    // ── Scaldabagni ───────────────────────────────────────────
    scaldabagno: ['scaldabagni'],
    scaldabagni: ['scaldabagni'],
    scaldacqua:  ['scaldabagni'],
    boiler:      ['scaldabagni'],
    bollitore:   ['bollitori'],
    solare:      ['pannelli solari', 'kit solare'],
    scaldino:    ['scaldini a gas'],
    scaldini:    ['scaldini a gas'],

    // ── Radiatori ─────────────────────────────────────────────
    radiatore:   ['radiatori in alluminio', 'radiatori tubolari', 'radiatori a gas'],
    radiatori:   ['radiatori in alluminio', 'radiatori tubolari', 'radiatori a gas'],
    termosifone: ['radiatori in alluminio', 'radiatori tubolari'],
    calorifero:  ['radiatori in alluminio', 'radiatori tubolari'],
    elemento:    ['radiatori in alluminio', 'radiatori tubolari'],
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
    centralina:  ['cronotermostati'],

    // ── Valvole ───────────────────────────────────────────────
    valvola:     ['valvole a sfera', 'valvole e detentori'],
    valvole:     ['valvole a sfera', 'valvole e detentori'],
    detentore:   ['valvole e detentori'],
    detentori:   ['valvole e detentori'],
    manopola:    ['valvole termostatiche', 'valvole e detentori'],
    rotella:     ['valvole termostatiche', 'valvole e detentori'],

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
    collo:       ['sifoni'],              // "collo d'oca"
    piletta:     ['pilette'],
    pilette:     ['pilette'],
    saltarello:  ['pilette'],
    tappo:       ['pilette'],

    // ── Minuteria / Tenuta ────────────────────────────────────
    aeratore:    ['aeratori'],
    aeratori:    ['aeratori'],
    rompigetto:  ['aeratori'],
    retina:      ['aeratori'],
    filtrino:    ['aeratori'],

    // ── Flessibili ────────────────────────────────────────────
    flessibile:  ['flessibili inox', 'flessibili acciaio'],
    flessibili:  ['flessibili inox', 'flessibili acciaio'],
    laccio:      ['flessibili doccia', 'flessibili inox'],
    cordino:     ['flessibili doccia', 'flessibili inox'],

    // ── Climatizzatori ────────────────────────────────────────
    climatizzatore: ['climatizzatori'],
    climatizzatori: ['climatizzatori'],
    condizionatore: ['climatizzatori'],
    split:          ['climatizzatori'],

    // ── Utensileria ───────────────────────────────────────────
    pinza:       ['utensileria'],
    pinze:       ['utensileria'],
    pinzette:    ['utensileria'],
    tronchese:   ['utensileria'],
    chiave:      ['utensileria'],
    chiavi:      ['utensileria'],
    brugola:     ['utensileria'],
    forbici:     ['utensileria'],
    cacciavite:  ['utensileria'],
    cacciaviti:  ['utensileria'],
    martello:    ['utensileria'],
    sbavatore:   ['utensileria'],
    tagliatubi:  ['utensileria'],
    saldatura:   ['utensileria', 'cannelli per saldatura'],
    fresa:       ['utensileria'],
    frese:       ['utensileria'],
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
 *  - AND logic (tutti i token devono matchare) oppure OR mode (almeno 1 token)
 *  - Bonus per match nel nome / categoria
 *  - Bonus per codice articolo
 *  - Sistema TIER: prodotto principale > accessorio > ricambio
 *  - Se l'utente cerca esplicitamente "ricambi" → tier ignorato
 * @param orMode - Se true usa logica OR (almeno 1 token deve matchare)
 */
function scoreProduct(
    product: Product,
    queryTokens: string[],
    queryIntent: 'main' | 'accessory' | 'spare',
    orMode = false,
): number {
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
    let matchedTokens = 0;

    for (const token of queryTokens) {
        let bestTokenScore = 0;

        // Cerca il punteggio migliore tra tutti i campi
        for (const [fieldName, fieldData] of Object.entries(fields) as [keyof typeof FIELD_WEIGHTS, FieldData][]) {
            const s = scoreTokenAgainstField(token, fieldData) * FIELD_WEIGHTS[fieldName];
            if (s > bestTokenScore) bestTokenScore = s;
        }

        if (bestTokenScore === 0) {
            // AND mode: se un token non matcha → prodotto escluso subito
            if (!orMode) return 0;
            // OR mode: token non matcha ma continuiamo
        } else {
            totalScore += bestTokenScore;
            matchedTokens++;
        }
    }

    // OR mode: almeno 1 token deve matchare
    if (orMode && matchedTokens === 0) return 0;

    // In OR mode: penalità proporzionale ai token non matchati
    // (es. 2 token su 3 = 66%, penalità 33%)
    if (orMode && matchedTokens < queryTokens.length) {
        totalScore = Math.round(totalScore * (matchedTokens / queryTokens.length) * 0.7);
    }

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

    // Prima prova con logica AND (tutti i token devono matchare)
    const scored: ScoredProduct[] = products
        .map(product => ({
            product,
            score: scoreProduct(product, queryTokens, queryIntent),
        }))
        .filter(sp => sp.score > 0);

    scored.sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
        return scored.map(sp => sp.product);
    }

    // Fallback OR: se AND non produce risultati con query multi-token,
    // almeno un token deve matchare (con penalità sul punteggio)
    if (queryTokens.length > 1) {
        const scoredOR: ScoredProduct[] = products
            .map(product => ({
                product,
                score: scoreProduct(product, queryTokens, queryIntent, true),
            }))
            .filter(sp => sp.score > 0);

        scoredOR.sort((a, b) => b.score - a.score);
        return scoredOR.map(sp => sp.product);
    }

    return [];
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
