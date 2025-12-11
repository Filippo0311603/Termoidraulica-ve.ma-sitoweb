import React, { useState } from 'react';
import { CartItem } from '../types';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../utils/stripe';
import { StripePaymentForm } from './StripePaymentForm';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    total: number; // This is now the subtotal
    onSuccess: () => void;
}

const SHIPPING_COST = 15.00;

const CheckoutModal = ({ isOpen, onClose, cartItems, total: subtotal, onSuccess }: CheckoutModalProps) => {
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>('pickup');
    const [acceptsReturnsPolicy, setAcceptsReturnsPolicy] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        zip: ''
    });

    if (!isOpen) return null;

    const shipping = deliveryMethod === 'shipping' ? SHIPPING_COST : 0;
    const finalTotal = subtotal + shipping;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (step === 1) {
            setIsProcessing(true);
            try {
                // Create PaymentIntent on the server
                // Amount must be in cents
                const response = await axios.post(getApiUrl('create-payment-intent'), {
                    amount: Math.round(finalTotal * 100),
                    currency: 'eur'
                });
                
                setClientSecret(response.data.clientSecret);
                setStep(2);
            } catch (error) {
                console.error("Error creating payment intent:", error);
                alert("Errore durante l'inizializzazione del pagamento. Assicurati che il server backend sia in esecuzione.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const formatPrice = (num: number) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    };

    const appearance = {
        theme: 'stripe' as const,
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
                        <p className="text-sm text-gray-500">Completa il tuo ordine in sicurezza</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="flex border-b border-gray-100">
                    <div className={`flex-1 py-3 text-center text-sm font-bold border-b-2 ${step >= 1 ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}>
                        1. Spedizione
                    </div>
                    <div className={`flex-1 py-3 text-center text-sm font-bold border-b-2 ${step >= 2 ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}>
                        2. Pagamento
                    </div>
                    <div className={`flex-1 py-3 text-center text-sm font-bold border-b-2 ${step >= 3 ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}>
                        3. Conferma
                    </div>
                </div>

                {/* Warning No Returns */}
                <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex items-start gap-3">
                    <i className="fas fa-exclamation-circle text-orange-500 mt-0.5"></i>
                    <p className="text-xs text-orange-800 leading-tight">
                        <strong>Attenzione:</strong> Procedendo con l'ordine accetti che <u>non si effettuano resi o rimborsi</u> sulla merce spedita. Verifica bene i prodotti prima di pagare.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    {step === 1 && (
                        <form id="shipping-form" onSubmit={handleNext} className="space-y-6 animate-slide-up">
                            
                            {/* Delivery Options */}
                            <div className="mb-6">
                                <h5 className="font-bold text-gray-800 mb-3 text-sm">Metodo di Consegna</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="delivery" className="hidden" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
                                        <i className="fas fa-store text-xl"></i>
                                        <span className="text-xs font-bold">Ritiro in Sede</span>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Gratis</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'shipping' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="delivery" className="hidden" checked={deliveryMethod === 'shipping'} onChange={() => setDeliveryMethod('shipping')} />
                                        <i className="fas fa-truck text-xl"></i>
                                        <span className="text-xs font-bold">Spedizione</span>
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                            {formatPrice(SHIPPING_COST)}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome</label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="firstName" 
                                        value={formData.firstName} 
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                        placeholder="Mario"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Cognome</label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="lastName" 
                                        value={formData.lastName} 
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                        placeholder="Rossi"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input 
                                    required 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                    placeholder="mario.rossi@email.com"
                                />
                            </div>

                            {deliveryMethod === 'shipping' && (
                                <div className="animate-fade-in space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Indirizzo</label>
                                        <input 
                                            required 
                                            type="text" 
                                            name="address" 
                                            value={formData.address} 
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                            placeholder="Via Roma 1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Città</label>
                                            <input 
                                                required 
                                                type="text" 
                                                name="city" 
                                                value={formData.city} 
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                                placeholder="Roma"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">CAP</label>
                                            <input 
                                                required 
                                                type="text" 
                                                name="zip" 
                                                value={formData.zip} 
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                                placeholder="00100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Returns Policy Checkbox */}
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        required
                                        checked={acceptsReturnsPolicy}
                                        onChange={(e) => setAcceptsReturnsPolicy(e.target.checked)}
                                        className="mt-1 w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-red-800">
                                        <strong>Dichiaro di aver letto e accettato:</strong> Non si effettuano e non sono ammessi resi degli articoli spediti. Confermo di aver verificato la correttezza dell'ordine.
                                    </span>
                                </label>
                            </div>

                            {/* Totals Summary in Step 1 */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-6">
                                <div className="flex justify-between text-gray-600 mb-2">
                                    <span>Subtotale</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 mb-2">
                                    <span>Spedizione</span>
                                    <span>{deliveryMethod === 'pickup' ? 'Gratis' : formatPrice(SHIPPING_COST)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                                    <span>Totale</span>
                                    <span className="text-orange-600">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                        </form>
                    )}

                    {step === 2 && clientSecret && (
                        <Elements options={options} stripe={getStripe()}>
                            <StripePaymentForm 
                                total={finalTotal} 
                                onSuccess={() => {
                                    setStep(3);
                                    onSuccess();
                                }}
                                setIsProcessing={setIsProcessing}
                                cartItems={cartItems}
                            />
                        </Elements>
                    )}

                    {step === 3 && (
                        <div className="text-center py-10 animate-slide-up">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-5xl">
                                <i className="fas fa-check"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ordine Confermato!</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Grazie {formData.firstName}, il tuo ordine è stato ricevuto correttamente. Riceverai una email di conferma a breve all'indirizzo {formData.email}.
                            </p>
                            <button 
                                onClick={onClose}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                            >
                                Torna alla Home
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step < 3 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                        {step === 1 ? (
                            <button onClick={onClose} className="text-gray-500 font-bold hover:text-gray-700">
                                Annulla
                            </button>
                        ) : (
                            <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-700">
                                <i className="fas fa-arrow-left mr-2"></i> Indietro
                            </button>
                        )}

                        {step === 1 ? (
                            <button 
                                form="shipping-form"
                                type="submit"
                                disabled={isProcessing}
                                className={`bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? 'Elaborazione...' : <>Procedi al Pagamento <i className="fas fa-arrow-right ml-2"></i></>}
                            </button>
                        ) : (
                            <button 
                                form="payment-form"
                                type="submit"
                                disabled={isProcessing}
                                className={`bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 flex items-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Elaborazione...</>
                                ) : (
                                    <><i className="fas fa-lock"></i> Paga {formatPrice(finalTotal)}</>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;
