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
  { header: 'Name', key: 'full_name', render: (item) => item.full_name || 'N/A' },
  { header: 'Email', key: 'email', render: (item) => item.email || 'N/A' },
  { header: 'Phone', key: 'phone', render: (item) => item.phone || 'N/A' },
  {
    header: 'Role',
    key: 'roles', // Your API data provides the 'roles' array
    render: (item) => {
      // Safely get the role name from the nested structure
      const roleName = (Array.isArray(item.roles) && item.roles[0]?.name) || 'customer';
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
  password: '', password_confirmation: '',
  loyalty_points: 0, 
  roles: 'customer', // The form starts with the role as a simple string
};

// --- Modal Form Fields Component (UNCHANGED, AS YOU REQUESTED) ---
const UserModalFormFields = ({ formData, handleInputChange, modalFormErrors, isEditMode }) => {
  const availableRoles = [
    { name: 'customer', label: 'Customer' },
    { name: 'admin', label: 'Admin' },
  ];

  return (
    <Tabs defaultActiveKey="details" id="user-modal-tabs" className="mb-3" unmountOnExit>
      <Tab eventKey="details" title="User Details">
        <Form.Group className="mb-3" controlId="userFullName"><Form.Label>Full Name <span className="text-danger">*</span></Form.Label><Form.Control type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.full_name} /><Form.Control.Feedback type="invalid">{modalFormErrors?.full_name?.join(', ')}</Form.Control.Feedback></Form.Group><Row><Col md={6}><Form.Group className="mb-3" controlId="userEmail"><Form.Label>Email <span className="text-danger">*</span></Form.Label><Form.Control type="email" name="email" value={formData.email || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.email} /><Form.Control.Feedback type="invalid">{modalFormErrors?.email?.join(', ')}</Form.Control.Feedback></Form.Group></Col><Col md={6}><Form.Group className="mb-3" controlId="userPhone"><Form.Label>Phone</Form.Label><Form.Control type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors?.phone} /><Form.Control.Feedback type="invalid">{modalFormErrors?.phone?.join(', ')}</Form.Control.Feedback></Form.Group></Col></Row><Row><Col md={6}><Form.Group className="mb-3" controlId="userPassword"><Form.Label>{isEditMode ? 'New Password (Optional)' : 'Password'} <span className="text-danger">{!isEditMode ? '*' : ''}</span></Form.Label><Form.Control type="password" name="password" value={formData.password || ''} onChange={handleInputChange} required={!isEditMode} isInvalid={!!modalFormErrors?.password} placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"} /><Form.Control.Feedback type="invalid">{modalFormErrors?.password?.join(', ')}</Form.Control.Feedback></Form.Group></Col><Col md={6}><Form.Group className="mb-3" controlId="userPasswordConfirmation"><Form.Label>{isEditMode ? 'Confirm New Password' : 'Confirm Password'} <span className="text-danger">{!isEditMode || formData.password ? '*' : ''}</span></Form.Label><Form.Control type="password" name="password_confirmation" value={formData.password_confirmation || ''} onChange={handleInputChange} required={!isEditMode || !!formData.password} isInvalid={!!modalFormErrors?.password_confirmation} placeholder={isEditMode ? "Confirm if changing" : "Confirm password"} /><Form.Control.Feedback type="invalid">{modalFormErrors?.password_confirmation?.join(', ')}</Form.Control.Feedback></Form.Group></Col></Row>
        
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
        
        <Form.Group className="mb-3" controlId="userLoyaltyPoints"><Form.Label>Loyalty Points</Form.Label><Form.Control type="number" name="loyalty_points" value={formData.loyalty_points || 0} onChange={handleInputChange} min="0" isInvalid={!!modalFormErrors?.loyalty_points} /><Form.Control.Feedback type="invalid">{modalFormErrors?.loyalty_points?.join(', ')}</Form.Control.Feedback></Form.Group>
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
   * --- FIX #1: PREPARE DATA FOR THE API ---
   * This function takes the final form state and prepares it for submission.
   * It ensures the `roles` property is always an array of strings, as required by Laravel.
   */
  const processDataForApi = (formData, isEditing) => {
    const processed = { ...formData };

    if (isEditing && !processed.password) {
        delete processed.password;
        delete processed.password_confirmation;
    }
    
    // The `formData.roles` value from the form will be a simple string (e.g., 'admin').
    // We wrap it in an array to match the backend's expectation.
    if (typeof processed.roles === 'string') {
        processed.roles = [processed.roles];
    } else {
        // Fallback for safety, though it shouldn't be needed.
        processed.roles = ['customer'];
    }

    if (!isEditing) {
        delete processed.id;
    }
    processed.loyalty_points = parseInt(processed.loyalty_points, 10) || 0;
    
    return processed;
  };
  
  /**
   * --- FIX #2: PREPARE DATA FOR DISPLAY ---
   * This function is called just before rendering the form. It takes the state
   * from ResourcePage and ensures the `roles` property is a simple string
   * that the <Form.Select> component can understand.
   */
  const renderUserModalForm = useCallback((formData, handleInputChange, modalFormErrors, isEditMode) => {
    // Create a new object to avoid directly mutating the state from ResourcePage.
    const formDataForDisplay = { ...formData };

    // The API sends roles as an array of objects, e.g., [{ name: 'admin' }].
    // We need to convert it to a simple string, 'admin', for the dropdown.
    if (Array.isArray(formDataForDisplay.roles) && formDataForDisplay.roles.length > 0) {
        // Safely access the name property from the first object in the array.
        formDataForDisplay.roles = formDataForDisplay.roles[0]?.name || 'customer';
    }

    // Now, formDataForDisplay.roles is guaranteed to be a string ('admin' or 'customer').
    return (
      <UserModalFormFields
        formData={formDataForDisplay} // Pass the transformed data to the form
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