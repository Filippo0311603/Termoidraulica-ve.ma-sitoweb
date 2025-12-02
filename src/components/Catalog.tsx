import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Product } from '../types';
import { COLORS } from '../utils/constants';
import ProductImage from './ProductImage';
import ProductModal from './ProductModal';

const Catalog = ({
    products,
    favorites,
    toggleFavorite,
    isLoading,
    errorMsg
}: {
    products: Product[],
    favorites: (string | number)[],
    toggleFavorite: (id: string | number) => void,
    isLoading: boolean,
    errorMsg: string
}) => {
    useScrollReveal();
    const [activeCat, setActiveCat] = useState("Tutti");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const uniqueCategories = [...new Set(products.map(p => p.category))];
    uniqueCategories.sort();
    const categories = ["Tutti", ...uniqueCategories];

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCat === "Tutti" || product.category === activeCat;

        if (!searchQuery.trim()) return matchesCategory;

        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
        const productDataString = `
        ${product.name} 
        ${product.id} 
        ${product.category} 
        ${product.desc} 
        ${product.specs ? product.specs.join(" ") : ""}
      `.toLowerCase();

        const matchesSearch = searchTerms.every(term => productDataString.includes(term));

        return matchesCategory && matchesSearch;
    });

    const visibleProducts = filteredProducts.slice(0, visibleCount);

    useEffect(() => {
        setVisibleCount(12);
    }, [activeCat, searchQuery]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 12);
    };

    return (
        <section id="prodotti" className="py-24 bg-white">
            <style>{`
          @keyframes simpleFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .product-enter {
            animation: simpleFadeIn 0.5s ease-out forwards;
          }
        `}</style>

            <div className="container mx-auto px-6">
                {/* HEADER DEL CATALOGO (SEMPRE VISIBILE) */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-8 reveal gap-6">

                    <div className="w-full lg:w-1/2">
                        <h2 className={`text-4xl font-bold ${COLORS.primary} mb-2`}>Il Nostro Catalogo</h2>
                        <p className="text-gray-600 mb-6">
                            {isLoading ? "Caricamento in corso..." : `${filteredProducts.length} prodotti trovati`}
                        </p>

                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Cerca (es. 'Galleggiante', 'Geberit 7300', 'Caldaia 24kw')..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm text-gray-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                {inputValue !== searchQuery ? (<i className="fas fa-spinner fa-spin text-blue-500"></i>) : (<i className="fas fa-search text-lg"></i>)}
                            </div>
                            {inputValue && (
                                <button onClick={() => setInputValue("")} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
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
                                //-label="Filtra prodotti per categoria"
                                className={`w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 pl-12 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 cursor-pointer shadow-sm font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {categories.map(cat => (<option key={cat} value={cat}>{cat === "Tutti" ? "Tutte le Categorie" : cat}</option>))}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"><i className="fas fa-chevron-down text-xs"></i></div>
                        </div>
                        {activeCat !== "Tutti" && (<button onClick={() => setActiveCat("Tutti")} className="bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl border border-red-200 transition-colors flex-shrink-0" title="Annulla Filtro Categoria"><i className="fas fa-times"></i></button>)}
                    </div>
                </div>

                {/* AREA GRIGLIA: QUI GESTIAMO LOADING E ERRORI */}
                <div id="catalog" className="min-h-[400px]">
                    {isLoading ? (
                        // SPINNER DI CARICAMENTO (DENTRO LA SEZIONE)
                        <div className="flex flex-col items-center justify-center py-20 h-full">
                            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400 text-sm animate-pulse">Stiamo recuperando il listino aggiornato...</p>
                        </div>
                    ) : errorMsg ? (
                        // MESSAGGIO DI ERRORE
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Errore di caricamento</h3>
                            <p className="text-gray-500">{errorMsg}</p>
                            <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 font-bold hover:underline">Riprova</button>
                        </div>
                    ) : (
                        // GRIGLIA PRODOTTI REALE
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {visibleProducts.length > 0 ? (
                                    visibleProducts.map((product) => (
                                        <div key={product.id} className="product-enter group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer relative" onClick={() => setSelectedProduct(product)}>

                                            <ProductImage
                                                src={product.image}
                                                alt={product.name}
                                                category={product.category}
                                            />

                                            {/* Tasto Preferiti sulla Card */}
                                            <button
                                                type="button" // È buona norma specificare type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(product.id);
                                                }}
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
                                                <div className="flex items-center text-sm font-semibold text-blue-900 group-hover:translate-x-2 transition-transform">
                                                    Dettagli <i className="fas fa-arrow-right ml-2"></i>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                        <div className="text-gray-300 text-6xl mb-4"><i className="fas fa-search"></i></div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nessun prodotto trovato</h3>
                                        <p className="text-gray-500">
                                            Non abbiamo trovato risultati per "{inputValue}"
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
                onClose={() => setSelectedProduct(null)}
                isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
                onToggleFavorite={() => selectedProduct && toggleFavorite(selectedProduct.id)}
            />
        </section>
    );
};

export default Catalog;
