import React from 'react';
import { Table, Button, Spinner } from 'react-bootstrap'; // Using Spinner for loading state
import {  LuTrash2, LuEye } from 'react-icons/lu'; // Default action icons
import './DynamicTable.css'; // Ensure this CSS file is created and contains the styles
import { Edit } from 'lucide-react'; // Using Edit from lucide-react as before

const DynamicTable = ({
  columns,                // Array: [{ key, header, render?, className?, textAlign?, headerStyle?, cellStyle? }]
  items,                  // Array: Data objects to display
  loading,                // Boolean: True if data is currently being fetched
  noDataMessage = "No data available to display.", // String: Message for empty items array
  actions,                // Object: { onEdit?: (item) => void, onDelete?: (itemId) => void, onView?: (item) => void, custom?: [{ icon, handler, title, className }] }
  getKey = (item) => item.id, // Function: To get a unique key for each row
  tableClassName = "",    // String: Additional class for the <Table> element
  wrapperClassName = "",  // String: Additional class for the main wrapper div of the table
}) => {

  if (loading) {
    return (
      <div className={`dynamic-table-message text-center p-5 ${wrapperClassName}`}>
        <Spinner animation="border" role="status" size="sm" className="me-2">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        Loading data...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={`dynamic-table-message no-data-card-look ${wrapperClassName}`}> {/* Uses card look for no data */}
        {noDataMessage}
      </div>
    );
  }

  return (
    // This wrapper gets the main card styling (white bg, shadow, rounded corners) from DynamicTable.css
    <div className={`table-wrapper-figma-style ${wrapperClassName}`}>
      <Table responsive="sm" className={`data-table-figma-style ${tableClassName}`}>
        <thead className="table-header-figma-style">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.header} // Use col.key if available, otherwise header as key
                className={`${col.className || ''} ${col.textAlign ? `text-${col.textAlign}` : 'text-left'}`}
                style={col.headerStyle || {}} // Allow inline styles for header cell if needed
              >
                {col.header}
              </th>
            ))}
            {actions && Object.keys(actions).length > 0 && ( // Render Actions header only if actions are provided
              <th className="text-end">Actions</th> // Actions header always right-aligned
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={getKey(item)}>
              {columns.map((col) => (
                <td
                  key={`${getKey(item)}-${col.key || col.header}`}
                  className={`${col.className || ''} ${col.textAlign ? `text-${col.textAlign}` : ''}`}
                  style={col.cellStyle ? col.cellStyle(item) : {}} // Allow dynamic inline styles for data cell
                >
                  {col.render
                    ? col.render(item, item[col.key]) // Pass item and specific value to render function
                    : (item[col.key] === null || item[col.key] === undefined
                        ? <span className="text-muted-custom">N/A</span> // Consistent N/A styling
                        : String(item[col.key])) // Default rendering: convert value to string
                  }
                </td>
              ))}
              {actions && Object.keys(actions).length > 0 && (
                <td className="text-end actions-cell-figma"> {/* Class for styling the actions cell */}
                  {actions.onView && (
                    <Button
                      variant="link"
                      onClick={() => actions.onView(item)}
                      className="action-button-table-figma view"
                      title="View"
                      aria-label={`View ${item.name || item.title || 'details for item ' + getKey(item)}`}
                    >
                      <LuEye size={18} />
                    </Button>
                  )}
                  {actions.onEdit && (
                    <Button
                      variant="link"
                      onClick={() => actions.onEdit(item)}
                      className="action-button-table-figma edit"
                      title="Edit"
                      aria-label={`Edit ${item.name || item.title || 'item ' + getKey(item)}`}
                    >
                      <Edit size={18} />
                    </Button>
                  )}
                  {actions.onDelete && (
                    <Button
                      variant="link"
                      onClick={() => actions.onDelete(item)} // Pass ID to delete handler
                      className="action-button-table-figma delete"
                      title="Delete"
                      aria-label={`Delete ${item.name || item.title || 'item ' + getKey(item)}`}
                    >
                      <LuTrash2 size={18} />
                    </Button>
                  )}
                  {/* Render custom actions if provided */}
                  {actions.custom && Array.isArray(actions.custom) && actions.custom.map((customAction, index) => (
                    customAction.icon && customAction.handler && ( // Ensure icon and handler exist
                        <Button
                            key={`custom-action-${getKey(item)}-${index}`}
                            variant="link"
                            onClick={() => customAction.handler(item)}
                            className={`action-button-table-figma ${customAction.className || ''}`}
                            title={customAction.title || 'Custom Action'}
                            aria-label={customAction.title || 'Custom Action'}
                        >
                            {customAction.icon}
                        </Button>
                    )
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DynamicTable;