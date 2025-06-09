import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Spinner, Alert, FormCheck, InputGroup, Button } from 'react-bootstrap';
import axios from 'axios';
import {
    fetchAllUsersForAdmin as fetchAllUsers,
    fetchAllInsurancePlans,
    fetchAllExtras,
    validatePromotionCode
} from '../../services/api';
import { BookingStatus as BookingStatusEnum } from '../../Enums';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const bookingStatusOptions = Object.values(BookingStatusEnum || {}).map(status => ({
    value: status.value || status,
    label: status.label || (typeof status === 'string' ? (status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')) : String(status))
}));

const BookingModalForm = ({
    formData,
    handleInputChange,
    modalFormErrors,
    isEditMode,
    submissionError,
    clearSubmissionError,
    onFormDataChange
}) => {
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [insurancePlans, setInsurancePlans] = useState([]);
    const [availableExtras, setAvailableExtras] = useState([]);
    const [selectedExtrasData, setSelectedExtrasData] = useState([]);

    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [loadingExtras, setLoadingExtras] = useState(false);

    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [promoCodeLoading, setPromoCodeLoading] = useState(false);
    const [promoCodeMessage, setPromoCodeMessage] = useState({ type: '', text: '' });
    const [appliedPromoDetails, setAppliedPromoDetails] = useState(null);

    const extractArrayFromApiResponse = (responseOrData, itemName) => {
        if (Array.isArray(responseOrData)) { return responseOrData; }
        if (responseOrData && responseOrData.data) {
            if (responseOrData.data.data && Array.isArray(responseOrData.data.data)) { return responseOrData.data.data; }
            if (Array.isArray(responseOrData.data)) { return responseOrData.data; }
        }
        console.warn(`BookingModalForm: Could not extract array for ${itemName}. Input:`, responseOrData);
        return [];
    };

    // Effect 0: Initialize promoCodeInput & applied details from parent formData (for edit mode)
    useEffect(() => {
        if (isEditMode) {
            const parentCodeStr = formData?.promotion_code_string || '';
            if (promoCodeInput !== parentCodeStr) {
                setPromoCodeInput(parentCodeStr);
            }
            if (formData?.promotion_code_id && parseFloat(formData.discount_amount_applied || 0) > 0) {
                if (!appliedPromoDetails || appliedPromoDetails.promotion_code_id !== formData.promotion_code_id) {
                    setAppliedPromoDetails({
                        promotion_code_id: formData.promotion_code_id,
                        code_string: parentCodeStr,
                        discount_amount: parseFloat(formData.discount_amount_applied),
                    });
                    setPromoCodeMessage({ type: 'success', text: `Code '${parentCodeStr}' applied.` });
                }
            } else if (appliedPromoDetails) {
                setAppliedPromoDetails(null); setPromoCodeMessage({ type: '', text: '' });
            }
        } else {
            if (promoCodeInput !== '' && (!formData || !formData.promotion_code_string)) {
                setPromoCodeInput('');
            }
            if (appliedPromoDetails) { setAppliedPromoDetails(null); setPromoCodeMessage({ type: '', text: '' }); }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, formData?.promotion_code_string, formData?.promotion_code_id, formData?.discount_amount_applied]);

    // Effect 1: Fetch initial independent data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingInitialData(true);
            const vehiclesApiUrl = 'http://localhost:8000/api/vehicles?status=available&all=true';
            try {
                const [usersRes, vehiclesRes, plansRes] = await Promise.all([
                    fetchAllUsers({ all: true }),
                    axios.get(vehiclesApiUrl, { withCredentials: true, headers: { 'Accept': 'application/json' } }),
                    fetchAllInsurancePlans({ all: true, active: true })
                ]);
                setUsers(extractArrayFromApiResponse(usersRes, "Users"));
                setInsurancePlans(extractArrayFromApiResponse(plansRes, "Insurance Plans"));
                const rawVehicles = extractArrayFromApiResponse(vehiclesRes, "Vehicles");
                const processedVehicles = rawVehicles.map(v => ({
                    ...v,
                    base_price_per_day: parseFloat(v.base_price_per_day || 0),
                    display_name: `${v.vehicle_model_title || v.vehicle_model?.title || 'Unknown Model'} (${v.license_plate || 'N/A'}) - Status: ${v.status_display || v.status || 'N/A'}`
                }));
                const filteredVehicles = processedVehicles.filter(v => v.status === 'available' || (isEditMode && formData && v.id === formData.vehicle_id));
                setVehicles(filteredVehicles);
            } catch (error) {
                console.error("BookingModalForm: Error fetching initial data:", error);
                setUsers([]);
                setVehicles([]);
                setInsurancePlans([]);
            } finally {
                setLoadingInitialData(false);
            }
        };
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, formData?.vehicle_id]);

    // Effect 2: Fetch VEHICLE-SPECIFIC Extras
    useEffect(() => {
        const fetchVehicleSpecificExtras = async (vehicleId) => {
            if (!vehicleId) { setAvailableExtras([]); setSelectedExtrasData([]); return; }
            setLoadingExtras(true);
            try {
                const extrasRes = await fetchAllExtras({ vehicle_id: vehicleId, all: true });
                const fetchedExtras = extractArrayFromApiResponse(extrasRes, "AvailableExtras");
                setAvailableExtras(fetchedExtras);
            } catch (error) {
                console.error(`Error fetching extras for vehicle ${vehicleId}:`, error);
                setAvailableExtras([]);
            } finally {
                setLoadingExtras(false);
            }
        };
        if (formData?.vehicle_id && !loadingInitialData) {
            fetchVehicleSpecificExtras(formData.vehicle_id);
        } else if (formData && !formData.vehicle_id) {
            setAvailableExtras([]);
            setSelectedExtrasData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.vehicle_id, loadingInitialData]);

    // Effect 3: Sync local selectedExtrasData with formData.booking_extras (from parent, for edit mode)
    useEffect(() => {
        if (!formData || loadingInitialData || loadingExtras) { return; }
        if (availableExtras.length === 0) { return; }

        let newSelectionFromParent = [];
        if (formData.booking_extras && Array.isArray(formData.booking_extras) && formData.booking_extras.length > 0) {
            newSelectionFromParent = formData.booking_extras.map(parentExtraItem => {
                const idToFind = String(parentExtraItem.extra_id || parentExtraItem.id || parentExtraItem);
                const fullExtraDetails = availableExtras.find(ae => String(ae.id) === idToFind);
                if (fullExtraDetails) return { ...fullExtraDetails, quantity: parseInt(parentExtraItem.quantity || 1) };
                return null;
            }).filter(Boolean);
        }
        const currentLocalComp = selectedExtrasData.map(e => ({ id: e.id, q: e.quantity })).sort((a,b)=>a.id.localeCompare(b.id));
        const newParentComp = newSelectionFromParent.map(e => ({ id: e.id, q: e.quantity })).sort((a,b)=>a.id.localeCompare(b.id));
        if (JSON.stringify(currentLocalComp) !== JSON.stringify(newParentComp)) {
            setSelectedExtrasData(newSelectionFromParent);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.booking_extras, availableExtras, loadingInitialData, loadingExtras]);

    // Callback to calculate EXTRAS price and inform parent
    const calculateAndUpdateParentExtras = useCallback(() => {
        if (!onFormDataChange) return;
        let newCalculatedExtrasPrice = 0;
        const newBookingExtrasDataForParent = selectedExtrasData.map(selectedExtra => {
            const pricePerUnit = parseFloat(selectedExtra.default_price_per_day || 0);
            const quantity = parseInt(selectedExtra.quantity || 1);
            newCalculatedExtrasPrice += (pricePerUnit * quantity);
            return { extra_id: selectedExtra.id, quantity: quantity, price_at_booking: pricePerUnit.toFixed(2) };
        });

        const parentCalculatedExtrasPrice = parseFloat(formData?.calculated_extras_price || 0).toFixed(2);
        const newPriceToSet = newCalculatedExtrasPrice.toFixed(2);

        const parentBookingExtrasComparable = (Array.isArray(formData?.booking_extras) ? formData.booking_extras : [])
            .map(e => ({ extra_id: String(e.extra_id || e.id || e), quantity: parseInt(e.quantity || 1), price_at_booking: parseFloat(e.price_at_booking || 0).toFixed(2) }))
            .sort((a, b) => a.extra_id.localeCompare(b.extra_id));
        const newBookingExtrasComparable = newBookingExtrasDataForParent
            .sort((a, b) => a.extra_id.localeCompare(b.extra_id));

        if (parentCalculatedExtrasPrice !== newPriceToSet) {
            onFormDataChange({ target: { name: 'calculated_extras_price', value: newPriceToSet } });
        }
        if (JSON.stringify(parentBookingExtrasComparable) !== JSON.stringify(newBookingExtrasComparable)) {
            onFormDataChange({ target: { name: 'booking_extras', value: newBookingExtrasDataForParent } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExtrasData, onFormDataChange, formData?.calculated_extras_price, formData?.booking_extras]);

    // Effect to trigger EXTRAS calculation for parent WHEN LOCAL SELECTION CHANGES
    useEffect(() => {
        if (!loadingInitialData && !loadingExtras && formData) {
            calculateAndUpdateParentExtras();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExtrasData, calculateAndUpdateParentExtras]);

    // Base Price Calculation
    useEffect(() => {
        if (!formData || !onFormDataChange || !vehicles?.length) {
            if (formData && String(formData.calculated_base_price || "0.00") !== "0.00") onFormDataChange({ target: { name: 'calculated_base_price', value: "0.00" } });
            return;
        }
        let newBasePrice = "0.00";
        if (formData.vehicle_id && formData.start_date && formData.end_date) {
            const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
            if (selectedVehicle && selectedVehicle.base_price_per_day !== undefined && !isNaN(parseFloat(selectedVehicle.base_price_per_day))) {
                const vehicleDailyPrice = parseFloat(selectedVehicle.base_price_per_day);
                try {
                    const startDate = new Date(formData.start_date); const endDate = new Date(formData.end_date);
                    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate > startDate) {
                        const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                        if (dayDiff > 0) newBasePrice = (dayDiff * vehicleDailyPrice).toFixed(2);
                    }
                } catch (e) { }
            }
        }
        if (String(formData.calculated_base_price || "0.00") !== newBasePrice) {
            onFormDataChange({ target: { name: 'calculated_base_price', value: newBasePrice } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.vehicle_id, formData?.start_date, formData?.end_date, vehicles, onFormDataChange]);

    // Insurance Price Calculation
    useEffect(() => {
        if (!formData || !onFormDataChange || !insurancePlans?.length) {
            if (formData && String(formData.calculated_insurance_price || "0.00") !== "0.00") onFormDataChange({ target: { name: 'calculated_insurance_price', value: "0.00" } });
            return;
        }
        let newInsurancePrice = "0.00";
        if (formData.insurance_plan_id && formData.start_date && formData.end_date) {
            const selectedPlan = insurancePlans.find(p => p.id === formData.insurance_plan_id);
            if (selectedPlan && selectedPlan.price_per_day != null) {
                try {
                    const startDate = new Date(formData.start_date); const endDate = new Date(formData.end_date);
                    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate > startDate) {
                        const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                        if (dayDiff > 0) newInsurancePrice = (dayDiff * parseFloat(selectedPlan.price_per_day)).toFixed(2);
                    }
                } catch (e) { }
            }
        }
        if (String(formData.calculated_insurance_price || "0.00") !== newInsurancePrice) {
            onFormDataChange({ target: { name: 'calculated_insurance_price', value: newInsurancePrice } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.insurance_plan_id, formData?.start_date, formData?.end_date, insurancePlans, onFormDataChange]);

    // Final Price Calculation
    useEffect(() => {
        if (!formData || !onFormDataChange) { return; }
        const base = parseFloat(formData.calculated_base_price || 0);
        const extras = parseFloat(formData.calculated_extras_price || 0);
        const insurance = parseFloat(formData.calculated_insurance_price || 0);
        const discount = parseFloat(formData.discount_amount_applied || 0);
        const newFinalPrice = Math.max(0, (base + extras + insurance - discount)).toFixed(2);
        if (String(formData.final_price || "0.00") !== newFinalPrice) {
            onFormDataChange({ target: { name: 'final_price', value: newFinalPrice } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formData?.calculated_base_price, formData?.calculated_extras_price,
        formData?.calculated_insurance_price, formData?.discount_amount_applied,
        onFormDataChange
    ]);

    const handlePromoCodeInputChange = (e) => {
        setPromoCodeInput(e.target.value.toUpperCase());
        if (appliedPromoDetails || promoCodeMessage.text) {
            setAppliedPromoDetails(null);
            setPromoCodeMessage({ type: '', text: '' });
            onFormDataChange({ target: { name: 'discount_amount_applied', value: '0.00' } });
            onFormDataChange({ target: { name: 'promotion_code_id', value: null } });
            onFormDataChange({ target: { name: 'promotion_code_string', value: e.target.value.toUpperCase() } });
        } else {
            onFormDataChange({ target: { name: 'promotion_code_string', value: e.target.value.toUpperCase() } });
        }
    };

    const handleApplyPromoCode = async () => {
        if (!promoCodeInput.trim()) {
            setPromoCodeMessage({ type: 'danger', text: "Please enter a promotion code." });
            setAppliedPromoDetails(null);
            onFormDataChange({ target: { name: 'discount_amount_applied', value: '0.00' } });
            onFormDataChange({ target: { name: 'promotion_code_id', value: null } });
            return;
        }
        setPromoCodeLoading(true);
        setPromoCodeMessage({ type: '', text: '' });
        try {
            const subtotal = parseFloat(formData.calculated_base_price || 0) +
                parseFloat(formData.calculated_extras_price || 0) +
                parseFloat(formData.calculated_insurance_price || 0);

            const response = await validatePromotionCode(promoCodeInput, {
                booking_subtotal: subtotal,
                user_id: formData.renter_user_id || null,
            });
            const details = response.data.data;
            setAppliedPromoDetails(details);
            setPromoCodeMessage({ type: 'success', text: `Code '${details.code_string}' applied! Discount: ${details.discount_amount.toFixed(2)} MAD` });
            onFormDataChange({ target: { name: 'discount_amount_applied', value: details.discount_amount.toFixed(2) } });
            onFormDataChange({ target: { name: 'promotion_code_id', value: details.promotion_code_id } });
            onFormDataChange({ target: { name: 'promotion_code_string', value: details.code_string } });
        } catch (error) {
            const message = error.response?.data?.message || "Invalid or inapplicable promotion code.";
            setPromoCodeMessage({ type: 'danger', text: message });
            setAppliedPromoDetails(null);
            onFormDataChange({ target: { name: 'discount_amount_applied', value: '0.00' } });
            onFormDataChange({ target: { name: 'promotion_code_id', value: null } });
        } finally {
            setPromoCodeLoading(false);
        }
    };

    const handleExtraSelectionChange = (extraId) => {
        setSelectedExtrasData(currentSelected => {
            const isAlreadySelected = currentSelected.find(e => String(e.id) === String(extraId));
            if (isAlreadySelected) {
                return currentSelected.filter(e => String(e.id) !== String(extraId));
            } else {
                const extraDetails = availableExtras.find(e => String(e.id) === String(extraId));
                return extraDetails ? [...currentSelected, { ...extraDetails, quantity: 1 }] : currentSelected;
            }
        });
    };

    const handleExtraQuantityChange = (extraId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);
        setSelectedExtrasData(currentSelected =>
            currentSelected.map(extra =>
                String(extra.id) === String(extraId)
                    ? { ...extra, quantity: Math.max(1, quantity) }
                    : extra
            )
        );
    };

    const formatDateForInputHelper = (dateString) => {
        if (!dateString) return '';
        try { const date = new Date(dateString); return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16); }
        catch (e) { return ''; }
    };

    useEffect(() => { if (submissionError && clearSubmissionError) clearSubmissionError(); }, [formData, clearSubmissionError]);

    if (!formData) { return <Alert variant="danger">Form data is not available.</Alert>; }
    if (loadingInitialData) { return <div className="text-center p-3"><Spinner animation="border" size="sm" /> Loading initial data...</div>; }

    return (
        <>
            {submissionError && (<Alert variant="danger" className="mb-3 small" onClose={clearSubmissionError} dismissible>{submissionError}</Alert>)}
            {Object.keys(modalFormErrors || {}).length > 0 && !submissionError && (<Alert variant="danger" className="mb-3 small">Please correct highlighted errors.</Alert>)}

            <Form.Group className="mb-3" controlId="bookingRenterUserId">
                <Form.Label>Renter <span className="text-danger">*</span></Form.Label>
                <Form.Select name="renter_user_id" value={formData.renter_user_id || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.renter_user_id}>
                    <option value="">Select Renter...</option>
                    {users.map(user => (<option key={user.id} value={user.id}>{user.full_name || user.name} ({user.email})</option>))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.renter_user_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="bookingVehicleId">
                <Form.Label>Vehicle <span className="text-danger">*</span></Form.Label>
                <Form.Select name="vehicle_id" value={formData.vehicle_id || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.vehicle_id}>
                    <option value="">Select Vehicle...</option>
                    {vehicles.map(v => (<option key={v.id} value={v.id}>{v.display_name}</option>))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.vehicle_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="bookingStartDate">
                        <Form.Label>Start Date & Time <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="datetime-local" name="start_date" value={formatDateForInputHelper(formData.start_date)} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.start_date} />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.start_date?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="bookingEndDate">
                        <Form.Label>End Date & Time <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="datetime-local" name="end_date" value={formatDateForInputHelper(formData.end_date)} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.end_date} />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.end_date?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="bookingInsurancePlanId">
                <Form.Label>Insurance Plan</Form.Label>
                <Form.Select name="insurance_plan_id" value={formData.insurance_plan_id || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors?.insurance_plan_id}>
                    <option value="">None</option>
                    {insurancePlans.map(plan => (<option key={plan.id} value={plan.id}>{plan.name} (+{parseFloat(plan.price_per_day || 0).toFixed(2)} MAD/day)</option>))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.insurance_plan_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="bookingExtrasSelection">
                <Form.Label>Additional Extras</Form.Label>
                {loadingExtras ? <div className="text-center"><Spinner size="sm" /> Loading extras...</div> :
                    !formData.vehicle_id ? <p className="text-muted small">Please select a vehicle to see available extras.</p> :
                    availableExtras.length > 0 ? (
                        availableExtras.map(extra => {
                            const currentSelectedExtraData = selectedExtrasData.find(se => String(se.id) === String(extra.id));
                            const isChecked = !!currentSelectedExtraData;
                            const currentQuantity = isChecked ? currentSelectedExtraData.quantity : 1;
                            return (
                                <Row key={extra.id} className="mb-2 align-items-center">
                                    <Col xs={7} sm={8}>
                                        <FormCheck
                                            type="checkbox"
                                            id={`extra-${extra.id}`}
                                            label={`${extra.name} (+${parseFloat(extra.default_price_per_day || 0).toFixed(2)} MAD/unit)`}
                                            checked={isChecked}
                                            onChange={() => handleExtraSelectionChange(String(extra.id))}
                                            isInvalid={!!modalFormErrors?.booking_extras}
                                        />
                                    </Col>
                                    <Col xs={5} sm={4}>
                                        {isChecked && (
                                            <InputGroup size="sm">
                                                <InputGroup.Text>Qty</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    min="1"
                                                    value={currentQuantity}
                                                    onChange={(e) => handleExtraQuantityChange(String(extra.id), e.target.value)}
                                                    aria-label={`Quantity for ${extra.name}`}
                                                />
                                            </InputGroup>
                                        )}
                                    </Col>
                                </Row>
                            );
                        })
                    ) : (<p className="text-muted small">No extras for selected vehicle or error.</p>)
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

            {/* --- PROMOTION CODE INPUT --- */}
            <Form.Group className="mb-3" controlId="bookingPromotionCodeString">
                <Form.Label>Promotion Code (Optional)</Form.Label>
                <InputGroup>
                    <Form.Control
                        type="text"
                        name="promotion_code_string_input"
                        value={promoCodeInput}
                        onChange={handlePromoCodeInputChange}
                        placeholder="Enter code"
                        isInvalid={!!modalFormErrors?.promotion_code_id || !!modalFormErrors?.promotion_code_string || promoCodeMessage.type === 'danger'}
                    />
                    <Button variant="outline-secondary" onClick={handleApplyPromoCode} disabled={promoCodeLoading}>
                        {promoCodeLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Apply'}
                    </Button>
                </InputGroup>
                {promoCodeMessage.text && (
                    <Form.Text className={promoCodeMessage.type === 'danger' ? 'text-danger' : 'text-success'}>
                        {promoCodeMessage.text}
                    </Form.Text>
                )}
                <Form.Control.Feedback type="invalid">
                    {modalFormErrors?.promotion_code_id?.join(', ') || modalFormErrors?.promotion_code_string?.join(', ')}
                </Form.Control.Feedback>
            </Form.Group>
            {/* --- END PROMOTION CODE INPUT --- */}

            <Alert variant="light" className="mt-4 p-3 small">
                <Row className="mb-2"><Col>Base Price:</Col><Col xs="auto" className="text-end">{parseFloat(formData.calculated_base_price || 0).toFixed(2)} MAD</Col></Row>
                <Row className="mb-2"><Col>Extras:</Col><Col xs="auto" className="text-end">{parseFloat(formData.calculated_extras_price || 0).toFixed(2)} MAD</Col></Row>
                <Row className="mb-2"><Col>Insurance:</Col><Col xs="auto" className="text-end">{parseFloat(formData.calculated_insurance_price || 0).toFixed(2)} MAD</Col></Row>
                {parseFloat(formData.discount_amount_applied || 0) > 0 && (
                    <Row className="mb-2 text-success">
                        <Col>Discount Applied (Code: {appliedPromoDetails?.code_string || formData.promotion_code_string || 'N/A'}):</Col>
                        <Col xs="auto" className="text-end">-{parseFloat(formData.discount_amount_applied || 0).toFixed(2)} MAD</Col>
                    </Row>
                )}
                <hr />
                <Row className="fw-bold"><Col>Final Price:</Col><Col xs="auto" className="text-end">{parseFloat(formData.final_price || 0).toFixed(2)} MAD</Col></Row>
            </Alert>
        </>
    );
};
export default React.memo(BookingModalForm);