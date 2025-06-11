// src/contexts/AuthContext.js - FINAL CORRECTED VERSION

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout, fetchCurrentUser } from '../services/api'; 
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // For initial auth check
    const [authError, setAuthError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await fetchCurrentUser(); 
                    setCurrentUser(response.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('authToken');
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            }
            setIsLoading(false);
        };
        checkAuthStatus();
    }, []);

    const login = useCallback(async (email, password) => {
        setAuthError(null);
        try {
            const response = await apiLogin({ email, password }); 
            const { token, user } = response.data;

            localStorage.setItem('authToken', token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setCurrentUser(user);
            setIsAuthenticated(true);
            
            return user; 
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed.';
            setAuthError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const logout = useCallback(async (redirectTo = '/login') => {
        // In a real app, you might want to call an API endpoint to invalidate the token on the server
        localStorage.removeItem('authToken');
        delete apiClient.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setIsAuthenticated(false);
        if (redirectTo) {
            navigate(redirectTo);
        }
    }, [navigate]);

    const hasRole = useCallback((roleName) => {
        if (!currentUser || !currentUser.roles) {
            return false;
        }
        return currentUser.roles.includes(roleName);
    }, [currentUser]);

    const value = {
        currentUser,
        isAuthenticated,
        isLoading,
        authError,
        setAuthError, // Function is now correctly exported
        login,
        logout,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};