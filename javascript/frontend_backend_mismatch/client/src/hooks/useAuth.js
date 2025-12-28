import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const expiry = localStorage.getItem('tokenExpiry');
            
            if (!token) {
                setLoading(false);
                return;
            }
            
            // Backend sends expires_at as Unix timestamp
            // Frontend stores and compares as if it were ISO string
            if (expiry && new Date(expiry) < new Date()) {
                localStorage.removeItem('token');
                localStorage.removeItem('tokenExpiry');
                setLoading(false);
                return;
            }
            
            try {
                const userData = await authApi.getCurrentUser();
                // This will result in undefined properties
                setUser({
                    id: userData.id,  // Will be undefined
                    email: userData.email,  // Will be undefined
                    name: userData.name  // Will be undefined
                });
            } catch (err) {
                // Backend sends { error: '...' }, not { message: '...' }
                setError(err.message);
                localStorage.removeItem('token');
                localStorage.removeItem('tokenExpiry');
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
    }, []);
    
    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await authApi.login(email, password);
            // Gets { data: { access_token, expires_at, user: { user_id, ... } } }
            
            // These will fail because properties don't exist at expected paths
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('tokenExpiry', result.expiresAt);
            }
            
            // Will set undefined values
            setUser({
                id: result.user?.id,
                email: result.user?.email,
                name: result.user?.name
            });
            
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);
    
    const register = useCallback(async (email, password, name) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await authApi.register(email, password, name);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);
    
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiry');
        }
    }, []);
    
    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout
    };
}
