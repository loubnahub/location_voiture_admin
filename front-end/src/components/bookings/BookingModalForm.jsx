import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Spinner, Alert, FormCheck } from 'react-bootstrap';
import axios from 'axios'; // For the literal vehicles call
import {
    fetchAllUsers,
    fetchAllInsurancePlans,
    fetchAllExtras // This will now be used to fetch vehicle-specific extras
} from '../../services/api'; // Adjust path if needed
import { BookingStatus as BookingStatusEnum } from '../../Enums'; // Adjust path if needed

const bookingStatusOptions = Object.values(BookingStatusEnum || {}).map(status => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}));

const BookingModalForm = ({ formData, handleInputChange, modalFormErrors, isEditMode, submissionError, clearSubmissionError, onFormDataChange }) => {
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]); // Will store vehicles with their base_price_per_day
    const [insurancePlans, setInsurancePlans] = useState([]);
    const [availableExtras, setAvailableExtras] = useState([]); // Stores vehicle-specific extras
    const [selectedExtras, setSelectedExtras] = useState([]); // Stores full extra objects that are checked

    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [loadingExtras, setLoadingExtras] = useState(false); // For fetching vehicle-specific extras

    const extractArrayFromApiResponse = (responseOrData, itemName) => {
        if (Array.isArray(responseOrData)) { return responseOrData; }
        if (responseOrData && responseOrData.data) {
            if (responseOrData.data.data && Array.isArray(responseOrData.data.data)) { return responseOrData.data.data; }
            if (Array.isArray(responseOrData.data)) { return responseOrData.data; }
        }
        console.warn(`BookingModalForm: Could not extract array for ${itemName}. Input:`, responseOrData);
        return [];
    };

    // Effect 1: Fetch initial independent data (Users, Vehicles, Insurance Plans)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingInitialData(true);
            const vehiclesApiUrl = 'http://localhost:8000/api/vehicles?status=available&all=true';
            console.log(`BookingModalForm: useEffect[InitialData] - START. Vehicles URL: ${vehiclesApiUrl}`);
            try {
                const usersPromise = fetchAllUsers({ all: true });
                const plansPromise = fetchAllInsurancePlans({ all: true, active: true });
                const vehiclesPromise = axios.get(vehiclesApiUrl, { withCredentials: true, headers: { 'Accept': 'application/json' }});

                const [usersRes, vehiclesRes, plansRes] = await Promise.all([ usersPromise, vehiclesPromise, plansPromise ]);

                console.log("BookingModalForm: useEffect[InitialData] - Users Response:", usersRes);
                console.log("BookingModalForm: useEffect[InitialData] - Vehicles Response (raw):", vehiclesRes ? { status: vehiclesRes.status, data: JSON.parse(JSON.stringify(vehiclesRes.data)) } : "No vehicles response");
                console.log("BookingModalForm: useEffect[InitialData] - Plans Response:", plansRes);

                setUsers(extractArrayFromApiResponse(usersRes, "Users"));
                setInsurancePlans(extractArrayFromApiResponse(plansRes, "Insurance Plans"));

                const rawVehiclesFromApi = extractArrayFromApiResponse(vehiclesRes, "Vehicles");
                let processedVehicles = [];
                if (Array.isArray(rawVehiclesFromApi)) {
                    console.log("BookingModalForm: useEffect[InitialData] - Raw vehicle objects from API (first 2 for base_price_per_day check):", JSON.parse(JSON.stringify(rawVehiclesFromApi.slice(0,2))));
                    processedVehicles = rawVehiclesFromApi.map(v => ({
                        ...v,
                        base_price_per_day: parseFloat(v.base_price_per_day || 0), // CRITICAL: Assumes backend sends this directly
                        display_name: `${v.vehicle_model_title || 'Unknown Model'} (${v.license_plate || 'N/A'}) - Status: ${v.status_display || v.status || 'N/A'}`
                    }));
                }
                const filteredVehicles = processedVehicles.filter(v =>
                    v.status === 'available' || (isEditMode && formData && v.id === formData.vehicle_id)
                );
                setVehicles(filteredVehicles);
                console.log("BookingModalForm: useEffect[InitialData] - Processed and filtered 'vehicles' state (first 2):", JSON.parse(JSON.stringify(filteredVehicles.slice(0,2))));
            } catch (error) {
                console.error("BookingModalForm: useEffect[InitialData] - CRITICAL error:", error);
                if (error.isAxiosError && error.response) { console.error("Axios Error Details:", { status: error.response.status, data: error.response.data }); }
                setUsers([]); setVehicles([]); setInsurancePlans([]);
            } finally {
                setLoadingInitialData(false);
                console.log("BookingModalForm: useEffect[InitialData] - END.");
            }
        };
        if (isEditMode && !formData) { console.warn("BookingModalForm: useEffect[InitialData] - Edit mode, formData not yet available for InitialData effect."); }
        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, (isEditMode && formData ? formData.vehicle_id : null)]);


    // Effect 2: Fetch VEHICLE-SPECIFIC Extras when vehicle_id changes
    useEffect(() => {
        const fetchVehicleSpecificExtras = async (vehicleId) => {
            if (!vehicleId) {
                console.log("BookingModalForm: useEffect[FetchExtras] - No vehicleId. Clearing availableExtras.");
                setAvailableExtras([]);
                return;
            }
            setLoadingExtras(true);
            console.log(`BookingModalForm: useEffect[FetchExtras] - START. Fetching extras for vehicle_id: ${vehicleId}`);
            try {
                const paramsForExtras = { vehicle_id: vehicleId };
                console.log("BookingModalForm: useEffect[FetchExtras] - Params sent to fetchAllExtras:", paramsForExtras);
                const extrasRes = await fetchAllExtras(paramsForExtras);
                console.log("BookingModalForm: useEffect[FetchExtras] - Raw Extras Response from API:", extrasRes);
                const fetchedExtras = extractArrayFromApiResponse(extrasRes, "AvailableExtras");
                console.log("BookingModalForm: useEffect[FetchExtras] - Extracted Extras (should be vehicle specific):", fetchedExtras);
                setAvailableExtras(fetchedExtras);
            } catch (error) {
                console.error(`BookingModalForm: useEffect[FetchExtras] - Error fetching extras for vehicle ${vehicleId}:`, error);
                if (error.isAxiosError && error.response) { console.error("Axios Error Details:", { status: error.response.status, data: error.response.data}); }
                setAvailableExtras([]);
            } finally {
                setLoadingExtras(false);
                console.log("BookingModalForm: useEffect[FetchExtras] - END.");
            }
        };
        if (formData && !loadingInitialData && formData.vehicle_id) { fetchVehicleSpecificExtras(formData.vehicle_id); }
        else if (formData && !formData.vehicle_id) { setAvailableExtras([]); console.log("BookingModalForm: useEffect[FetchExtras] - Vehicle deselected, cleared availableExtras.");}
        else if (!formData) { console.warn("BookingModalForm: useEffect[FetchExtras] - formData not available. Cannot fetch extras."); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(formData ? formData.vehicle_id : null), loadingInitialData]);


    // Effect 3: Sync local selectedExtras (full objects) with formData.booking_extras (IDs from parent)
    useEffect(() => {
        console.log("BookingModalForm: useEffect[Sync selectedExtras] - START. isEditMode:", isEditMode, "formData.booking_extras:", (formData ? JSON.stringify(formData.booking_extras) : 'N/A'), "Available Extras:", availableExtras.length, "Current local selectedExtras:", selectedExtras.length, "loadingExtras:", loadingExtras);
        if (!formData || loadingInitialData || loadingExtras ) {
            console.log("BookingModalForm: useEffect[Sync selectedExtras] - Skipping: formData not ready or still loading initial data or extras.");
            return;
        }

        let initialSelectedObjects = [];
        if (availableExtras.length > 0 && formData.booking_extras && Array.isArray(formData.booking_extras)) {
            console.log("BookingModalForm: useEffect[Sync selectedExtras] - Attempting to map formData.booking_extras IDs to objects from availableExtras. formData.booking_extras:", JSON.stringify(formData.booking_extras));
            initialSelectedObjects = formData.booking_extras
                .map(extraIdentifier => {
                    const idToFind = (typeof extraIdentifier === 'object' && extraIdentifier !== null && extraIdentifier.id)
                        ? String(extraIdentifier.id)
                        : String(extraIdentifier);

                    const foundExtra = availableExtras.find(ae => String(ae.id) === idToFind);
                    if (!foundExtra) {
                        console.warn(`BookingModalForm: useEffect[Sync selectedExtras] - Extra ID '${idToFind}' from formData.booking_extras was NOT FOUND in current availableExtras (count: ${availableExtras.length}).`);
                    }
                    return foundExtra;
                })
                .filter(Boolean);
        } else {
            if (!(availableExtras.length > 0) && formData.booking_extras && formData.booking_extras.length > 0) {
                console.warn("BookingModalForm: useEffect[Sync selectedExtras] - formData.booking_extras has items, but availableExtras is empty.");
            }
            if (!formData.booking_extras || formData.booking_extras.length === 0) {
                console.log("BookingModalForm: useEffect[Sync selectedExtras] - formData.booking_extras is empty or not an array.");
            }
        }
        console.log("BookingModalForm: useEffect[Sync selectedExtras] - Objects derived after mapping (initialSelectedObjects):", JSON.parse(JSON.stringify(initialSelectedObjects)));

        const currentLocalSelectedIds = selectedExtras.map(se => String(se.id)).sort().join(',');
        const newIdsFromFormData = initialSelectedObjects.map(is => String(is.id)).sort().join(',');
        console.log("BookingModalForm: useEffect[Sync selectedExtras] - Current local IDs:", currentLocalSelectedIds, "New IDs derived from formData:", newIdsFromFormData);

        if (currentLocalSelectedIds !== newIdsFromFormData) {
            console.log("BookingModalForm: useEffect[Sync selectedExtras] - IDs differ. Setting local selectedExtras to:", JSON.parse(JSON.stringify(initialSelectedObjects)));
            setSelectedExtras(initialSelectedObjects);
        } else {
            console.log("BookingModalForm: useEffect[Sync selectedExtras] - No change needed for local selectedExtras based on formData and availableExtras.");
        }
        console.log("BookingModalForm: useEffect[Sync selectedExtras] - END.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(formData ? formData.booking_extras : null), availableExtras, loadingInitialData, loadingExtras, isEditMode, formData?.vehicle_id]);


    // Callback to calculate EXTRAS price and inform parent
    const calculateAndUpdateExtras = useCallback(() => {
        console.log("BookingModalForm: calculateAndUpdateExtras - START. Current local selectedExtras:", JSON.parse(JSON.stringify(selectedExtras)));
        if (!formData) { console.warn("calculateAndUpdateExtras - formData null."); return; }
        if (!selectedExtras) {
            console.warn("calculateAndUpdateExtras - selectedExtras null/undefined. Setting price to 0.");
            if(parseFloat(formData.calculated_extras_price||0).toFixed(2)!=='0.00') onFormDataChange({ target: { name: 'calculated_extras_price', value: '0.00' }});
            const cIds=(Array.isArray(formData.booking_extras)?formData.booking_extras.map(e=>(typeof e==='object'&& e!==null?String(e.id):String(e))).filter(Boolean):[]).sort().join(',');
            if(cIds!=="") onFormDataChange({target:{name:'booking_extras', value:[]}});
            return;
        }

        const newExtrasPrice = selectedExtras.reduce((total, extra) => {
            if (typeof extra !== 'object' || extra === null) { console.warn("Non-object in selectedExtras:", extra); return total; }
            const priceValue = extra.price;
            const price = parseFloat(priceValue || 0);
            console.log("Processing extra:", extra.name, "FIELD 'extra.price':", priceValue, "Parsed price:", price);
            return total + price;
        }, 0);

        const currentPriceInParent = parseFloat(formData.calculated_extras_price || 0).toFixed(2);
        const newPriceToSet = newExtrasPrice.toFixed(2);
        const currentExtraIdsInParent = (Array.isArray(formData.booking_extras) ? formData.booking_extras.map(e=>(typeof e === 'object' && e !== null ? String(e.id) : String(e))).filter(Boolean):[]).sort().join(',');
        const newExtraIdsToSet = selectedExtras.map(extra => String(extra.id)).sort().join(',');

        if (currentPriceInParent !== newPriceToSet) {
            console.log("Updating calculated_extras_price to:", newPriceToSet);
            onFormDataChange({ target: { name: 'calculated_extras_price', value: newPriceToSet } });
        }
        if (currentExtraIdsInParent !== newExtraIdsToSet) {
            console.log("Updating booking_extras (IDs) to:", selectedExtras.map(extra => extra.id));
            onFormDataChange({ target: { name: 'booking_extras', value: selectedExtras.map(extra => extra.id) } });
        }
        console.log("BookingModalForm: calculateAndUpdateExtras - END.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExtras, onFormDataChange, formData]);

    // Effect to trigger EXTRAS calculation
    useEffect(() => {
        console.log("BookingModalForm: useEffect[Call calculateAndUpdateExtras] - START. selectedExtras count:", selectedExtras ? selectedExtras.length : 'N/A');
        if (!loadingInitialData && !loadingExtras && formData) {
            calculateAndUpdateExtras();
        } else { console.log("Conditions NOT met for extras calculation.");}
        console.log("BookingModalForm: useEffect[Call calculateAndUpdateExtras] - END.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExtras, calculateAndUpdateExtras, loadingInitialData, loadingExtras, formData]);


    // Effect for Base Price Calculation
    useEffect(() => {
        console.log("BookingModalForm: useEffect[CalculateBasePrice] - START. VehicleID:", formData?.vehicle_id, "Vehicles loaded:", vehicles.length);
        if (!formData || !onFormDataChange || vehicles.length === 0) {
            console.log("Skipping base price: Not ready.");
            if (formData && parseFloat(formData.calculated_base_price || 0).toFixed(2) !== '0.00') {
                 onFormDataChange({ target: { name: 'calculated_base_price', value: '0.00' } });
            }
            return;
        }
        let newBasePrice = "0.00";
        if (formData.vehicle_id && formData.start_date && formData.end_date) {
            const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
            console.log("Selected Vehicle for base price:", JSON.parse(JSON.stringify(selectedVehicle || {})));
            if (selectedVehicle && selectedVehicle.base_price_per_day !== undefined && !isNaN(parseFloat(selectedVehicle.base_price_per_day))) {
                const vehicleDailyPrice = parseFloat(selectedVehicle.base_price_per_day);
                console.log("Found vehicleDailyPrice:", vehicleDailyPrice);
                try {
                    const startDate = new Date(formData.start_date);
                    const endDate = new Date(formData.end_date);
                    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate > startDate) {
                        const timeDiff = endDate.getTime() - startDate.getTime();
                        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        if (dayDiff > 0) newBasePrice = (dayDiff * vehicleDailyPrice).toFixed(2);
                        else console.log("dayDiff not positive for base price.");
                    } else { console.log("Invalid dates for base price."); }
                } catch (e) { console.error("Error in base price calc:", e); }
            } else { console.warn("Base price: Selected vehicle missing 'base_price_per_day' or invalid.", selectedVehicle ? `Price: ${selectedVehicle.base_price_per_day}`: "No vehicle"); }
        } else { console.log("Missing vehicle/dates for base price."); }

        if (formData.calculated_base_price !== newBasePrice) {
            console.log("Updating calculated_base_price to:", newBasePrice);
            onFormDataChange({ target: { name: 'calculated_base_price', value: newBasePrice } });
        }
        console.log("BookingModalForm: useEffect[CalculateBasePrice] - END");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.vehicle_id, formData?.start_date, formData?.end_date, vehicles, onFormDataChange]);


    // Effect for Insurance Price Calculation
    useEffect(() => {
        console.log("BookingModalForm: useEffect[CalculateInsurancePrice] - START");
        if (!formData || !onFormDataChange || insurancePlans.length === 0) {
            if (formData && parseFloat(formData.calculated_insurance_price || 0).toFixed(2) !== '0.00') {
                onFormDataChange({ target: { name: 'calculated_insurance_price', value: '0.00' } });
            }
            return;
        }
        let newInsurancePrice = "0.00";
        if (formData.insurance_plan_id && formData.start_date && formData.end_date) {
            const selectedPlan = insurancePlans.find(p => p.id === formData.insurance_plan_id);
            if (selectedPlan && selectedPlan.price_per_day) {
                try {
                    const startDate = new Date(formData.start_date);
                    const endDate = new Date(formData.end_date);
                    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate > startDate) {
                        const timeDiff = endDate.getTime() - startDate.getTime();
                        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        if (dayDiff > 0) newInsurancePrice = (dayDiff * parseFloat(selectedPlan.price_per_day)).toFixed(2);
                    }
                } catch (e) { console.error("Error calculating insurance price:", e); }
            }
        }
        if (formData.calculated_insurance_price !== newInsurancePrice) {
            console.log("Updating calculated_insurance_price to:", newInsurancePrice);
            onFormDataChange({ target: { name: 'calculated_insurance_price', value: newInsurancePrice } });
        }
        console.log("BookingModalForm: useEffect[CalculateInsurancePrice] - END");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.insurance_plan_id, formData?.start_date, formData?.end_date, insurancePlans, onFormDataChange]);


    // Effect to calculate discount_amount_applied from discount_percentage
    useEffect(() => {
        console.log("BookingModalForm: useEffect[CalculateDiscountAmount] - START. Discount Percentage:", formData?.discount_percentage);
        if (!formData || !onFormDataChange) { return; }
        const percentage = parseFloat(formData.discount_percentage || 0);
        const subtotal = parseFloat(formData.calculated_base_price || 0) +
                         parseFloat(formData.calculated_extras_price || 0) +
                         parseFloat(formData.calculated_insurance_price || 0);
        let newDiscountAmount = "0.00";
        if (percentage > 0 && percentage <= 100 && subtotal > 0) {
            newDiscountAmount = ((subtotal * percentage) / 100).toFixed(2);
        } else if (percentage > 100) {
             newDiscountAmount = subtotal > 0 ? subtotal.toFixed(2) : "0.00";
        }
        if (formData.discount_amount_applied !== newDiscountAmount) {
            console.log(`Subtotal: ${subtotal.toFixed(2)}, Perc: ${percentage}%, New Discount Amount: ${newDiscountAmount}`);
            onFormDataChange({ target: { name: 'discount_amount_applied', value: newDiscountAmount } });
        }
        console.log("BookingModalForm: useEffect[CalculateDiscountAmount] - END");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formData?.discount_percentage,
        formData?.calculated_base_price,
        formData?.calculated_extras_price,
        formData?.calculated_insurance_price,
        onFormDataChange
    ]);


    // Effect for Final Price Calculation (Summation)
    useEffect(() => {
        console.log("BookingModalForm: useEffect[CalculateFinalPrice] - START");
        if (!formData || !onFormDataChange) { return; }
        const base = parseFloat(formData.calculated_base_price || 0);
        const extras = parseFloat(formData.calculated_extras_price || 0);
        const insurance = parseFloat(formData.calculated_insurance_price || 0);
        const discount = parseFloat(formData.discount_amount_applied || 0);
        const newFinalPrice = (base + extras + insurance - discount).toFixed(2);
        console.log(`FinalPrice Calc: Base:${base}, Extras:${extras}, Ins:${insurance}, Disc (amount):${discount}, NewFinal:${newFinalPrice}`);
        if (formData.final_price !== newFinalPrice) {
            console.log("Updating final_price to:", newFinalPrice);
            onFormDataChange({ target: { name: 'final_price', value: newFinalPrice } });
        }
        console.log("BookingModalForm: useEffect[CalculateFinalPrice] - END");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formData?.calculated_base_price,
        formData?.calculated_extras_price,
        formData?.calculated_insurance_price,
        formData?.discount_amount_applied,
        onFormDataChange
    ]);


    const handleExtraChange = (extraId) => {
        console.log("BookingModalForm: handleExtraChange - START. Toggling extraId:", extraId);
        console.log("Current availableExtras:", JSON.parse(JSON.stringify(availableExtras)));
        setSelectedExtras(prevSelected => {
            console.log("Inside setSelectedExtras. prevSelected:", JSON.parse(JSON.stringify(prevSelected)));
            const alreadySelected = prevSelected.find(e => String(e.id) === String(extraId)); // Compare as strings
            let newSelection;
            if (alreadySelected) {
                newSelection = prevSelected.filter(e => String(e.id) !== String(extraId));
            } else {
                const extraToAdd = availableExtras.find(e => String(e.id) === String(extraId));
                if (extraToAdd) { newSelection = [...prevSelected, extraToAdd]; }
                else { newSelection = prevSelected; console.warn("Extra not found in availableExtras:", extraId); }
            }
            console.log("New local selectedExtras state candidate:", JSON.parse(JSON.stringify(newSelection)));
            return newSelection;
        });
    };
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try { const date = new Date(dateString); return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16); }
        catch (e) { return ''; }
    };
    useEffect(() => { if (submissionError && formData) clearSubmissionError(); }, [formData, clearSubmissionError]);


    if (!formData) { console.error("CRITICAL - formData prop missing."); }
    if (loadingInitialData && (!users.length || !vehicles.length || !insurancePlans.length)) {
        return <div className="text-center p-3"><Spinner animation="border" size="sm" /> Loading...</div>;
    }
    if (!formData) { return <Alert variant="danger">Form data not available.</Alert>; }

    return (
        <>
            {submissionError && (<Alert variant="danger" className="mb-3 small" onClose={clearSubmissionError} dismissible>{submissionError}</Alert>)}
            {Object.keys(modalFormErrors || {}).length > 0 && !submissionError && (<Alert variant="danger" className="mb-3 small">Please correct highlighted errors.</Alert>)}

            <Form.Group className="mb-3" controlId="bookingRenterUserId">
                <Form.Label>Renter <span className="text-danger">*</span></Form.Label>
                <Form.Select name="renter_user_id" value={formData.renter_user_id || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.renter_user_id} disabled={loadingInitialData}>
                    <option value="">Select Renter...</option>
                    {users.map(user => (<option key={user.id} value={user.id}>{user.full_name || user.name} ({user.email})</option>))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.renter_user_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="bookingVehicleId">
                <Form.Label>Vehicle <span className="text-danger">*</span></Form.Label>
                <Form.Select name="vehicle_id" value={formData.vehicle_id || ''}
                    onChange={(e) => { console.log("Vehicle selection changed:", e.target.value); handleInputChange(e); }}
                    required isInvalid={!!modalFormErrors?.vehicle_id} disabled={loadingInitialData}>
                    <option value="">Select Vehicle...</option>
                    {vehicles.map(v => (<option key={v.id} value={v.id}>{v.display_name}</option>))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.vehicle_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

             <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="bookingStartDate">
                        <Form.Label>Start Date & Time <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="datetime-local" name="start_date" value={formatDateForInput(formData.start_date)} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.start_date} />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.start_date?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="bookingEndDate">
                        <Form.Label>End Date & Time <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="datetime-local" name="end_date" value={formatDateForInput(formData.end_date)} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.end_date} />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.end_date?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="bookingInsurancePlanId">
                <Form.Label>Insurance Plan</Form.Label>
                <Form.Select name="insurance_plan_id" value={formData.insurance_plan_id || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors?.insurance_plan_id} disabled={loadingInitialData}>
                    <option value="">None</option>
                    {insurancePlans.map(plan => (<option key={plan.id} value={plan.id}>{plan.name} (+{parseFloat(plan.price_per_day || 0).toFixed(2)} MAD/day)</option>))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.insurance_plan_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="bookingExtrasSelection">
                <Form.Label>Additional Extras</Form.Label>
                {loadingExtras ? <Spinner size="sm" /> :
                    !formData.vehicle_id ? <p className="text-muted small">Please select a vehicle to see available extras.</p> :
                    availableExtras.length > 0 ? (
                        availableExtras.map(extra => {
                            const isChecked = selectedExtras.some(se => String(se.id) === String(extra.id)); // Compare as strings
                            return (<FormCheck key={extra.id} type="checkbox" id={`extra-${extra.id}`}
                                label={`${extra.name} (+${parseFloat(extra.price || 0).toFixed(2)} MAD)`} // Assumes 'extra.price'
                                checked={isChecked} onChange={() => handleExtraChange(extra.id)}
                                isInvalid={!!modalFormErrors?.booking_extras} />);
                        })
                    ) : (<p className="text-muted small">No additional extras available for the selected vehicle.</p>)
                }
                <Form.Control.Feedback type="invalid">{modalFormErrors?.booking_extras?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="bookingStatus">
                <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                <Form.Select name="status" value={formData.status || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.status}>
                    <option value="">Select Status...</option>
                    {bookingStatusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.status?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Alert variant="secondary" className="small mt-3 p-2">Prices are estimated.</Alert>
            <Row>
                <Col md={6}><Form.Group className="mb-3" controlId="bookingBasePrice"><Form.Label>Base Price</Form.Label><Form.Control readOnly type="number" name="calculated_base_price" value={formData.calculated_base_price || '0.00'} /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3" controlId="bookingExtrasPrice"><Form.Label>Extras Price</Form.Label><Form.Control readOnly type="number" name="calculated_extras_price" value={formData.calculated_extras_price || '0.00'} /></Form.Group></Col>
            </Row>
            <Row>
                <Col md={4}><Form.Group className="mb-3" controlId="bookingInsurancePrice"><Form.Label>Insurance Price</Form.Label><Form.Control readOnly type="number" name="calculated_insurance_price" value={formData.calculated_insurance_price || '0.00'} /></Form.Group></Col>
                <Col md={4}>
                    <Form.Group className="mb-3" controlId="bookingDiscountPercentage">
                        <Form.Label>Discount (%)</Form.Label>
                        <Form.Control type="number" name="discount_percentage" value={formData.discount_percentage || ''} onChange={handleInputChange} min="0" max="100" step="1" placeholder="e.g., 10" isInvalid={!!modalFormErrors?.discount_percentage}/>
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.discount_percentage?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3" controlId="bookingFinalPrice">
                        <Form.Label>Final Price <span className="text-danger">*</span></Form.Label>
                        <Form.Control readOnly={true} type="number" name="final_price" value={formData.final_price || '0.00'} required isInvalid={!!modalFormErrors?.final_price} />
                        {parseFloat(formData.discount_amount_applied || 0) > 0 && <Form.Text className="text-muted d-block mt-1">(Discount: {formData.discount_amount_applied} MAD)</Form.Text>}
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.final_price?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
};
export default BookingModalForm;