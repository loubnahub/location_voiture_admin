import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    loginUser as apiLogin,
    logoutUser as apiLogout,
    getCurrentAuthenticatedUser as apiGetCurrentUser,
    getToken as storageGetToken,
    getStoredUser as storageGetStoredUser
} from '../services/authService'; // Adjust path as needed
import { useNavigate } from 'react-router-dom'; // If using react-router v6

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(storageGetStoredUser());
    const [authToken, setAuthToken] = useState(storageGetToken());
    const [isLoading, setIsLoading] = useState(true); // For initial auth check
    const [authError, setAuthError] = useState(null);
    const navigate = useNavigate();

    const isAuthenticated = !!authToken && !!currentUser;

    // Check authentication status on initial load
    useEffect(() => {
        const checkAuthStatus = async () => {
            setIsLoading(true);
            const token = storageGetToken();
            if (token) {
                try {
                    const userData = await apiGetCurrentUser(); // Fetches user from /api/user
                    setCurrentUser(userData);
                    setAuthToken(token);
                } catch (error) {
                    console.warn("Auth check failed, logging out:", error.message);
                    // Token might be invalid or expired
                    await apiLogout(); // This will clear localStorage via authService
                    setCurrentUser(null);
                    setAuthToken(null);
                }
            }
            setIsLoading(false);
        };
        checkAuthStatus();
    }, []);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const data = await apiLogin({ email, password });
            setCurrentUser(data.user);
            setAuthToken(data.token);
            setIsLoading(false);
            return data.user; // Return user data on successful login
        } catch (error) {
            console.error("AuthContext login error:", error);
            setAuthError(error.message || (error.errors ? Object.values(error.errors).flat().join(' ') : 'Login failed. Please check your credentials.'));
            setIsLoading(false);
            throw error;
        }
    }, []);

    const logout = useCallback(async (redirectTo = '/login') => {
        setIsLoading(true);
        await apiLogout(); // Clears token from localStorage via authService
        setCurrentUser(null);
        setAuthToken(null);
        setIsLoading(false);
        if (redirectTo) {
            navigate(redirectTo);
        }
    }, [navigate]);

    const hasRole = useCallback((roleNameOrNames) => {
        if (!currentUser || !currentUser.roles) return false;
        const rolesToCheck = Array.isArray(roleNameOrNames) ? roleNameOrNames : [roleNameOrNames];
        return rolesToCheck.some(role => currentUser.roles.includes(role));
    }, [currentUser]);

    const hasPermission = useCallback((permissionNameOrNames) => {
        if (!currentUser || !currentUser.permissions) return false;
        const permissionsToCheck = Array.isArray(permissionNameOrNames) ? permissionNameOrNames : [permissionNameOrNames];
        return permissionsToCheck.some(perm => currentUser.permissions.includes(perm));
    }, [currentUser]);


    const value = {
        currentUser,
        authToken,
        isAuthenticated,
        isLoading, // For UI to show loading state during auth operations
        authError,
        setAuthError, // To allow clearing errors from components
        login,
        logout,
        hasRole,
        hasPermission,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};