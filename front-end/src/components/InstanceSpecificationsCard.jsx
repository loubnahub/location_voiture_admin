// InstanceSpecificationsCard.jsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap'; // Using Card for the main container
import { 
    LuFuel, LuUsers, LuDoorOpen, LuDollarSign, LuFileText // LuFuel for Fuel, LuDoorOpen for Doors
} from 'react-icons/lu';
import { CheckSquare, XSquare } from 'lucide-react'; // Using these for In Stock? for clearer Yes/No

const InstanceSpecificationsCard = ({ model, instanceStatus }) => {
  if (!model) {
    return (
        <Card className="instance-specifications-card shadow-sm">
            <Card.Body className="text-muted">Model specifications not available.</Card.Body>
        </Card>
    );
  }

  const isInStock = instanceStatus === 'Available'; 

  const specs = [
     { 
      value: model.fuel_type || 'N/A', 
      icon: <LuFuel size={25} className="spec-icon" />, 
      key: 'fuel' 
    },
    { 
      value: model.number_of_seats || 'N/A', 
      icon: <LuUsers size={25} className="spec-icon" />, 
      key: 'seats' 
    },
    { 
      value: model.number_of_doors || 'N/A', 
      icon: <LuDoorOpen size={25} className="spec-icon" />, 
      key: 'doors' 
    },
    { 
      value: isInStock ? 'Active' : 'Not Active', 
      icon: isInStock ? <CheckSquare size={25} className="spec-icon text-success-figma" /> : <XSquare size={20} className="spec-icon text-danger-figma" />, 
      key: 'stock',
      valueClassName: isInStock ? 'text-success-figma' : 'text-danger-figma' // For styling the "Yes"/"No" text
    },
    { 
      value: model.base_price_per_day ? `${parseFloat(model.base_price_per_day).toFixed(2)} MAD` : 'N/A', 
      icon: <LuDollarSign size={25} className="spec-icon" />, 
      key: 'price' 
    },
   
    
  ];

  return (
    <Card className="instance-specifications-card h-100 d-flex flex-column"> {/* Main card styling */}
      {/* No explicit card header in Figma design for this whole block */}
      <Card.Body className="flex-grow-1">
        <Row className="g-2 mb-4"> {/* 2 columns on sm and up, 1 on xs. g-3 for gap. Increased mb */}
          {specs.map(spec => (
            <Col key={spec.key} >
              <div className="spec-chip d-flex justify-content-around align-items-center">
                 <div>{spec.icon}</div> 
                <div className={`spec-chip-value ${spec.valueClassName || ''}`}>{spec.value}</div>
                </div>
            </Col>
          ))}</Row>
       
          <Row>
        <Col><div className="spec-chip description-block"> {/* Use spec-chip style for consistency */}
          <div className="spec-chip-header">
       
          <p className="description-text mb-0 ">{model.description || 'No description available.'}</p>
           </div></div></Col> </Row>
      </Card.Body>

      <style jsx>{`
        .instance-specifications-card {
          border-radius: 16px !important; /* Figma */
          background-color: #FFFFFF !important; /* Main card background */
          border: none !important;
          box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.06) !important; /* Figma shadow */
          padding: 0.5rem; 
        }
        .instance-specifications-card .card-body {
          padding: 0.75rem; /* Adjusted padding for internal content */
        }

        .spec-chip {
          background-color: #FFFFFF;
          border: 1px solid #F0F2F5; 
          border-radius: 12px; /* Figma */
          padding: 10px 10px; /* Figma */
          text-align: left;
          height: 100%; /* For equal height in row if parent Col is d-flex */
          display: flex;
          justify-content: center;
        }
        .spec-chip-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .spec-icon {
          color: #495057; /* Darker icon color from Figma */
          margin-right: 0.6rem; /* Figma space */
        }
        .spec-chip-label {
          font-size: 0.875rem; /* Figma 14px */
          font-weight: 500; /* Medium */
          color: #212529; /* Darker label text */
        }
        .spec-chip-value {
          font-size: 0.9125rem; /* Figma 13px for value text */
          font-weight: 600; /* Regular */
          color: #6C757D; /* Muted grey for most values */
        }

        /* Specific text colors for "Yes" / "No" */
        .text-success-figma {
          color: #28A745 !important; /* Figma green for "Yes" */
        }
        .text-danger-figma {
          color: #DC3545 !important; /* Figma red for "No" */
        }
        .spec-icon.text-success-figma svg { stroke: #28A745 !important; }
        .spec-icon.text-danger-figma svg { stroke: #DC3545 !important; }


        .description-block {
          /* Reuses .spec-chip styling for consistency in look (bg, border, radius, padding) */
          margin-top: 0; /* If it's directly after a row with g-3, mb-4 on row handles spacing */
        }
        .description-text {
          font-size: 0.81rem; 
          color: #6C757D; /* Muted grey for description text */
          line-height: 1.6;
           /* Indent description text like values */
        }
      `}</style>
    </Card>
  );
};

export default InstanceSpecificationsCard;