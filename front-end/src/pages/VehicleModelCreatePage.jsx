// src/pages/admin/fleet/VehicleModelCreatePage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Card, ProgressBar } from 'react-bootstrap';
import { LuCar, LuImage } from 'react-icons/lu';
import { PlusCircle, CheckCircle } from 'lucide-react';

// Your existing, untouched components are imported
import VehicleModelEditForm from '../components/VehicleModelEditForm';
import VehicleModelMediaManager from '../components/VehicleModelMediaManager';
import { createVehicleModel } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const VehicleModelCreatePage = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // State to manage the two-stage process: 'details' or 'media'
  const [stage, setStage] = useState('details'); 
  
  // State to hold the data of the model once it's created in stage 1
  const [createdModel, setCreatedModel] = useState(null);

  const initialFormData = {
    title: '', brand: '', model_name: '', year: new Date().getFullYear(),
    fuel_type: '', transmission: '', number_of_seats: 4, number_of_doors: 4,
    base_price_per_day: '', description: '', vehicle_type_id: '',
    is_generally_available: true,
  };

  /**
   * This function is triggered by the 'Save' button in VehicleModelEditForm.
   * It creates the model and, on success, transitions the page to stage 2.
   */
  const handleCreateAndProceedToMedia = async (payloadFromForm) => {
    setIsSaving(true);
    setError(null);

    try {
      // API call to create the model with the form data
      const response = await createVehicleModel(payloadFromForm);
      
      // SUCCESS! Now, we have a model ID.
      // 1. Save the complete data of the newly created model to our state.
      setCreatedModel(response.data.data); 
      
      // 2. Change the stage to 'media' to unlock the next section.
      setStage('media');

    } catch (err) {
      console.error("Failed to create vehicle model:", err);
      let errorMessage = "An unknown error occurred.";
      if (err.response?.data?.errors) {
        errorMessage = Object.values(err.response.data.errors).flat().join(' ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * This function is called when the user is completely finished with the media manager.
   * It will be triggered by BOTH the 'Close' button AND a successful 'Submit'.
   */
  const handleFinishAndExit = () => {
    navigate('/admin/fleet/vehicle-models', {
      state: { successMessage: `Model "${createdModel.title}" and its media have been saved successfully.` }
    });
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-2">
            <PlusCircle size={32} className="me-2 text-primary" />
            <h1 className="h3 mb-0">Create New Vehicle Model</h1>
          </div>
          <ProgressBar style={{height: '6px'}}>
            <ProgressBar striped variant="success" now={stage === 'details' ? 50 : 100} key={1} />
          </ProgressBar>
          <div className="d-flex justify-content-between mt-1 small text-muted">
            <span className={stage === 'details' ? 'fw-bold text-dark' : ''}>
                <LuCar className="me-1" /> 1. Model Details
            </span>
            <span className={stage === 'media' ? 'fw-bold text-dark' : ''}>
                <LuImage className="me-1" /> 2. Media & Colors
            </span>
          </div>
        </Col>
      </Row>

      {/* --- This logic now REPLACES the content for each stage --- */}
      {stage === 'details' ? (
        // --- STAGE 1: The Details Form ---
        <Card className="shadow-sm animated-fade-in">
          <Card.Body>
            <VehicleModelEditForm
              initialFormData={initialFormData}
              initialFeatures={[]}
              initialExtras={[]}
              initialInsurancePlans={[]}
              onSave={handleCreateAndProceedToMedia}
              onCancel={() => navigate(-1)}
              isSavingParent={isSaving}
              saveErrorParent={error}
            />
          </Card.Body>
        </Card>
      ) : (
        // --- STAGE 2: The Full Media Manager ---
        createdModel && (
          <Card className="shadow-sm animated-fade-in">
            <Card.Header>
              <Alert variant="success" className="d-flex align-items-center mb-0 p-2 border-0 bg-transparent">
                  <CheckCircle className="me-2 text-success"/>
                  <div>
                    <strong className="d-block">Details Saved!</strong>
                    Now manage media for "<strong>{createdModel.title}</strong>". Click 'Submit All Changes' when done.
                  </div>
              </Alert>
            </Card.Header>
            <VehicleModelMediaManager
                vehicleModelId={createdModel.id}
                vehicleModelTitle={createdModel.title}
                onHide={handleFinishAndExit} // The "Close" button will trigger the exit.
                onMediaUpdate={handleFinishAndExit} // The "success" signal from the media manager will now also trigger the exit.
            />
          </Card>
        )
      )}
    </Container>
  );
};

export default VehicleModelCreatePage;