import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CartItem } from '../types';

interface StripePaymentFormProps {
    total: number;
    onSuccess: () => void;
    setIsProcessing: (isProcessing: boolean) => void;
    cartItems: CartItem[];
}

export const StripePaymentForm = ({ total, onSuccess, setIsProcessing, cartItems }: StripePaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message ?? 'Si è verificato un errore sconosciuto');
            setIsProcessing(false);
        } else {
            onSuccess();
            setIsProcessing(false);
        }
    };

    const formatPrice = (num: number) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <h4 className="font-bold text-gray-800 mb-3 text-sm">Riepilogo Ordine</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {cartItems.map(item => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate max-w-[200px]">{item.quantity}x {item.product.name}</span>
                            <span className="font-medium">{item.product.price}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-start gap-3">
                <i className="fas fa-shield-alt text-blue-500 text-xl mt-1"></i>
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Pagamento Sicuro SSL</h4>
                    <p className="text-xs text-blue-700">I tuoi dati sono criptati e processati in sicurezza da Stripe.</p>
                </div>
            </div>

            <PaymentElement />
            
            {errorMessage && (
                <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg border border-red-100">
                    {errorMessage}
                </div>
            )}

            <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Totale Ordine</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
            </div>
        </form>
    );
};
