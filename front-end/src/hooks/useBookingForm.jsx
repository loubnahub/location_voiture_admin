// src/hooks/useBookingForm.js

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    fetchAllUsersForAdmin as fetchAllUsers,
    fetchAllInsurancePlans,
    fetchAllExtras,
    validatePromotionCode,
    fetchVehicleSchedule
} from '../services/api';

const extractArray = (responseOrData, itemName) => {
    if (Array.isArray(responseOrData)) { return responseOrData; }
    if (responseOrData?.data) {
        if (responseOrData.data.data && Array.isArray(responseOrData.data.data)) return responseOrData.data.data;
        if (Array.isArray(responseOrData.data)) return responseOrData.data;
    }
    console.warn(`Could not extract array for ${itemName}. Input:`, responseOrData);
    return [];
};

/**
 * Hook to fetch initial, non-dependent data for the booking form.
 */
export const useBookingData = (isEditMode, currentVehicleId) => {
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [insurancePlans, setInsurancePlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [usersRes, vehiclesRes, plansRes] = await Promise.all([
                    fetchAllUsers({ all: true }),
                    axios.get('http://localhost:8000/api/vehicles?all=true', { withCredentials: true }),
                    fetchAllInsurancePlans({ all: true, active: true })
                ]);
                setUsers(extractArray(usersRes, "Users"));
                setInsurancePlans(extractArray(plansRes, "Insurance Plans"));
                const rawVehicles = extractArray(vehiclesRes, "Vehicles");
                const processedVehicles = rawVehicles.map(v => ({
                    ...v,
                    base_price_per_day: parseFloat(v.base_price_per_day || 0),
                    display_name: `${v.vehicle_model_title || 'N/A'} (${v.license_plate || 'N/A'}) - ${v.status_display || 'N/A'}`
                }));
                const filtered = processedVehicles.filter(v => ['available', 'reserved'].includes(v.status) || (isEditMode && v.id === currentVehicleId));
                setVehicles(filtered);
            } catch (error) {
                console.error("useBookingData: Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [isEditMode, currentVehicleId]);

    return { users, vehicles, insurancePlans, loadingInitialData: loading };
};

/**
 * Hook to fetch data that depends on the selected vehicle.
 */
export const useVehicleSpecificData = (vehicleId) => {
    const [availableExtras, setAvailableExtras] = useState([]);
    const [vehicleSchedule, setVehicleSchedule] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!vehicleId) {
            setAvailableExtras([]);
            setVehicleSchedule([]);
            return;
        }
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [extrasRes, scheduleRes] = await Promise.all([
    fetchAllExtras({ vehicle_id: vehicleId, all: true }),
    fetchVehicleSchedule(vehicleId)
]);
                setAvailableExtras(extractArray(extrasRes, "Extras"));
                setVehicleSchedule(extractArray(scheduleRes, "Schedule"));
            } catch (error) {
                console.error("useVehicleSpecificData: Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [vehicleId]);

    return { availableExtras, vehicleSchedule, loadingVehicleSpecificData: loading };
};

/**
 * Hook to manage all price calculation logic.
 */
export const usePriceCalculations = (formData, onFormDataChange, vehicles, insurancePlans) => {
    const getRentalDays = useCallback(() => {
        if (formData.start_date && formData.end_date) {
            try {
                const start = new Date(formData.start_date);
                const end = new Date(formData.end_date);
                if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                    return Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)));
                }
            } catch (e) { /* ignore */ }
        }
        return 0;
    }, [formData.start_date, formData.end_date]);

    // Base Price Calculation
    useEffect(() => {
        let newPrice = "0.00";
        const rentalDays = getRentalDays();
        if (rentalDays > 0 && formData.vehicle_id) {
            const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
            if (vehicle) {
                newPrice = (rentalDays * parseFloat(vehicle.base_price_per_day || 0)).toFixed(2);
            }
        }
        if (formData.calculated_base_price !== newPrice) {
            onFormDataChange({ target: { name: 'calculated_base_price', value: newPrice } });
        }
    }, [formData.vehicle_id, formData.start_date, formData.end_date, vehicles, getRentalDays, onFormDataChange, formData.calculated_base_price]);
    
    // Insurance Price Calculation
    useEffect(() => {
        let newPrice = "0.00";
        const rentalDays = getRentalDays();
        if (rentalDays > 0 && formData.insurance_plan_id) {
            const plan = insurancePlans.find(p => p.id === formData.insurance_plan_id);
            if (plan) {
                newPrice = (rentalDays * parseFloat(plan.price_per_day || 0)).toFixed(2);
            }
        }
        if (formData.calculated_insurance_price !== newPrice) {
            onFormDataChange({ target: { name: 'calculated_insurance_price', value: newPrice } });
        }
    }, [formData.insurance_plan_id, formData.start_date, formData.end_date, insurancePlans, getRentalDays, onFormDataChange, formData.calculated_insurance_price]);

    // Final Price Calculation (includes extras and discount from formData)
    useEffect(() => {
        const base = parseFloat(formData.calculated_base_price || 0);
        const extras = parseFloat(formData.calculated_extras_price || 0);
        const insurance = parseFloat(formData.calculated_insurance_price || 0);
        const discount = parseFloat(formData.discount_amount_applied || 0);
        const newFinalPrice = Math.max(0, (base + extras + insurance - discount)).toFixed(2);
        if (formData.final_price !== newFinalPrice) {
            onFormDataChange({ target: { name: 'final_price', value: newFinalPrice } });
        }
    }, [formData.calculated_base_price, formData.calculated_extras_price, formData.calculated_insurance_price, formData.discount_amount_applied, onFormDataChange, formData.final_price]);
};


/**
 * Hook to manage promotion code logic.
 */
export const usePromoCode = (formData, onFormDataChange) => {
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [promoCodeLoading, setPromoCodeLoading] = useState(false);
    const [promoCodeMessage, setPromoCodeMessage] = useState({ type: '', text: '' });
    const [appliedPromoDetails, setAppliedPromoDetails] = useState(null);

    useEffect(() => {
        setPromoCodeInput(formData.promotion_code_string || '');
    }, [formData.promotion_code_string]);
    
    const handlePromoCodeInputChange = (e) => {
        const newCode = e.target.value.toUpperCase();
        setPromoCodeInput(newCode);
        onFormDataChange({ target: { name: 'promotion_code_string', value: newCode } });
        if (appliedPromoDetails) {
            setAppliedPromoDetails(null);
            setPromoCodeMessage({ type: '', text: '' });
            onFormDataChange({ target: { name: 'discount_amount_applied', value: '0.00' } });
            onFormDataChange({ target: { name: 'promotion_code_id', value: null } });
        }
    };
    
    const handleApplyPromoCode = async () => {
        if (!promoCodeInput.trim()) {
            setPromoCodeMessage({ type: 'danger', text: "Please enter a code." });
            return;
        }
        setPromoCodeLoading(true);
        try {
            const subtotal = parseFloat(formData.calculated_base_price || 0) + parseFloat(formData.calculated_extras_price || 0) + parseFloat(formData.calculated_insurance_price || 0);
            const response = await validatePromotionCode(promoCodeInput, { booking_subtotal: subtotal, user_id: formData.renter_user_id });
            const details = response.data.data;
            setAppliedPromoDetails(details);
            setPromoCodeMessage({ type: 'success', text: `Code '${details.code_string}' applied!` });
            onFormDataChange({ target: { name: 'discount_amount_applied', value: details.discount_amount.toFixed(2) } });
            onFormDataChange({ target: { name: 'promotion_code_id', value: details.promotion_code_id } });
        } catch (error) {
            setPromoCodeMessage({ type: 'danger', text: error.response?.data?.message || "Invalid code." });
            setAppliedPromoDetails(null);
            onFormDataChange({ target: { name: 'discount_amount_applied', value: '0.00' } });
            onFormDataChange({ target: { name: 'promotion_code_id', value: null } });
        } finally {
            setPromoCodeLoading(false);
        }
    };

    return { promoCodeInput, promoCodeLoading, promoCodeMessage, handlePromoCodeInputChange, handleApplyPromoCode };
};