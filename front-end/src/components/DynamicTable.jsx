import React from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { LuTrash2, LuEye } from 'react-icons/lu'; // Default action icons
import { Edit } from 'lucide-react'; // Using Edit from lucide-react
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first
import './DynamicTable.css'; // Ensure this CSS file is created

const DynamicTable = ({
  columns,
  items,
  loading,
  noDataMessage = "No data available to display.",
  actions, // Expected: { onEdit?, onDelete?, onView?, custom?: [{ icon, handler, title, className, shouldShow?, disabled? }] }
  getKey = (item) => item.id,
  tableClassName = "",
  wrapperClassName = "",
  _resourceNameForDebug, // For more specific debugging logs
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
      <div className={`dynamic-table-message no-data-card-look ${wrapperClassName}`}>
        {noDataMessage}
      </div>
    );
  }

  // Determine if there are any actions to display at all
  const hasAnyActions = actions && 
                        (actions.onView || actions.onEdit || actions.onDelete || (actions.custom && actions.custom.length > 0));

  return (
    <div className={`table-wrapper-figma-style ${wrapperClassName}`}>
      <Table responsive="sm" className={`data-table-figma-style ${tableClassName}`}>
        <thead className="table-header-figma-style">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.header}
                className={`${col.className || ''} ${col.textAlign ? `text-${col.textAlign}` : 'text-left'}`}
                style={col.headerStyle || {}}
              >
                {col.header}
              </th>
            ))}
            {hasAnyActions && (
              <th className="text-center">Actions</th>
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
                  style={col.cellStyle ? col.cellStyle(item) : {}}
                >
                  {col.render
                    ? col.render(item, item[col.key])
                    : (item[col.key] === null || item[col.key] === undefined
                        ? <span className="text-muted-custom">N/A</span>
                        : String(item[col.key]))
                  }
                </td>
              ))}

              {hasAnyActions && (
                <td className="text-end actions-cell-figma">
                  {/* Default Actions - these don't have shouldShow from ResourcePage's perspective */}
                  {actions.onView && (
                    <Button variant="link" onClick={() => actions.onView(item)} className="action-button-table-figma view" title="View">
                      <LuEye size={18} />
                    </Button>
                  )}
                  {actions.onEdit && (
                    <Button variant="link" onClick={() => actions.onEdit(item)} className="action-button-table-figma edit" title="Edit">
                      <Edit size={18} />
                    </Button>
                  )}
                  {actions.onDelete && (
                    <Button variant="link" onClick={() => actions.onDelete(item)} className="action-button-table-figma delete" title="Delete">
                      <LuTrash2 size={18} />
                    </Button>
                  )}

                  {/* Render custom actions from actions.custom array */}
                  {actions.custom && Array.isArray(actions.custom) && actions.custom.map((customAction, index) => {
                    // Log that we are about to evaluate this custom action
                    // console.log(`DynamicTable (${_resourceNameForDebug || 'Table'}): Evaluating custom action '${customAction.title}' for item ID ${getKey(item)}.`);

                    // Determine if this custom action should be shown for the current item
                    const showThisCustomAction = typeof customAction.shouldShow === 'function'
                                              ? customAction.shouldShow(item) // Call the shouldShow function from the action config
                                              : true; // Default to true if no shouldShow is provided for a custom action

                    // Log the result of the shouldShow evaluation
                    // This log is crucial for debugging your "Send to Client" button visibility
                    if (typeof customAction.shouldShow === 'function') { // Only log if shouldShow was actually a function
                        console.log(
                            `DynamicTable (${_resourceNameForDebug || 'Table'}): Custom Action: '${customAction.title}' (Item ID: ${getKey(item)})`,
                            `\n  - shouldShow() was called and returned: ${showThisCustomAction}`
                            // `\n  - Item data passed to shouldShow:`, JSON.parse(JSON.stringify(item)) // Avoid circular issues if item is complex
                        );
                    }


                    if (showThisCustomAction && customAction.handler) { // Ensure handler also exists
                      return (
                        <Button
                            key={`custom-action-${getKey(item)}-${index}`}
                            variant="link" // Consider customAction.variant if needed
                            onClick={() => customAction.handler(item)}
                            className={`action-button-table-figma ${customAction.className || ''}`}
                            title={customAction.title || 'Custom Action'}
                            aria-label={customAction.title || `Custom action for ${getKey(item)}`}
                            disabled={typeof customAction.disabled === 'function' ? customAction.disabled(item) : customAction.disabled || false}
                        >
                            {/* Support icon as a function or a direct node */}
                            {typeof customAction.icon === 'function' ? customAction.icon(item) : customAction.icon || customAction.title}
                        </Button>
                      );
                    }
                    return null; // Don't render if shouldShow is false or handler/icon missing
                  })}
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