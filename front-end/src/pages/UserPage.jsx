import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
import { LuUsers } from 'react-icons/lu';
import {
  fetchAllUsersForAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
} from '../services/api';
import ResourcePage from '../components/ResourcePage';
import UserRewardsTab from '../pages/UserRewardsTab'; 
import 'bootstrap/dist/css/bootstrap.min.css';

// --- Columns for the User Table (No changes needed) ---
const userColumns = [
  { header: 'Name', key: 'full_name', render: (item) => item.full_name || <span className="text-muted-custom">N/A</span> },
  { header: 'Email', key: 'email', render: (item) => item.email || <span className="text-muted-custom">N/A</span> },
  { header: 'Phone', key: 'phone', render: (item) => item.phone || <span className="text-muted-custom">N/A</span> },
  {
    header: 'Role',
    key: 'roles',
    render: (item) => {
      let roleName = 'customer'; // Default role
      if (Array.isArray(item.roles) && item.roles.length > 0) {
        // Find admin role, otherwise take the first role in the array
        const adminRole = item.roles.find(r => r.name === 'admin');
        roleName = adminRole ? adminRole.name : (item.roles[0]?.name || 'customer');
      } else if (typeof item.roles === 'string') {
        // Handle cases where the role is already a simple string
        roleName = item.roles;
      }
      const badgeBg = roleName === 'admin' ? 'danger' : 'info';
      return (
        <Badge pill bg={badgeBg} className="text-white">
          {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
        </Badge>
      );
    }
  },
  { header: 'Joined', key: 'created_at', render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A' },
];

// --- Initial Form Data (No changes needed) ---
const initialUserData = {
  id: null, full_name: '', email: '', phone: '',
  password: '', password_confirmation: '', profile_picture_url: '',
  loyalty_points: 0, 
  roles: 'customer', // The default role is a simple string
};

// --- Modal Form Fields Component (No changes needed) ---
const UserModalFormFields = ({ formData, handleInputChange, modalFormErrors, isEditMode }) => {
  const availableRoles = [
    { name: 'customer', label: 'Customer' },
    { name: 'admin', label: 'Admin' },
  ];

  return (
    <Tabs defaultActiveKey="details" id="user-modal-tabs" className="mb-3" unmountOnExit>
      <Tab eventKey="details" title="User Details">
        <Form.Group className="mb-3" controlId="userFullName">
          <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.full_name} />
          <Form.Control.Feedback type="invalid">{modalFormErrors?.full_name?.join(', ')}</Form.Control.Feedback>
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="userEmail">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control type="email" name="email" value={formData.email || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.email} />
              <Form.Control.Feedback type="invalid">{modalFormErrors?.email?.join(', ')}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="userPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors?.phone} />
              <Form.Control.Feedback type="invalid">{modalFormErrors?.phone?.join(', ')}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="userPassword">
              <Form.Label>{isEditMode ? 'New Password (Optional)' : 'Password'} <span className="text-danger">{!isEditMode ? '*' : ''}</span></Form.Label>
              <Form.Control type="password" name="password" value={formData.password || ''} onChange={handleInputChange} required={!isEditMode} isInvalid={!!modalFormErrors?.password} placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"} />
              <Form.Control.Feedback type="invalid">{modalFormErrors?.password?.join(', ')}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="userPasswordConfirmation">
              <Form.Label>{isEditMode ? 'Confirm New Password' : 'Confirm Password'} <span className="text-danger">{!isEditMode || formData.password ? '*' : ''}</span></Form.Label>
              <Form.Control type="password" name="password_confirmation" value={formData.password_confirmation || ''} onChange={handleInputChange} required={!isEditMode || !!formData.password} isInvalid={!!modalFormErrors?.password_confirmation} placeholder={isEditMode ? "Confirm if changing" : "Confirm password"} />
              <Form.Control.Feedback type="invalid">{modalFormErrors?.password_confirmation?.join(', ')}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3" controlId="userRole">
          <Form.Label>Role</Form.Label>
          <Form.Select 
            name="roles"
            value={formData.roles || 'customer'}
            onChange={handleInputChange}
            isInvalid={!!modalFormErrors?.roles || !!modalFormErrors?.['roles.0']}
          >
            {availableRoles.map(role => (
              <option key={role.name} value={role.name}>
                {role.label}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {modalFormErrors?.roles?.join(', ') || modalFormErrors?.['roles.0']?.join(', ')}
          </Form.Control.Feedback>
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="userLoyaltyPoints">
          <Form.Label>Loyalty Points</Form.Label>
          <Form.Control type="number" name="loyalty_points" value={formData.loyalty_points || 0} onChange={handleInputChange} min="0" isInvalid={!!modalFormErrors?.loyalty_points} />
          <Form.Control.Feedback type="invalid">{modalFormErrors?.loyalty_points?.join(', ')}</Form.Control.Feedback>
        </Form.Group>
      </Tab>
      {isEditMode && formData.id && (
        <Tab eventKey="rewards" title="Loyalty & Rewards">
          <UserRewardsTab userId={formData.id} />
        </Tab>
      )}
    </Tabs>
  );
};


// --- Main UserPage Component ---
const UserPage = () => {

  /**
   * --- FIX #1: ROBUST TRANSFORMATION FUNCTION ---
   * This function prepares data from the API to be used in the form.
   * It is now robust and can handle both raw API data (roles as an array)
   * and data that is already in the form's state (roles as a string).
   * This prevents the role from being reset to 'customer' on every input change.
   */
  const transformDataForForm = (apiData) => {
    if (!apiData) return initialUserData;
    
    let primaryRole = 'customer'; // Sensible default

    // Case 1: The 'roles' property is already a simple string (from our form state)
    if (typeof apiData.roles === 'string' && apiData.roles) {
        primaryRole = apiData.roles;
    } 
    // Case 2: The 'roles' property is an array of objects (from the initial API fetch)
    else if (Array.isArray(apiData.roles) && apiData.roles.length > 0) {
      const adminRole = apiData.roles.find(r => r.name === 'admin');
      primaryRole = adminRole ? adminRole.name : (apiData.roles[0]?.name || 'customer');
    }

    // Return a new object with all of the user's data, but ensure 'roles' is a simple string.
    return {
      ...initialUserData,
      ...apiData,
      roles: primaryRole,
    };
  };

  /**
   * --- FIX #2: SIMPLIFIED API PREPARATION FUNCTION ---
   * This function takes the final state from the form and prepares it for the API.
   * It correctly handles passwords and guarantees the 'roles' property is an array
   * of strings, as expected by the Laravel backend.
   */
  const processDataForApi = (formData, isEditing) => {
    const processed = { ...formData };

    // If editing and the password field is empty, don't send it to the API.
    if (isEditing && !processed.password) {
        delete processed.password;
        delete processed.password_confirmation;
    }
  
    // The `formData.roles` value from our form will be a string like 'admin'.
    // The API expects an array of role names, e.g., ['admin'].
    processed.roles = [formData.roles];

    // Clean up other fields
    if (!isEditing) {
        delete processed.id;
    }
    processed.loyalty_points = parseInt(processed.loyalty_points, 10) || 0;

    console.log("Sending to API:", processed);
    return processed;
  };

  /**
   * --- FIX #3: CORRECTLY RENDER THE FORM ---
   * The function now correctly calls the robust transform function.
   * This ensures the form always displays the correct data, even during re-renders.
   */
  const renderUserModalForm = useCallback((formData, handleInputChange, modalFormErrors, isEditMode) => {
    // This transformation is now safe to call on every render.
    const formDataForFields = transformDataForForm(formData);
    
    return (
      <UserModalFormFields
        formData={formDataForFields}
        handleInputChange={handleInputChange}
        modalFormErrors={modalFormErrors}
        isEditMode={isEditMode}
      />
    );
  }, []);

  return (
    <ResourcePage
      resourceName="User"
      resourceNamePlural="Users"
      IconComponent={LuUsers}
      columns={userColumns}
      initialFormData={initialUserData}
      renderModalForm={renderUserModalForm}
      createItem={(data) => createUserAdmin(processDataForApi(data, false))}
      updateItem={(id, data) => updateUserAdmin(id, processDataForApi(data, true))}
      fetchAllItems={fetchAllUsersForAdmin}
      deleteItem={deleteUserAdmin}
      searchPlaceholder="Search by name, email, or phone..."
    />
  );
};

export default UserPage;