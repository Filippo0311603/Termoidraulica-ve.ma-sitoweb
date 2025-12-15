import { Product } from '../types';
import { COLORS } from '../utils/constants';
import { useMemo } from 'react';

interface ProductModalProps {
    product: Product | null;
    allProducts?: Product[];
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onAddToCart: () => void;
    onSelectProduct?: (product: Product) => void;
}

const ProductModal = ({ product, allProducts = [], onClose, isFavorite, onToggleFavorite, onAddToCart, onSelectProduct }: ProductModalProps) => {
    
    const relatedProducts = useMemo(() => {
        if (!product || !allProducts.length) return [];

        // 1. Filter by same category
        let candidates = allProducts.filter(p => 
            p.id !== product.id && 
            p.category === product.category
        );

        // 2. Try to find "Series" match
        const stopWords = ["VASO", "BIDET", "LAVABO", "SOSPESO", "TERRA", "FILO", "MURO", "MONOBLOCCO", "CASSETTA", "INCASSO", "PLACCA", "SCARICO", "DOPPIO", "SINGOLO", "BIANCO", "CROMO", "RUBINETTO", "MISCELATORE", "LAVELLO", "CUCINA", "BAGNO", "DOCCIA", "COLONNA", "SALISCENDI", "KIT", "COMPLETO", "SENZA", "CON", "SEDILE", "COPRIWATER", "SOFT", "CLOSE", "RALLENTATO", "STANDARD", "UNIVERSALE", "CM", "MM", "PER", "DI", "E", "A", "DA", "IN", "IL", "LO", "LA", "I", "GLI", "LE"];
        
        const nameWords = product.name.toUpperCase().split(/[\s\-\/]+/);
        const keywords = nameWords.filter(w => w.length > 2 && !stopWords.includes(w) && isNaN(Number(w)));

        if (keywords.length > 0) {
            // Score candidates based on keyword matches
            const scored = candidates.map(p => {
                let score = 0;
                const pName = p.name.toUpperCase();
                keywords.forEach(k => {
                    if (pName.includes(k)) score += 1;
                });
                return { product: p, score };
            });

            // Filter those with at least one match and sort by score
            const matches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
            
            if (matches.length > 0) {
                return matches.slice(0, 3).map(s => s.product);
            }
        }

        // Fallback: just return random 3 from same category
        return candidates.slice(0, 3);
    }, [product, allProducts]);

    if (!product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative modal-enter modal-enter-active" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-gray-100 shadow-sm">
                    <i className="fas fa-times text-xl text-gray-800"></i>
                </button>
                
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2 h-64 md:h-auto min-h-[400px] bg-gray-100 relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {product.category}
                        </div>
                        {product.stock !== undefined && (
                            <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${product.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {product.stock > 0 ? 'Disponibile' : 'Su Ordinazione'}
                            </div>
                        )}
                    </div>
                    <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h3>
                        <p className={`text-2xl font-bold ${COLORS.secondary} mb-6`}>{product.price}</p>
                        <p className="text-gray-600 mb-6 leading-relaxed">{product.desc}</p>

                        <div className="mb-8">
                            <h4 className="font-bold text-gray-900 mb-3">Caratteristiche Tecniche:</h4>
                            <ul className="grid grid-cols-2 gap-2">
                                {product.specs?.map((spec: string, i: number) => (
                                    <li key={i} className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-check text-green-500 mr-2"></i> {spec}
                                    </li>
                                ))}
                            </ul>

                            {product.datasheet && (
                                <div className="mt-6">
                                    <a 
                                        href={product.datasheet} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold hover:bg-gray-200 transition-colors border border-gray-200"
                                    >
                                        <i className="fas fa-file-pdf text-red-500 text-xl"></i> Scarica Scheda Tecnica
                                    </a>
                                    <p className="text-xs text-gray-500 mt-2">
                                        <i className="fas fa-info-circle mr-1"></i> Tutte le misure e le specifiche tecniche sono consultabili nel PDF.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={() => {
                                    onAddToCart();
                                    onClose();
                                }}
                                className="flex-1 bg-orange-500 text-white text-center py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-cart-plus"></i> Aggiungi al Carrello
                            </button>
                            <button
                                onClick={onToggleFavorite}
                                aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                                className={`px-4 py-3 border rounded-xl transition-all ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                            >
                                <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                <i className="fas fa-info-circle mr-1"></i> I resi sono accettati. Le spese di spedizione per il reso sono a carico del cliente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RELATED PRODUCTS SECTION */}
                {relatedProducts.length > 0 && (
                    <div className="p-8 bg-gray-50 border-t border-gray-100">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">Potrebbe interessarti anche...</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {relatedProducts.map(relProduct => (
                                <div 
                                    key={relProduct.id} 
                                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex gap-4 items-center"
                                    onClick={() => onSelectProduct && onSelectProduct(relProduct)}
                                >
                                    <img src={relProduct.image} alt={relProduct.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-gray-800 text-sm truncate">{relProduct.name}</h5>
                                        <p className="text-orange-500 font-bold text-sm">{relProduct.price}</p>
                                    </div>
                                    <button className="text-gray-400 hover:text-orange-500">
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductModal;
