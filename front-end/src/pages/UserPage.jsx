import React, { useState, useEffect, useCallback } from 'react';
import ResourcePage from '../components/ResourcePage'; // Adjust path if ResourcePage is in a general components folder
import {
  fetchAllUsersForAdmin, // Renamed to reflect admin context
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  fetchAvailableRoles // To populate roles dropdown
} from '../services/api'; // Adjust path
import { Form, Row, Col, Spinner, Badge, ListGroup } from 'react-bootstrap'; // Added Badge, ListGroup
import { LuUsers } from 'react-icons/lu'; // Icon for Users

// --- Columns for the User Table ---
const userColumns = [
  {
    header: 'Name',
    key: 'full_name',
    render: (item) => item.full_name || <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Email',
    key: 'email',
    render: (item) => item.email || <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Phone',
    key: 'phone',
    render: (item) => item.phone || <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Roles',
    key: 'roles', // The API response from transformUser includes a 'roles' array of objects {id, name}
    render: (item) =>
      item.roles && item.roles.length > 0
        ? item.roles.map(role => (
            <Badge pill bg="info" key={role.id} className="me-1 text-white">
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </Badge>
          ))
        : <Badge pill bg="secondary" className="text-white">No Roles</Badge>,
  },
  {
    header: 'Joined',
    key: 'created_at',
    render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
  },
  // Optional: Add columns for loyalty points, email verified, etc.
];

// --- Initial Form Data for User Modal ---
const initialUserData = {
  id: null,
  full_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  profile_picture_url: '',
  loyalty_points: 0,
  roles: [], // Will store an array of role NAMES for submission (e.g., ['admin', 'editor'])
               // Or an array of role IDs if your backend expects IDs for syncRoles.
               // Spatie's syncRoles can accept names, IDs, or Role model instances. Names are often convenient.
};

// --- Modal Form Fields Component ---
const UserModalFormFields = ({ formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData }) => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Fetch available roles for the dropdown/multi-select
  useEffect(() => {
    const loadRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await fetchAvailableRoles();
        const rolesData = response.data.data || response.data || []; // Adjust based on API response
        setAvailableRoles(Array.isArray(rolesData) ? rolesData : []);
      } catch (error) {
        console.error("UserModalFormFields: Error fetching roles:", error);
        setAvailableRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };
    loadRoles();
  }, []);

  // Handle role selection (assuming multi-select or checkboxes)
  // This example uses a multi-select approach with react-bootstrap's Form.Select multiple.
  // For checkboxes, the logic would be slightly different.
  const handleRoleChange = (event) => {
    const selectedRoleNames = Array.from(event.target.selectedOptions, option => option.value);
    // Update the formData in ResourcePage state
    // `handleInputChange` from ResourcePage might not directly support setting an array for a non-checkbox multi-select.
    // So, we use setCurrentItemData to directly update the 'roles' array in the parent's formData.
    if (setCurrentItemData) {
      setCurrentItemData(prev => ({ ...prev, roles: selectedRoleNames }));
    } else {
      // Fallback if setCurrentItemData is not passed (less ideal)
      handleInputChange({ target: { name: 'roles', value: selectedRoleNames } });
    }
     if (modalFormErrors.roles) { // Clear role-specific error on change
      handleInputChange({ target: { name: 'roles', value: selectedRoleNames, type:'custom_clear_error' } });
    }
  };


  return (
    <>
      <Form.Group className="mb-3" controlId="userFullName">
        <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="full_name"
          value={formData.full_name || ''}
          onChange={handleInputChange}
          required
          isInvalid={!!modalFormErrors?.full_name}
        />
        <Form.Control.Feedback type="invalid">{modalFormErrors?.full_name?.join(', ')}</Form.Control.Feedback>
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              required
              isInvalid={!!modalFormErrors?.email}
            />
            <Form.Control.Feedback type="invalid">{modalFormErrors?.email?.join(', ')}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="userPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              isInvalid={!!modalFormErrors?.phone}
            />
            <Form.Control.Feedback type="invalid">{modalFormErrors?.phone?.join(', ')}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="userPassword">
            <Form.Label>{isEditMode ? 'New Password (Optional)' : 'Password'} <span className="text-danger">{!isEditMode ? '*' : ''}</span></Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleInputChange}
              required={!isEditMode} // Required only on create
              isInvalid={!!modalFormErrors?.password}
              placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
            />
            <Form.Control.Feedback type="invalid">{modalFormErrors?.password?.join(', ')}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="userPasswordConfirmation">
            <Form.Label>{isEditMode ? 'Confirm New Password' : 'Confirm Password'} <span className="text-danger">{!isEditMode || formData.password ? '*' : ''}</span></Form.Label>
            <Form.Control
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation || ''}
              onChange={handleInputChange}
              required={!isEditMode || !!formData.password} // Required if creating or if new password is typed
              isInvalid={!!modalFormErrors?.password_confirmation}
              placeholder={isEditMode ? "Confirm new password if changing" : "Confirm password"}
            />
            <Form.Control.Feedback type="invalid">{modalFormErrors?.password_confirmation?.join(', ')}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="userRoles">
        <Form.Label>Roles</Form.Label>
        {loadingRoles ? <Spinner animation="border" size="sm" /> : (
          <Form.Select
            multiple // Allows multiple selections
            name="roles" // This name might not be directly used by handleInputChange if using setCurrentItemData
            value={formData.roles || []} // formData.roles should be an array of selected role names (or IDs)
            onChange={handleRoleChange} // Custom handler for multi-select
            isInvalid={!!modalFormErrors?.roles || !!modalFormErrors?.['roles.*']}
            htmlSize={Math.min(5, availableRoles.length + 1)} // Show a few roles at a time
          >
            {/* <option value="" disabled>Select Roles...</option> Not typical for multi-select */}
            {availableRoles.map(role => (
              // Ensure your backend expects role names for syncRoles. If it expects IDs, value should be role.id
              <option key={role.id} value={role.name}>
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
              </option>
            ))}
          </Form.Select>
        )}
        <Form.Control.Feedback type="invalid">
            {modalFormErrors?.roles?.join(', ') || modalFormErrors?.['roles.*']?.join(', ')}
        </Form.Control.Feedback>
         <Form.Text className="text-muted">
            Hold Ctrl (or Cmd on Mac) to select multiple roles.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="userProfilePictureUrl">
        <Form.Label>Profile Picture URL</Form.Label>
        <Form.Control
          type="url"
          name="profile_picture_url"
          value={formData.profile_picture_url || ''}
          onChange={handleInputChange}
          placeholder="https://example.com/image.png"
          isInvalid={!!modalFormErrors?.profile_picture_url}
        />
        <Form.Control.Feedback type="invalid">{modalFormErrors?.profile_picture_url?.join(', ')}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="userLoyaltyPoints">
        <Form.Label>Loyalty Points</Form.Label>
        <Form.Control
          type="number"
          name="loyalty_points"
          value={formData.loyalty_points || 0}
          onChange={handleInputChange}
          min="0"
          isInvalid={!!modalFormErrors?.loyalty_points}
        />
        <Form.Control.Feedback type="invalid">{modalFormErrors?.loyalty_points?.join(', ')}</Form.Control.Feedback>
      </Form.Group>
    </>
  );
};


// --- Main UserPage Component ---
const UserPage = () => {
  // Prepares data before sending to API (e.g., handle password, roles)
  const processUserFormData = useCallback((data, isEditing) => {
    const processed = { ...data };

    // Handle password: only send if provided (for create or if changing on edit)
    if (!isEditing && !processed.password) {
      // This case should ideally be caught by 'required' validation on create
      // but as a safeguard, could remove or error. For now, assume validation catches.
    } else if (processed.password === '') { // If password field was touched and then cleared for update
        delete processed.password;
        delete processed.password_confirmation;
    } else if (!processed.password && isEditing) { // If editing and password field is empty, don't send it
        delete processed.password;
        delete processed.password_confirmation;
    }
    // If password is provided, password_confirmation is expected by backend validation.

    // Ensure 'roles' is an array of role names (or IDs if backend expects that)
    // formData.roles should already be an array of strings from the multi-select
    if (!Array.isArray(processed.roles)) {
        processed.roles = [];
    }

    // Remove id for create operations if it's null
    if (!isEditing && (processed.id === null || processed.id === undefined)) {
        delete processed.id;
    }


    // Convert loyalty_points to number
    if (processed.loyalty_points !== undefined && processed.loyalty_points !== null) {
        processed.loyalty_points = parseInt(processed.loyalty_points, 10);
        if (isNaN(processed.loyalty_points)) {
            processed.loyalty_points = 0; // Default or handle error
        }
    } else {
        processed.loyalty_points = 0; // Default if not provided
    }


    console.log("UserPage: Processed user data for API:", JSON.stringify(processed, null, 2));
    return processed;
  }, []);

  const renderUserModalForm = useCallback((formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData) => {
    // When editing, formData from ResourcePage (currentItemData) should already include 'roles' as an array of names
    // if transformUser in the controller sends 'role_names'.
    // Let's ensure initialUserData also aligns with this if using role_names for selection.
    // The 'roles' field in formData for the multi-select value prop should be an array of selected role *names*.
    const formDataForForm = {
        ...formData,
        roles: Array.isArray(formData.roles) // from API it's array of objects {id, name}
               ? formData.roles.map(role => typeof role === 'object' ? role.name : role) // map to names
               : (Array.isArray(formData.role_names) ? formData.role_names : []) // fallback to role_names if available
    };

    return (
      <UserModalFormFields
        formData={formDataForForm}
        handleInputChange={handleInputChange}
        modalFormErrors={modalFormErrors}
        isEditMode={isEditMode}
        setCurrentItemData={setCurrentItemData} // Pass this for role handling
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
      fetchAllItems={fetchAllUsersForAdmin} // Use the admin-specific fetch
      createItem={(data) => createUserAdmin(processUserFormData(data, false))}
      updateItem={(id, data) => updateUserAdmin(id, processUserFormData(data, true))}
      deleteItem={deleteUserAdmin}
      searchPlaceholder="Search by name, email, or phone..."
      // itemsPerPage={10} // Optional
    />
  );
};

export default UserPage;