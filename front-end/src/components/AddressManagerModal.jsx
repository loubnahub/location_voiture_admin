// src/components/modals/AddressManagerModal.jsx (A new file)

import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import {  LuTrash2, LuPlus } from 'react-icons/lu';
import { fetchAllAddresses, createAddress, updateAddress, deleteAddress } from '../services/api';
import {Edit} from 'lucide-react'
const AddressManagerModal = ({ show, onHide, onAddressChange }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editAddress, setEditAddress] = useState(null); // The address being edited or created
  const [isSaving, setIsSaving] = useState(false);

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
      loadAddresses();
    }
  }, [show]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (editAddress.id) { // Editing existing address
        await updateAddress(editAddress.id, editAddress);
      } else { // Creating new address
        await createAddress(editAddress);
      }
      setEditAddress(null); // Close the form
      await loadAddresses(); // Reload the list
      if (onAddressChange) onAddressChange(); // Notify parent page of a change
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address? This cannot be undone.')) {
        try {
            await deleteAddress(addressId);
            await loadAddresses();
            if (onAddressChange) onAddressChange();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete address. It may be in use.');
        }
    }
  };

  const startNew = () => setEditAddress({ street_line_1: '', city: '', postal_code: '', country: 'USA' });
  const startEdit = (addr) => setEditAddress({ ...addr });
  const cancelEdit = () => setEditAddress(null);

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Manage Addresses</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        
        {editAddress ? (
          // CREATE/EDIT FORM
          <Form onSubmit={handleSave}>
            <h5 className="mb-3">{editAddress.id ? 'Edit Address' : 'Create New Address'}</h5>
            <Row>
              <Col md={12}><Form.Group className="mb-3"><Form.Label>Street</Form.Label><Form.Control type="text" value={editAddress.street_line_1} onChange={(e) => setEditAddress(p => ({ ...p, street_line_1: e.target.value }))} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control type="text" value={editAddress.city} onChange={(e) => setEditAddress(p => ({ ...p, city: e.target.value }))} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Postal Code</Form.Label><Form.Control type="text" value={editAddress.postal_code} onChange={(e) => setEditAddress(p => ({ ...p, postal_code: e.target.value }))} /></Form.Group></Col>
            </Row>
            <div className="text-end">
              <Button variant="outline-secondary" onClick={cancelEdit} className="me-2" disabled={isSaving}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSaving}>{isSaving ? <Spinner size="sm" /> : 'Save Address'}</Button>
            </div>
            <hr className="my-4"/>
          </Form>
        ) : (
          // ADD NEW BUTTON
          <div className="text-end mb-3">
            <Button variant="success" onClick={startNew}><LuPlus className="me-1 d-inline"/> Add New Address</Button>
          </div>
        )}

        {/* ADDRESS LIST */}
        {loading ? <div className="text-center"><Spinner /></div> : (
          <ListGroup>
            {addresses.map(addr => (
              <ListGroup.Item key={addr.id} className="d-flex justify-content-between align-items-center">
                <div>{addr.street_line_1}, {addr.city}, {addr.postal_code}</div>
                <div>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => startEdit(addr)}><Edit /></Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(addr.id)}><LuTrash2 /></Button>
                </div>
              </ListGroup.Item>
            ))}
            {addresses.length === 0 && <ListGroup.Item>No addresses found.</ListGroup.Item>}
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