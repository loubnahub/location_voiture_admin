// src/contexts/CarContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAllPublicCars } from '../services/api';

const defaultContextValue = {
    allCarsData: [], // Default to an empty array
    isLoading: true,
    error: null,
    loadCars: () => {},
    findCarById: () => undefined,
};

const CarContext = createContext(defaultContextValue);

export const useCars = () => useContext(CarContext);

export const CarProvider = ({ children }) => {
    const [allCarsData, setAllCarsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCars = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchAllPublicCars();
            // The API response from .get() still wraps the data in a `data` key
            setAllCarsData(response.data.data); 
        } catch (err) {
            console.error("Failed to fetch car data:", err);
            setError(err.message || 'An error occurred while fetching cars.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load cars once on initial mount
    useEffect(() => {
        loadCars();
    }, [loadCars]);
    
    const findCarById = (id) => {
        // Find car by the top-level ID (which is the VehicleModel ID)
        return allCarsData.find(car => car.id.toString() === id.toString());
    };

    const value = {
        allCarsData,
        isLoading,
        error,
        loadCars, // Expose for manual refresh if needed
        findCarById,
    };

    return (
        <CarContext.Provider value={value}>
            {children}
        </CarContext.Provider>
    );
};