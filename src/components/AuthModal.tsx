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
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [userType, setUserType] = useState<'private' | 'company'>('private');
    const { login, user, logout } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        vatNumber: '',
        sdiCode: '',
        pec: '',
        fiscalCode: '',
        address: '',
        city: '',
        zip: ''
    });

    // Initialize edit form when entering edit mode
    React.useEffect(() => {
        if (isEditing && user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                password: '', // Password not pre-filled
                vatNumber: user.vatNumber || '',
                sdiCode: user.sdiCode || '',
                pec: user.pec || '',
                fiscalCode: user.fiscalCode || '',
                address: user.address || '',
                city: user.city || '',
                zip: user.zip || ''
            });
            setUserType(user.userType === 'company' ? 'company' : 'private');
        }
    }, [isEditing, user]);

    if (!isOpen) return null;

    // Se l'utente è già loggato e NON sta modificando, mostra il pannello profilo/logout
    if (user && !isEditing) {
        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
                <div 
                    className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative p-8" 
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                        <i className="fas fa-times text-xl"></i>
                    </button>

                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                            <i className="fas fa-user"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Ciao, {user.firstName} {user.lastName}!</h2>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                        {user.createdAt && (
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500">Membro dal:</span>
                                <span className="font-bold text-gray-800">{new Date(user.createdAt).toLocaleDateString('it-IT')}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Tipo Account:</span>
                            <span className="font-bold text-gray-800 capitalize">{user.userType === 'company' ? 'Azienda' : 'Privato'}</span>
                        </div>
                        {user.userType === 'company' && (
                            <>
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">P.IVA:</span>
                                    <span className="font-bold text-gray-800">{user.vatNumber}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">PEC:</span>
                                    <span className="font-bold text-gray-800">{user.pec}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Codice SDI:</span>
                                    <span className="font-bold text-gray-800">{user.sdiCode}</span>
                                </div>
                            </>
                        )}
                        {user.fiscalCode && (
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500">Codice Fiscale:</span>
                                <span className="font-bold text-gray-800">{user.fiscalCode}</span>
                            </div>
                        )}
                        {(user.address || user.city) && (
                            <div className="flex justify-between pt-1">
                                <span className="text-gray-500">Indirizzo:</span>
                                <span className="font-bold text-gray-800 text-right">{user.address}<br/>{user.zip} {user.city}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {user.role === 'admin' && (
                            <a href="/admin" className="block w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/30 text-center">
                                <i className="fas fa-tachometer-alt mr-2"></i> Dashboard Admin
                            </a>
                        )}
                        
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="w-full py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-all border border-blue-100"
                        >
                            <i className="fas fa-edit mr-2"></i> Modifica Profilo
                        </button>

                        <button 
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
                        >
                            <i className="fas fa-sign-out-alt mr-2"></i> Esci
                        </button>

                        <button 
                            onClick={async () => {
                                if (window.confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.")) {
                                    try {
                                        const token = localStorage.getItem('vema_token');
                                        await axios.delete(getApiUrl('auth/me'), {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        logout();
                                        onClose();
                                        alert("Account eliminato con successo.");
                                    } catch (err) {
                                        alert("Errore durante l'eliminazione dell'account.");
                                    }
                                }
                            }}
                            className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-all border border-red-100 text-sm"
                        >
                            <i className="fas fa-trash-alt mr-2"></i> Elimina Account
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
            let endpoint = isLogin ? 'auth/login' : 'auth/register';
            let method = 'post';

            if (isEditing) {
                endpoint = 'auth/me';
                method = 'put';
            }

            const url = getApiUrl(endpoint);
            
            // Prepare payload based on userType
            let payload = { ...formData, userType };
            
            if (!isLogin && !isEditing && userType === 'private') {
                // Clear company fields if registering as private
                payload = {
                    ...payload,
                    vatNumber: '',
                    sdiCode: '',
                    pec: '',
                    address: '',
                    city: '',
                    zip: ''
                };
            }

            // Remove password if empty during edit (keep existing)
            if (isEditing && !payload.password) {
                delete (payload as any).password;
            }

            const token = localStorage.getItem('vema_token');
            const config = isEditing ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const response = await (axios as any)[method](url, payload, config);
            
            if (isEditing) {
                // Update local user data
                const updatedUser = response.data.user;
                // We need to keep the token
                login(token!, updatedUser);
                setIsEditing(false);
                alert("Profilo aggiornato con successo!");
            } else {
                const { token, user } = response.data;
                login(token, user);
                onClose();
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.response?.data?.message || 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className={`bg-white w-full ${isLogin ? 'max-w-md' : 'max-w-4xl'} rounded-2xl shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh] transition-all duration-300`} 
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <i className="fas fa-times text-xl"></i>
                </button>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {isEditing ? 'Modifica Profilo' : (isLogin ? 'Bentornato' : 'Crea Account')}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {isEditing ? 'Aggiorna i tuoi dati personali' : (isLogin ? 'Accedi per gestire i tuoi ordini' : 'Registrati per un checkout più veloce')}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin || isEditing ? (
                            <>
                                {/* User Type Selector - Disabled in Edit Mode to simplify */}
                                {!isEditing && (
                                    <div className="flex gap-4 mb-6 p-1 bg-gray-100 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setUserType('private')}
                                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${userType === 'private' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <i className="fas fa-user mr-2"></i> Privato
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUserType('company')}
                                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${userType === 'company' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <i className="fas fa-building mr-2"></i> Azienda
                                        </button>
                                    </div>
                                )}

                                {userType === 'private' ? (
                                    // --- FORM PRIVATO ---
                                    <div className="space-y-4">
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
                                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Password {isEditing && <span className="text-gray-400 font-normal normal-case">(Lascia vuoto per non modificare)</span>}</label>
                                            <div className="relative">
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    name="password" 
                                                    required={!isEditing}
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

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Codice Fiscale (Opzionale)</label>
                                            <input 
                                                type="text" 
                                                name="fiscalCode" 
                                                maxLength={16}
                                                placeholder="RSSMRA..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                                value={formData.fiscalCode}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    // --- FORM AZIENDA ---
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Colonna Sinistra: Dati Anagrafici e Indirizzo */}
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                                                <i className="fas fa-building text-orange-500"></i> Dati Aziendali
                                            </h3>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nome Referente</label>
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
                                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Ragione Sociale</label>
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

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Indirizzo Sede Legale</label>
                                                <input 
                                                    type="text" 
                                                    name="address" 
                                                    required 
                                                    placeholder="Via Roma 1"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Città</label>
                                                    <input 
                                                        type="text" 
                                                        name="city" 
                                                        required 
                                                        placeholder="Roma"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">CAP</label>
                                                    <input 
                                                        type="text" 
                                                        name="zip" 
                                                        required 
                                                        placeholder="00100"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                                        value={formData.zip}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Colonna Destra: Dati Fiscali e Account */}
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                                                <i className="fas fa-file-invoice text-orange-500"></i> Fatturazione Elettronica
                                            </h3>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Partita IVA</label>
                                                <input 
                                                    type="text" 
                                                    name="vatNumber" 
                                                    required
                                                    maxLength={11}
                                                    placeholder="12345678901"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                                    value={formData.vatNumber}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Codice SDI</label>
                                                    <input 
                                                        type="text" 
                                                        name="sdiCode" 
                                                        required
                                                        maxLength={7}
                                                        placeholder="XXXXXXX"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                                        value={formData.sdiCode}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">PEC</label>
                                                    <input 
                                                        type="email" 
                                                        name="pec" 
                                                        required
                                                        placeholder="azienda@pec.it"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                                        value={formData.pec}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email Aziendale</label>
                                                <input 
                                                    type="email" 
                                                    name="email" 
                                                    required 
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                                    placeholder="info@azienda.it"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Password {isEditing && <span className="text-gray-400 font-normal normal-case">(Lascia vuoto per non modificare)</span>}</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showPassword ? "text" : "password"}
                                                        name="password" 
                                                        required={!isEditing}
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
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // LOGIN FORM (Semplice, verticale)
                            <div className="space-y-4">
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
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full ${COLORS.primaryBg} hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-1 mt-6 flex items-center justify-center gap-2`}
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                isEditing ? 'Salva Modifiche' : (isLogin ? 'Accedi' : 'Registrati')
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        {isEditing ? (
                            <button 
                                onClick={() => { setIsEditing(false); setError(''); }}
                                className="text-gray-500 font-bold hover:text-gray-700 hover:underline"
                            >
                                Annulla
                            </button>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
                                <button 
                                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                    className="text-orange-500 font-bold ml-2 hover:underline"
                                >
                                    {isLogin ? 'Registrati' : 'Accedi'}
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
