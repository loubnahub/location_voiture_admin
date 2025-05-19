import React from 'react';
import { LuEye, LuTrash2 } from 'react-icons/lu'; // Assuming LuEye and LuTrash2 are correct
import { Edit } from 'lucide-react'; // Using Edit from lucide-react as before
import './VehicleModelTable.css'; // We will create/update this CSS file next
import { useNavigate } from 'react-router-dom';

const VehicleModelTable = ({ models, loading }) => {
  // Handle loading state passed from parent
  const navigate=useNavigate()
  if (loading) {
    return (
      <div className="loading-message-card"> {/* Consistent card style for messages */}
        Loading vehicle models...
      </div>
    );
  }

  // Handle no data state
  if (!models || models.length === 0) {
    return (
      <div className="no-data-card">
        No vehicle models to display.
      </div>
    );
  }

  return (
    <div className="vehicle-model-list-container">
      {/* Table Header Card: Styled as a distinct card */}
      <div className="list-header-card">
        <div className="header-item flex-col-id">Model ID</div>
        <div className="header-item flex-col-title">Title</div>
        <div className="header-item flex-col-actions text-right">Actions</div>
      </div>

      {/* Data Rows as Cards: Iterating through models */}
      {models.map((model) => (
        // Each model is rendered as a "list-row-card".
        // The CSS will use :nth-child to alternate styles for these cards.
        <div key={model.id} className="list-row-card">
          <div className="row-item flex-col-id">
            {model.id ? model.id: 'N/A'}
          </div>
          <div className="row-item flex-col-title data-title"> {/* Added data-title for specific styling */}
            {model.title}
          </div>
          <div className="row-item flex-col-actions text-right actions-cell">
            <button className="action-button-figma view"  onClick={() => navigate(`/fleet/vehicle-models/${model.id}`)} title="View">
              <LuEye size={18} />
            </button>
            <button className="action-button-figma edit" title="Edit">
              <Edit size={18} />
            </button>
            <button className="action-button-figma delete" title="Delete">
              <LuTrash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleModelTable;