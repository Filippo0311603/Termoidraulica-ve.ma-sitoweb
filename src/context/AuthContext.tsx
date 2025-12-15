import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'user' | 'admin';
    userType?: 'private' | 'company';
    vatNumber?: string;
    sdiCode?: string;
    pec?: string;
    fiscalCode?: string;
    address?: string;
    city?: string;
    zip?: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('vema_token');
        const storedUser = localStorage.getItem('vema_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('vema_token', newToken);
        localStorage.setItem('vema_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('vema_token');
        localStorage.removeItem('vema_user');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            logout, 
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
