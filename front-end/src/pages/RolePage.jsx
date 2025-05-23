import React, { useCallback } from 'react';
import ResourcePage from '../components/ResourcePage'; // Adjust path to your ResourcePage
import {
  fetchAllRolesAdmin,   // API function to get all roles
  createRoleAdmin,      // API function to create a role
  updateRoleAdmin,      // API function to update a role
  deleteRoleAdmin       // API function to delete a role
} from '../services/api';     // Adjust path to your API service
import { Form, InputGroup } from 'react-bootstrap';
import { Users2 } from 'lucide-react'; // Example icon for "Extras" (a plus in a square)

// 1. Define Columns for the DynamicTable (specific to Roles)
const roleColumns = [
  {
    header: 'ID', // Spatie roles usually have integer IDs
    key: 'id',
    // render: (item) => item.id, // No special rendering needed if it's just the number
  },
  {
    header: 'Role Name',
    key: 'name',
    render: (item) => item.name ? (item.name.charAt(0).toUpperCase() + item.name.slice(1)) : 'N/A',
  },
  {
    header: 'Guard Name',
    key: 'guard_name',
  },
  {
    header: 'Created At',
    key: 'created_at',
    render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
  },
  // Optional: Add a column for permissions count or assigned users count later
  // {
  //   header: 'Permissions',
  //   key: 'permissions_count',
  //   textAlign: 'center',
  //   render: (item) => item.permissions_count !== undefined ? item.permissions_count : 'N/A',
  // },
];

// 2. Define the initial (empty) state for the form data used in the create/edit modal
const initialRoleData = {
  id: null,
  name: '',
  guard_name: 'web', // Default guard name, can be an input if you manage multiple guards
  // permissions: [], // For assigning permissions later
};

// 3. Define a function that renders the actual form fields inside the modal
const renderRoleModalForm = (formData, handleInputChange, modalFormErrors, isEditMode) => (
  <>
    <Form.Group className="mb-3" controlId="roleName">
      <Form.Label>Role Name <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="name"
        value={formData.name || ''}
        onChange={handleInputChange}
        required
        maxLength={125} // Spatie's default max length
        placeholder="e.g., editor, moderator, support-agent"
        isInvalid={!!modalFormErrors?.name}
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.name?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="roleGuardName">
      <Form.Label>Guard Name</Form.Label>
      <Form.Control
        type="text"
        name="guard_name"
        value={formData.guard_name || 'web'}
        onChange={handleInputChange}
        maxLength={125}
        placeholder="Default: web"
        isInvalid={!!modalFormErrors?.guard_name}
        // disabled={isEditMode} // Typically, guard_name is not changed after creation
                                // If you want to allow it, remove disabled and ensure backend handles it
      />
      <Form.Text className="text-muted">
        Usually 'web' for web applications, or 'api' for API guards. Typically not changed after creation.
      </Form.Text>
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.guard_name?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>

    {/*
    // Placeholder for permissions assignment (more complex UI needed, e.g., multi-select or checkboxes)
    isEditMode && ( // Or always show if creating roles with permissions
        <Form.Group className="mb-3" controlId="rolePermissions">
            <Form.Label>Permissions</Form.Label>
            <div className="p-2 border rounded">
                <p className="text-muted small">Permissions assignment UI will go here.</p>
                { modalFormErrors?.permissions && <div className="text-danger small">{modalFormErrors.permissions.join(', ')}</div> }
            </div>
        </Form.Group>
    )
    */}
  </>
);

// The main page component for Roles
const RolePage = () => {
  // No special data processing needed before sending to API for basic role fields
  // If permissions were involved, processFormData would handle that array.
  const processRoleFormData = useCallback((data, isEditing) => {
    const processed = { ...data };
    // Ensure guard_name is set if not provided by form but is in initial data
    if (!processed.guard_name && initialRoleData.guard_name) {
        processed.guard_name = initialRoleData.guard_name;
    }
    if (isEditing) {
        // For Spatie, when updating, you usually only send fields you want to change.
        // If guard_name is not meant to be editable via this form, don't send it.
        // However, our controller's update method is set to 'sometimes' for guard_name.
        // If name is present, and guard_name is not, it keeps existing.
        // If guard_name is explicitly sent (even if same as before), it uses it.
    }
    return processed;
  }, []);

  return (
    <ResourcePage
      // --- Configuration Props ---
      resourceName="Role"
      resourceNamePlural="User Roles"
      IconComponent={Users2}
      columns={roleColumns}
      initialFormData={initialRoleData}
      renderModalForm={renderRoleModalForm}

      // --- API Function Props ---
      fetchAllItems={fetchAllRolesAdmin}
      createItem={(data) => createRoleAdmin(processRoleFormData(data, false))}
      updateItem={(id, data) => updateRoleAdmin(id, processRoleFormData(data, true))}
      deleteItem={deleteRoleAdmin}

      // --- Optional Customization ---
      searchPlaceholder="Search by role name..."
      // itemsPerPage={10} // Optional
      // tableActionsConfig={{ onView: (item) => console.log("View role:", item) }} // Example for a view action
    />
  );
};

export default RolePage;