import React from 'react';
import { LuChevronDown } from 'react-icons/lu'; // For a simple list, not full accordion yet
import './FeatureList.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const FeatureList = ({ featuresGrouped }) => {
  if (!featuresGrouped || featuresGrouped.length === 0) {
    return <p className="no-items-text">No features listed for this model.</p>;
  }

  // For now, a simple list. Accordion logic would make this more complex.
  return (
    <div className="feature-list-container">
      {featuresGrouped.map((group, groupIndex) => (
        <div key={group.category_name || groupIndex} className="feature-group-figma">
          {/* Display category name if multiple groups or always for clarity */}
          { (featuresGrouped.length > 1 || group.category_name) &&
            <h6 className="feature-category-title-figma">{group.category_name || 'Features'}</h6>
          }
          {group.items.map(feature => (
            <div key={feature.id} className="feature-item-figma">
              <span className="feature-name-figma">{feature.name}</span>
              {/* Optional: feature.description can be shown on hover/tooltip or if design allows */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FeatureList;