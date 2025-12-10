import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { getApiUrl } from '../utils/api';

const AdminDashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filtering & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tutti");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        id: '',
        name: '',
        category: '',
        price: '',
        image: '',
        desc: '',
        stock: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Fetching products from API...");
            const res = await axios.get(getApiUrl('api/products'));
            console.log("Products received:", res.data);
            if (Array.isArray(res.data)) {
                setProducts(res.data);
            } else {
                console.error("API response is not an array:", res.data);
                setError("Formato dati non valido dal server.");
            }
        } catch (err: any) {
            console.error("Errore caricamento prodotti:", err);
            setError(err.message || "Errore di connessione al server.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper per le chiamate autenticate
    const getAuthHeaders = () => {
        const token = localStorage.getItem('vema_token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.id.toString().includes(searchTerm);
        const matchesCategory = selectedCategory === "Tutti" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const categories = ["Tutti", ...new Set(products.map(p => p.category))];

    // Handlers
    const handleAddClick = () => {
        setEditingProduct(null);
        setFormData({ id: Date.now().toString(), name: '', category: '', price: '', image: '/images/placeholder.jpg', desc: '', stock: 0 });
        setIsModalOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: string | number) => {
        if (window.confirm("Sei sicuro di voler eliminare questo prodotto?")) {
            try {
                await axios.delete(getApiUrl(`api/products/${id}`), getAuthHeaders());
                fetchProducts();
            } catch (err) {
                alert("Errore durante l'eliminazione. Verifica di essere loggato come admin.");
            }
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await axios.put(getApiUrl(`api/products/${editingProduct.id}`), formData, getAuthHeaders());
            } else {
                await axios.post(getApiUrl('api/products'), formData, getAuthHeaders());
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            alert("Errore salvataggio prodotto. Verifica di essere loggato come admin.");
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">Accesso Negato</h1>
                    <p className="text-gray-600">Non hai i permessi per visualizzare questa pagina.</p>
                    <a href="/" className="mt-6 inline-block text-blue-600 hover:underline">Torna alla Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Admin Header */}
            <header className="bg-slate-900 text-white py-4 px-6 shadow-lg sticky top-0 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">
                            A
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Admin Dashboard</h1>
                            <p className="text-xs text-gray-400">Benvenuto, {user?.firstName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/" className="text-gray-400 hover:text-white text-sm"><i className="fas fa-home mr-1"></i> Sito Web</a>
                        <button onClick={logout} className="bg-red-500/20 hover:bg-red-500 text-red-100 px-4 py-2 rounded-lg text-sm transition-all border border-red-500/50">
                            <i className="fas fa-sign-out-alt mr-2"></i> Esci
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Prodotti Totali</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-1">{products.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl">
                                <i className="fas fa-box"></i>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Utenti Registrati</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-1">1</h3>
                            </div>
                            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-xl">
                                <i className="fas fa-users"></i>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ordini Recenti</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-1">0</h3>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center text-xl">
                                <i className="fas fa-shopping-cart"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                    <div className="flex gap-4 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Cerca prodotto..." 
                            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <select 
                            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={selectedCategory}
                            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleAddClick}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Aggiungi Prodotto
                    </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Prodotto</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4">Prezzo</th>
                                    <th className="px-6 py-4 text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Caricamento...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-red-500 font-bold">{error}</td></tr>
                                ) : paginatedProducts.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nessun prodotto trovato.</td></tr>
                                ) : paginatedProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 text-sm font-mono">#{product.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-medium text-slate-700">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold uppercase">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800">
                                            {product.price}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEditClick(product)} className="text-gray-400 hover:text-blue-600 mx-2"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDeleteClick(product.id)} className="text-gray-400 hover:text-red-600 mx-2"><i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            Pagina {currentPage} di {totalPages} ({filteredProducts.length} prodotti)
                        </span>
                        <div className="flex gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">ID</label>
                                    <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full border rounded p-2" disabled={!!editingProduct} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Prezzo (es. €100,00)</label>
                                    <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border rounded p-2" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Nome Prodotto</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Categoria</label>
                                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">URL Immagine</label>
                                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Descrizione</label>
                                <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full border rounded p-2 h-24"></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border hover:bg-gray-50">Annulla</button>
                                <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600">Salva</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
