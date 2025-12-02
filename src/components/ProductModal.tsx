import { Product } from '../types';
import { COLORS } from '../utils/constants';
import { smoothScroll } from '../utils';

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

const ProductModal = ({ product, onClose, isFavorite, onToggleFavorite }: ProductModalProps) => {
    if (!product) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative modal-enter modal-enter-active" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-gray-100">
                    <i className="fas fa-times text-xl text-gray-800"></i>
                </button>
                <div className="md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
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
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
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
                    </div>

                    <div className="flex gap-4">
                        <a
                            href="#contatti"
                            onClick={(e) => {
                                onClose();
                                smoothScroll(e, 'contatti');
                            }}
                            className={`flex-1 ${COLORS.secondaryBg} text-white text-center py-3 rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer`}
                        >
                            Richiedi Disponibilità
                        </a>
                        <button
                            onClick={onToggleFavorite}
                            aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                            className={`px-4 py-3 border rounded-xl transition-all ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                        >
                            <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
