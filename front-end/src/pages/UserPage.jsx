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

// --- Columns for the User Table ---
const userColumns = [
  { header: 'Name', key: 'full_name', render: (item) => item.full_name || <span className="text-muted-custom">N/A</span> },
  { header: 'Email', key: 'email', render: (item) => item.email || <span className="text-muted-custom">N/A</span> },
  { header: 'Phone', key: 'phone', render: (item) => item.phone || <span className="text-muted-custom">N/A</span> },
  {
    header: 'Role',
    key: 'roles',
    render: (item) => {
      const roleName = Array.isArray(item.roles) && item.roles.length > 0 
        ? (item.roles.find(r => r.name === 'admin')?.name || item.roles[0]?.name || 'customer')
        : 'customer';
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

// --- Initial Form Data ---
const initialUserData = {
  id: null, full_name: '', email: '', phone: '',
  password: '', password_confirmation: '', profile_picture_url: '',
  loyalty_points: 0, 
  roles: 'customer',
};

// --- Modal Form Fields Component ---
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

  const transformDataForForm = (apiData) => {
    if (!apiData) return initialUserData;
    
    let primaryRole = 'customer';
    if (Array.isArray(apiData.roles) && apiData.roles.length > 0) {
      const adminRole = apiData.roles.find(r => r.name === 'admin');
      primaryRole = adminRole ? adminRole.name : (apiData.roles[0]?.name || 'customer');
    }

    return {
      ...initialUserData,
      ...apiData,
      roles: primaryRole
    };
  };

  /**
   * This is the DEFINITIVELY FIXED function.
   */
  const processDataForApi = (formData, isEditing) => {
    const processed = { ...formData };

    if (isEditing && !processed.password) {
        delete processed.password;
        delete processed.password_confirmation;
    }
  
    // --- FOOLPROOF ROLE PROCESSING ---
    let roleToSend = 'customer'; // Start with a safe default

    // Check if formData.roles is a string (from our form state)
    if (typeof formData.roles === 'string' && formData.roles) {
      roleToSend = formData.roles;
    } 
    // Check if it's an array of objects (from raw API data, the edge case)
    else if (Array.isArray(formData.roles) && formData.roles.length > 0) {
      const adminRole = formData.roles.find(r => r.name === 'admin');
      roleToSend = adminRole ? adminRole.name : (formData.roles[0]?.name || 'customer');
    }
    
    // Now, GUARANTEE the output format is an array with one valid string
    processed.roles = [roleToSend];
    // --- END OF FOOLPROOF LOGIC ---

    if (!isEditing) {
        delete processed.id;
    }

    processed.loyalty_points = parseInt(processed.loyalty_points, 10) || 0;

    console.log("UserPage: Final, GUARANTEED processed data for API:", JSON.stringify(processed, null, 2));
    return processed;
  };

  const renderUserModalForm = useCallback((formData, handleInputChange, modalFormErrors, isEditMode) => {
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