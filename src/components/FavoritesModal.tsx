import { Product } from '../types';

interface FavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    favorites: (string | number)[];
    products: Product[];
    toggleFavorite: (id: string | number) => void;
}

const FavoritesModal = ({ isOpen, onClose, favorites, products, toggleFavorite }: FavoritesModalProps) => {
    if (!isOpen) return null;

    const favoriteProducts = products.filter(p => favorites.includes(p.id));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>

                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                        <i className="fas fa-heart text-red-500"></i> La tua Lista dei Desideri
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <i className="fas fa-times text-xl text-gray-500"></i>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    {favoriteProducts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <i className="far fa-heart text-4xl mb-4 text-gray-300"></i>
                            <p>Non hai ancora salvato nessun prodotto.</p>
                            <button onClick={onClose} className="mt-4 text-blue-600 font-bold hover:underline">Torna al catalogo</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {favoriteProducts.map(product => (
                                <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h4>
                                        <p className="text-xs text-gray-500 mb-1">Cod: {product.id}</p>
                                        <p className="text-orange-500 font-bold">{product.price}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleFavorite(product.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                        title="Rimuovi dai preferiti"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <p className="text-xs text-gray-500 text-center mb-4">
                        <i className="fas fa-info-circle mr-1"></i>
                        Mostra questa lista in negozio per richiedere i prodotti.
                    </p>
                    <button onClick={onClose} className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
                        Chiudi Lista
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FavoritesModal;
