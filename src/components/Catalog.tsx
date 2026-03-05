import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Product } from '../types';
import { COLORS } from '../utils/constants';
import ProductImage from './ProductImage';
import ProductModal from './ProductModal';
import { smartSearch } from '../utils/searchEngine';

const Catalog = ({
    products,
    favorites,
    toggleFavorite,
    addToCart,
    isLoading,
    errorMsg
}: {
    products: Product[],
    favorites: (string | number)[],
    toggleFavorite: (id: string | number) => void,
    addToCart: (product: Product) => void,
    isLoading: boolean,
    errorMsg: string
}) => {
    useScrollReveal();
    const [activeCat, setActiveCat] = useState("Tutti");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

    const [visibleCount, setVisibleCount] = useState(12);
    const overlayInputRef = useRef<HTMLInputElement>(null);
    const inlineInputRef = useRef<HTMLInputElement>(null);

    // Debounce per la griglia principale
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    // Blocca lo scroll quando l'overlay è aperto
    useEffect(() => {
        document.body.style.overflow = isSearchOverlayOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isSearchOverlayOpen]);

    // Focus automatico sull'input dell'overlay quando si apre
    useEffect(() => {
        if (isSearchOverlayOpen) {
            setTimeout(() => overlayInputRef.current?.focus(), 50);
        }
    }, [isSearchOverlayOpen]);

    // Chiudi con Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeOverlay();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const openOverlay = () => setIsSearchOverlayOpen(true);

    const closeOverlay = () => {
        setIsSearchOverlayOpen(false);
        // L'input nella griglia rimane con il testo digitato → la griglia mostra i risultati
    };

    const uniqueCategories = [...new Set(products.map(p => p.category))];
    uniqueCategories.sort();
    const categories = ["Tutti", ...uniqueCategories];

    // Suggerimenti live sull'input dell'overlay (senza debounce, su tutti i prodotti)
    const suggestions = useMemo(() => {
        if (inputValue.trim().length < 2) return [];
        return smartSearch(products, inputValue).slice(0, 8);
    }, [products, inputValue]);

    // Click su un suggerimento → apre il prodotto e chiude l'overlay
    const handleSuggestionClick = useCallback((product: Product) => {
        setSelectedProduct(product);
        setInputValue("");
        setSearchQuery("");
        setIsSearchOverlayOpen(false);
    }, []);

    // "Vedi tutti i risultati" → chiude l'overlay, la griglia mostra i risultati filtrati
    const handleViewAllResults = () => {
        closeOverlay();
        // Scrolla alla griglia
        setTimeout(() => {
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // ========== SMART SEARCH ENGINE (v2) ==========
    const filteredProducts = useMemo(() => {
        let results = activeCat === "Tutti"
            ? products
            : products.filter(p => p.category === activeCat);
        if (searchQuery.trim()) {
            results = smartSearch(results, searchQuery);
        }
        return results;
    }, [products, activeCat, searchQuery]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);

    useEffect(() => {
        setVisibleCount(12);
    }, [activeCat, searchQuery]);

    const handleLoadMore = () => setVisibleCount(prev => prev + 12);

    return (
        <>
        {/* ══════════════════════════════════════════════════
            OVERLAY DI RICERCA (stile Amazon / fullscreen)
        ══════════════════════════════════════════════════ */}
        {isSearchOverlayOpen && (
            <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: 'rgba(10,20,40,0.85)', backdropFilter: 'blur(4px)' }}>

                {/* Barra superiore con input */}
                <div className="bg-white w-full px-4 py-4 shadow-xl flex items-center gap-3">
                    {/* Freccia indietro / chiudi */}
                    <button
                        onClick={closeOverlay}
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                        aria-label="Chiudi ricerca"
                    >
                        <i className="fas fa-arrow-left text-lg"></i>
                    </button>

                    {/* Input di ricerca */}
                    <div className="relative flex-1">
                        <input
                            ref={overlayInputRef}
                            type="text"
                            placeholder="Cerca prodotti... (es. tazza, boiler ferroli, 73000)"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full pl-5 pr-10 py-3 rounded-full border-2 border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-800 text-base shadow-inner"
                        />
                        {inputValue && (
                            <button
                                onClick={() => setInputValue("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Area risultati / suggerimenti */}
                <div className="flex-1 overflow-y-auto">
                    {inputValue.trim().length < 2 ? (
                        /* Stato vuoto */
                        <div className="flex flex-col items-center justify-center py-20 text-white/60 gap-4">
                            <i className="fas fa-search text-5xl"></i>
                            <p className="text-lg">Inizia a digitare per cercare un prodotto</p>
                        </div>
                    ) : suggestions.length === 0 ? (
                        /* Nessun risultato */
                        <div className="flex flex-col items-center justify-center py-20 text-white/60 gap-4">
                            <i className="fas fa-box-open text-5xl"></i>
                            <p className="text-lg">Nessun prodotto trovato per "<strong className="text-white">{inputValue}</strong>"</p>
                        </div>
                    ) : (
                        /* Lista suggerimenti */
                        <div className="max-w-2xl mx-auto mt-3 px-3">
                            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-2 px-1">
                                {suggestions.length} suggerimenti
                            </p>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                                {suggestions.map((product, idx) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleSuggestionClick(product)}
                                        className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-blue-50 active:bg-blue-100 transition-colors text-left ${idx < suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                                            <img
                                                src={product.image || '/placeholder.webp'}
                                                alt={product.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.webp'; }}
                                            />
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{product.category}</p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">Cod. {product.id}</p>
                                        </div>
                                        {/* Prezzo + icona */}
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <span className="text-sm font-bold text-orange-500">{product.price}</span>
                                            <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Pulsante "Vedi tutti i risultati" */}
                            <button
                                onClick={handleViewAllResults}
                                className="w-full mt-3 py-3.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                            >
                                <i className="fas fa-border-all text-sm"></i>
                                Vedi tutti i risultati per "{inputValue}"
                            </button>
                            <div className="pb-8" />
                        </div>
                    )}
                </div>
            </div>
        )}

        <section id="prodotti" className="py-24 bg-white">
            <style>{`
              @keyframes simpleFadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .product-enter { animation: simpleFadeIn 0.5s ease-out forwards; }
            `}</style>

            <div className="container mx-auto px-6">
                {/* HEADER DEL CATALOGO */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-8 reveal gap-6">

                    <div className="w-full lg:w-1/2">
                        <h2 className={`text-4xl font-bold ${COLORS.primary} mb-2`}>Il Nostro Catalogo</h2>
                        <p className="text-gray-600 mb-6">
                            {isLoading ? "Caricamento in corso..." : `${filteredProducts.length} prodotti trovati`}
                        </p>

                        {/* BARRA DI RICERCA — click apre l'overlay */}
                        <div className="relative w-full">
                            <input
                                ref={inlineInputRef}
                                type="text"
                                readOnly
                                placeholder="Cerca per nome, codice o sinonimo..."
                                value={searchQuery}
                                onClick={openOverlay}
                                onFocus={openOverlay}
                                disabled={isLoading}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm text-gray-700 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <i className="fas fa-search text-lg"></i>
                            </div>
                            {searchQuery && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setInputValue(""); setSearchQuery(""); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/3 flex items-center gap-3">
                        <div className="relative w-full">
                            <label htmlFor="category-select" className="sr-only">Seleziona categoria</label>
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-900 pointer-events-none"><i className="fas fa-filter"></i></div>
                            <select
                                id="category-select"
                                value={activeCat}
                                onChange={(e) => setActiveCat(e.target.value)}
                                disabled={isLoading}
                                className={`w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 pl-12 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 cursor-pointer shadow-sm font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {categories.map(cat => (<option key={cat} value={cat}>{cat === "Tutti" ? "Tutte le Categorie" : cat}</option>))}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"><i className="fas fa-chevron-down text-xs"></i></div>
                        </div>
                        {activeCat !== "Tutti" && (
                            <button onClick={() => setActiveCat("Tutti")} className="bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl border border-red-200 transition-colors flex-shrink-0" title="Annulla Filtro Categoria">
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* AREA GRIGLIA */}
                <div id="catalog" className="min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 h-full">
                            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400 text-sm animate-pulse">Stiamo recuperando il listino aggiornato...</p>
                        </div>
                    ) : errorMsg ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Errore di caricamento</h3>
                            <p className="text-gray-500">{errorMsg}</p>
                            <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 font-bold hover:underline">Riprova</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {visibleProducts.length > 0 ? (
                                    visibleProducts.map((product: Product) => (
                                        <div key={product.id} className="product-enter group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer relative" onClick={() => setSelectedProduct(product)}>
                                            <ProductImage src={product.image} alt={product.name} category={product.category} />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                                                aria-label={favorites.includes(product.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                                                className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 ${favorites.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
                                            >
                                                <i className={`${favorites.includes(product.id) ? 'fas' : 'far'} fa-heart`}></i>
                                            </button>
                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-900 transition-colors line-clamp-1">{product.name}</h3>
                                                    <span className={`${COLORS.secondary} font-bold text-lg whitespace-nowrap`}>{product.price}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mb-2 font-mono">Cod: {product.id}</p>
                                                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{product.desc}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center text-sm font-semibold text-blue-900 group-hover:translate-x-2 transition-transform">
                                                        Dettagli <i className="fas fa-arrow-right ml-2"></i>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-110 z-20"
                                                        title="Aggiungi al carrello"
                                                    >
                                                        <i className="fas fa-cart-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                        <div className="text-gray-300 text-6xl mb-4"><i className="fas fa-search"></i></div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nessun prodotto trovato</h3>
                                        <p className="text-gray-500">
                                            Non abbiamo trovato risultati per "{searchQuery}"
                                            {activeCat !== "Tutti" && <span> nella categoria "<strong>{activeCat}</strong>"</span>}.
                                            <br />Prova a cercare un termine più generico.
                                        </p>
                                        <button onClick={() => { setInputValue(""); setSearchQuery(""); setActiveCat("Tutti"); }} className="mt-6 text-blue-600 font-bold hover:underline">Resetta Filtri</button>
                                    </div>
                                )}
                            </div>

                            {visibleCount < filteredProducts.length && (
                                <div className="mt-16 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-500 px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-sm"
                                    >
                                        Carica altri prodotti ({filteredProducts.length - visibleCount} rimanenti)
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <ProductModal
                product={selectedProduct}
                allProducts={products}
                onClose={() => setSelectedProduct(null)}
                isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
                onToggleFavorite={() => selectedProduct && toggleFavorite(selectedProduct.id)}
                onAddToCart={() => selectedProduct && addToCart(selectedProduct)}
                onSelectProduct={(product) => setSelectedProduct(product)}
            />
        </section>
        </>
    );
};

export default Catalog;
