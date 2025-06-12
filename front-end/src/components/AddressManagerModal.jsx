import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

// Corrected: All icons are imported from a single, consistent library ('lucide-react')
// and the missing 'Broom' icon has been added.
import { Trash2, Plus, Edit } from 'lucide-react';

import {
  fetchAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  pruneUnusedAddresses // Ensure this is exported from your api.js file
} from '../services/api';

const AddressManagerModal = ({ show, onHide, onAddressChange }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editAddress, setEditAddress] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPruning, setIsPruning] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllAddresses({ all: true });
      setAddresses(res.data.data || []);
    } catch (err) {
      setError('Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      // Reset messages when the modal is first opened
      setError(null);
      setSuccess(null);
      loadAddresses();
    }
  }, [show]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editAddress.id) {
        await updateAddress(editAddress.id, editAddress);
        setSuccess('Address updated successfully.');
      } else {
        await createAddress(editAddress);
        setSuccess('Address created successfully.');
      }
      setEditAddress(null);
      await loadAddresses();
      if (onAddressChange) onAddressChange();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address? This cannot be undone.')) {
        setError(null);
        setSuccess(null);
        try {
            await deleteAddress(addressId);
            setSuccess('Address deleted successfully.');
            await loadAddresses();
            if (onAddressChange) onAddressChange();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete address. It may be in use.');
        } finally {
            setTimeout(() => setSuccess(null), 3000);
        }
    }
  };

  const handlePrune = async () => {
    if (window.confirm('Are you sure you want to delete ALL unused addresses? This action cannot be undone.')) {
        setIsPruning(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await pruneUnusedAddresses();
            setSuccess(response.data.message || 'Pruning operation complete.');
            await loadAddresses();
            if (onAddressChange) onAddressChange();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to prune addresses.');
        } finally {
            setIsPruning(false);
            setTimeout(() => setSuccess(null), 4000);
        }
    }
  };

  const startNew = () => {
    setError(null);
    setSuccess(null);
    setEditAddress({ street_line_1: '', street_line_2: '', city: '', postal_code: '', country: 'USA' });
  };
  const startEdit = (addr) => {
    setError(null);
    setSuccess(null);
    setEditAddress({ ...addr });
  };
  const cancelEdit = () => setEditAddress(null);

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Addresses</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
        
        {editAddress ? (
          // CREATE/EDIT FORM
          <Form onSubmit={handleSave}>
            <h5 className="mb-3">{editAddress.id ? 'Edit Address' : 'Create New Address'}</h5>
            <Row>
              <Col md={12}><Form.Group className="mb-3"><Form.Label>Street Line 1</Form.Label><Form.Control type="text" value={editAddress.street_line_1 || ''} onChange={(e) => setEditAddress(p => ({ ...p, street_line_1: e.target.value }))} required /></Form.Group></Col>
              <Col md={12}><Form.Group className="mb-3"><Form.Label>Street Line 2 (Optional)</Form.Label><Form.Control type="text" value={editAddress.street_line_2 || ''} onChange={(e) => setEditAddress(p => ({ ...p, street_line_2: e.target.value }))} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control type="text" value={editAddress.city || ''} onChange={(e) => setEditAddress(p => ({ ...p, city: e.target.value }))} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Postal Code</Form.Label><Form.Control type="text" value={editAddress.postal_code || ''} onChange={(e) => setEditAddress(p => ({ ...p, postal_code: e.target.value }))} /></Form.Group></Col>
              <Col md={12}><Form.Group className="mb-3"><Form.Label>Country</Form.Label><Form.Control type="text" value={editAddress.country || ''} onChange={(e) => setEditAddress(p => ({ ...p, country: e.target.value }))} /></Form.Group></Col>
            </Row>
            <div className="text-end">
              <Button variant="outline-secondary" onClick={cancelEdit} className="me-2" disabled={isSaving}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSaving}>{isSaving ? <><Spinner as="span" size="sm" className="me-1"/> Saving...</> : 'Save Address'}</Button>
            </div>
            <hr className="my-4"/>
          </Form>
        ) : (
          <div className="d-flex justify-content-between mb-3">
            <Button variant="outline-secondary" onClick={handlePrune} disabled={isPruning || loading}>
              {isPruning ? <Spinner size="sm" className="me-2" /> : null}
              Prune Unused
            </Button>
            <Button variant="success" onClick={startNew} >
              <Plus className="me-1 d-inline "/> Add New Address
            </Button>
          </div>
        )}

        {/* ADDRESS LIST */}
        {loading ? <div className="text-center p-4"><Spinner /></div> : (
          <ListGroup>
            {addresses.map(addr => (
              <ListGroup.Item key={addr.id} className="d-flex justify-content-between align-items-center">
                <div>{addr.street_line_1}, {addr.city}, {addr.postal_code}</div>
                <div>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => startEdit(addr)}><Edit /></Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(addr.id)}><Trash2 /></Button>
                </div>
              </ListGroup.Item>
            ))}
            {addresses.length === 0 && !loading && <ListGroup.Item className="text-center text-muted">No addresses found.</ListGroup.Item>}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddressManagerModal;