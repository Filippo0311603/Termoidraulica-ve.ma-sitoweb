import { CartItem } from '../types';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    updateQuantity: (id: string | number, delta: number) => void;
    removeFromCart: (id: string | number) => void;
    onCheckout: (total: number) => void;
}

const CartModal = ({ isOpen, onClose, cartItems, updateQuantity, removeFromCart, onCheckout }: CartModalProps) => {
    if (!isOpen) return null;

    const parsePrice = (priceStr: string) => {
        // Rimuovi tutto tranne numeri, punti e virgole
        // Esempio: "€ 1.200,50" -> "1200.50"
        // 1. Rimuovi simboli valuta e spazi
        let clean = priceStr.replace(/[€\s]/g, '');
        // 2. Se c'è un punto come separatore migliaia e una virgola come decimale (formato IT), rimuovi i punti e cambia virgola in punto
        if (clean.includes(',') && clean.includes('.')) {
             clean = clean.replace(/\./g, '').replace(',', '.');
        } else if (clean.includes(',')) {
            // Solo virgola (es 10,50) -> 10.50
            clean = clean.replace(',', '.');
        }
        // Se c'è solo il punto potrebbe essere 1.000 (mille) o 10.50 (dieci e cinquanta). 
        // Assumiamo che se ha 3 decimali è migliaia, se 2 è decimali... ma è rischioso.
        // Per ora gestiamo il caso standard "1.200,00" o "1200,00"
        
        return parseFloat(clean) || 0;
    };

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (parsePrice(item.product.price) * item.quantity);
    }, 0);

    const formatPrice = (num: number) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    };

    const handleCheckout = () => {
        onCheckout(subtotal);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white w-full sm:w-[500px] h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl flex flex-col shadow-2xl animate-slide-up" 
                onClick={e => e.stopPropagation()}
            >

                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500">
                            <i className="fas fa-shopping-cart"></i>
                        </div>
                        Il tuo Carrello
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <i className="fas fa-times text-xl text-gray-500"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-5 bg-gray-50">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400 text-3xl">
                                <i className="fas fa-shopping-basket"></i>
                            </div>
                            <h4 className="text-lg font-bold text-gray-600 mb-2">Il carrello è vuoto</h4>
                            <p className="text-gray-500 text-sm mb-6">Non hai ancora aggiunto prodotti.</p>
                            <button onClick={onClose} className="text-orange-500 font-bold hover:underline">
                                Inizia lo shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.product.id} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 sm:gap-4 relative">
                                    <div className="w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 p-2 flex items-center justify-center">
                                        <img src={item.product.image} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">{item.product.name}</h4>
                                                <button 
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors flex-shrink-0"
                                                    title="Rimuovi prodotto"
                                                >
                                                    <i className="fas fa-trash-alt text-base sm:text-lg"></i>
                                                </button>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">Cod: {item.product.id}</p>
                                        </div>
                                        <div className="flex flex-wrap justify-between items-end gap-2 mt-2">
                                            <p className="font-bold text-blue-900 text-lg sm:text-xl">{item.product.price}</p>
                                            
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 rounded-lg p-1">
                                                <button 
                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-red-500 disabled:opacity-50 transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <i className="fas fa-minus text-[10px] sm:text-xs"></i>
                                                </button>
                                                <span className="text-sm sm:text-base font-bold w-5 sm:w-6 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-green-500 transition-colors"
                                                >
                                                    <i className="fas fa-plus text-[10px] sm:text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-b-2xl z-10">
                        
                        {/* Totals */}
                        <div className="space-y-2 mb-6 text-sm">
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3">
                                <span>Totale Provvisorio</span>
                                <span className="text-orange-600">{formatPrice(subtotal)}</span>
                            </div>
                            <p className="text-xs text-gray-400 text-right">Spedizione calcolata al checkout</p>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-credit-card text-xl"></i>
                            Procedi al Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;
