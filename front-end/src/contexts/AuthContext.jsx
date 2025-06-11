import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, fetchCurrentUser } from '../services/api'; 
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const [authError, setAuthError] = useState(null);
    const navigate = useNavigate();

    // --- THIS IS THE OPTIMIZED EFFECT FOR INSTANT PERCEIVED LOGIN ---
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('userData'); // Also check for stored user data

            // --- KEY CHANGE 1: OPTIMISTIC STATE SET ---
            // If we have a token AND stored user data, assume the user is logged in instantly.
            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Set the state immediately from localStorage. This makes the UI update instantly.
                    setCurrentUser(parsedUser);
                    setIsAuthenticated(true);
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // --- KEY CHANGE 2: BACKGROUND VERIFICATION ---
                    // Now, verify the session in the background to get fresh data or log out if the token is invalid.
                    const response = await fetchCurrentUser();
                    
                    // Update state with fresh data from the server.
                    setCurrentUser(response.data);
                    // Also update localStorage with the fresh data.
                    localStorage.setItem('userData', JSON.stringify(response.data));

                } catch (error) {
                    // This block runs if the stored token is invalid/expired.
                    console.error("Session verification failed, logging out:", error);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    delete apiClient.defaults.headers.common['Authorization'];
                    setCurrentUser(null);
                    setIsAuthenticated(false);
                }
            }
            
            // We can now set loading to false much sooner.
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []); // The empty dependency array ensures this runs only once.

    const login = useCallback(async (email, password) => {
        setAuthError(null);
        try {
            const response = await apiLogin({ email, password }); 
            const { token, user } = response.data;

            // --- KEY CHANGE 3: STORE USER DATA ON LOGIN ---
            // We must store the user object in localStorage on login for the optimistic check to work.
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(user)); // <-- ADD THIS LINE

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
        // Clear everything on logout
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData'); // <-- ADD THIS LINE
        delete apiClient.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setIsAuthenticated(false);
        if (redirectTo) navigate(redirectTo);
    }, [navigate]);

    const hasRole = useCallback((roleName) => {
        if (!currentUser || !currentUser.roles) return false;
        return currentUser.roles.some(role => 
            typeof role === 'string' ? role === roleName : role.name === roleName
        );
    }, [currentUser]);

    const value = {
        currentUser,
        isAuthenticated,
        isLoading,
        authError,
        setAuthError,
        login,
        logout,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* We no longer need to wait for `isLoading` here, because the optimistic UI is so fast. */}
            {children}
        </AuthContext.Provider>
    );
};