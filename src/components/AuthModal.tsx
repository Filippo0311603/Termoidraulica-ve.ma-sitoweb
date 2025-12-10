import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';
import { getApiUrl } from '../utils/api';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, user, logout } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    if (!isOpen) return null;

    // Se l'utente è già loggato, mostra il pannello profilo/logout
    if (user) {
        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
                <div 
                    className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col relative p-8 text-center" 
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                        <i className="fas fa-times text-xl"></i>
                    </button>

                    <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        <i className="fas fa-user"></i>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Ciao, {user.firstName}!</h2>
                    <p className="text-gray-500 text-sm mb-8">{user.email}</p>

                    <div className="space-y-3">
                        {user.role === 'admin' && (
                            <a href="/admin" className="block w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/30">
                                <i className="fas fa-tachometer-alt mr-2"></i> Dashboard Admin
                            </a>
                        )}
                        
                        <button 
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-all border border-red-100"
                        >
                            <i className="fas fa-sign-out-alt mr-2"></i> Esci
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? 'auth/login' : 'auth/register';
            const url = getApiUrl(endpoint);
            
            const response = await axios.post(url, formData);
            
            const { token, user } = response.data;
            login(token, user);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative" 
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <i className="fas fa-times text-xl"></i>
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {isLogin ? 'Bentornato' : 'Crea Account'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {isLogin ? 'Accedi per gestire i tuoi ordini' : 'Registrati per un checkout più veloce'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nome</label>
                                    <input 
                                        type="text" 
                                        name="firstName" 
                                        required 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Cognome</label>
                                    <input 
                                        type="text" 
                                        name="lastName" 
                                        required 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                required 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="nome@esempio.it"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password" 
                                    required 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white pr-12"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full ${COLORS.primaryBg} hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-1 mt-6 flex items-center justify-center gap-2`}
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                isLogin ? 'Accedi' : 'Registrati'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
                            <button 
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-orange-500 font-bold ml-2 hover:underline"
                            >
                                {isLogin ? 'Registrati' : 'Accedi'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
