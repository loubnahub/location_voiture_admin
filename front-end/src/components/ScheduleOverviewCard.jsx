// ScheduleOverviewCard.jsx
import React, { useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const eventColors = { 
  primaryBooking: '#0D6EFD',    // Standard Booking
  maintenance: '#FFC107',      // Maintenance
  cleaning: '#61D4F7',          // Cleaning
  operational_hold: '#6c757d',  // Operational Hold (maps to 'blocked' if needed)
  damage: '#DC3545',            // Damage
  
  // Example colors from Figma, map your event types to these if they are distinct categories
  secondaryBooking: '#A8C5FF',  // e.g., A different kind of booking
  blocked: '#495057',           // e.g., A specific type of hold
  unavailable: '#ADB5BD',       // e.g., General unavailability note
  
  multipleEvents: '#7E57C2',    // A distinct purple for multiple different event types
  
  defaultHighlight: '#0D6EFD', // Fallback if an event type doesn't have a color
  default: '#FFFFFF',         // No background for non-event days
};
const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ScheduleOverviewCard = ({ scheduleEvents = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Default to current month

  const getMonthName = (date) => date.toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDaysInMonthGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInSelectedMonth = new Date(year, month + 1, 0).getDate();
    const grid = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push({ day: null, events: [] });
    }
    for (let dayCounter = 1; dayCounter <= daysInSelectedMonth; dayCounter++) {
      const currentDateInLoop = new Date(year, month, dayCounter);
      currentDateInLoop.setHours(0,0,0,0);
      const dayEvents = scheduleEvents.filter(event => {
        if (!event.start || !event.end) return false;
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        eventStart.setHours(0,0,0,0); 
        eventEnd.setHours(0,0,0,0);   
        return currentDateInLoop >= eventStart && currentDateInLoop <= eventEnd;
      })
      .map(e => ({ 
        ...e, // Keep all original event properties
        // Ensure a displayable title/type for the tooltip
        displayTitle: e.title || (e.type ? e.type.charAt(0).toUpperCase() + e.type.slice(1).replace(/_/g, ' ') : 'Scheduled Event') 
      }));
      
      grid.push({ day: dayCounter, events: dayEvents, date: currentDateInLoop });
    }
    return grid;
  };

  const monthGrid = getDaysInMonthGrid(currentDate);
  
  const renderTooltip = (props, cellEvents) => {
    if (!cellEvents || cellEvents.length === 0) {
      return <div {...props} style={{ ...props.style, display: 'none' }} />;
    }
    // Tooltip will now list the displayTitle of each event
    return (
      <Tooltip id={`tooltip-${Math.random().toString(36).substr(2, 9)}`} {...props}>
        {cellEvents.map((event, i) => (
          <div key={i} style={{ 
            marginBottom: cellEvents.length > 1 && i < cellEvents.length - 1 ? '0.3rem' : '0',
            textAlign: 'left'
          }}>
            {/* You can add a small dot or icon based on event.type here if you want */}
            {/* <span style={{color: eventColors[event.type] || eventColors.defaultHighlight}}>● </span> */}
            <strong>{event.displayTitle}</strong>
          </div>
        ))}
      </Tooltip>
    );
  };

  return (
    <div className="maquette-card schedule-card-maquette  h-100 d-flex flex-column">
      <div className="card-header">
        <h5 className="card-header-title">Schedule Overview</h5>
        <div className="header-divider"></div>
      </div>
      <div className="card-body text-center flex-grow-1 d-flex flex-column">
        <div className="schedule-navigation">
          <span onClick={handlePrevMonth} className="schedule-nav-arrow">
            <LuChevronLeft size={24}/> 
          </span>
          <strong className="schedule-month-display">{getMonthName(currentDate)}</strong>
          <span onClick={handleNextMonth} className="schedule-nav-arrow">
            <LuChevronRight size={24}/>
          </span>
        </div>

        <div className="calendar-grid-wrapper flex-grow-1">
          <div className="calendar-header-row">
            {daysOfWeek.map(day => (
              <div key={day} className="calendar-cell calendar-header-cell">{day}</div>
            ))}
          </div>
          <div className="calendar-body-grid">
            {monthGrid.map((cell, index) => {
              let cellStyle = {};
              let isHighlighted = false;
              const eventsForDay = cell.events || []; // All events for this day

              if (cell.day && eventsForDay.length > 0) {
                isHighlighted = true;
                const uniqueEventTypes = [...new Set(eventsForDay.map(e => e.type))];

                if (uniqueEventTypes.length > 1) {
                  // Multiple DISTINCT event types on this day
                  cellStyle = { backgroundColor: eventColors.multipleEvents, color: 'white' };
                } else if (uniqueEventTypes.length === 1) {
                  // Single event type on this day
                  const eventType = uniqueEventTypes[0];
                  let colorKey = 'defaultHighlight'; // Fallback

                  // --- Your mapping from backend event.type to eventColors key ---
                  if (eventType === 'booking') colorKey = 'primaryBooking';
                  else if (eventType === 'maintenance') colorKey = 'maintenance';
                  else if (eventType === 'cleaning') colorKey = 'cleaning';
                  else if (eventType === 'operational_hold') colorKey = 'operational_hold'; // Map to 'operational_hold' if that's a key in eventColors, or 'blocked'
                  else if (eventType === 'damage') colorKey = 'damage';
                  // Add more specific types from your backend if they map to different colors
                  // e.g., if (eventType === 'tentative_booking') colorKey = 'secondaryBooking';
                  //       if (eventType === 'showroom_hold') colorKey = 'blocked';
                  //       if (eventType === 'photoshoot_unavailable') colorKey = 'unavailable';
                  
                  cellStyle = { backgroundColor: eventColors[colorKey] || eventColors.defaultHighlight, color: 'white' };
                }
              } 
              
              const daySpan = (
                <span className="day-number" style={cellStyle}>
                  {cell.day}
                </span>
              );

              return (
                <div 
                    key={index} 
                    className={`calendar-cell calendar-day-cell ${cell.day === null ? 'empty' : ''} ${isHighlighted ? 'has-event' : ''}`}
                >
                  {cell.day && (
                    (isHighlighted && eventsForDay.length > 0) ? (
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 200 }} 
                        overlay={(props) => renderTooltip(props, eventsForDay)}
                        popperConfig={{ 
                            modifiers: [
                                { name: 'preventOverflow', options: { boundary: 'clippingParents', altBoundary: true, padding: 8 }},
                                { name: 'flip', options: { fallbackPlacements: ['bottom', 'left', 'right']}}
                            ]
                        }}
                      >
                        {daySpan}
                      </OverlayTrigger>
                    ) : (
                      daySpan 
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style jsx>{`
        /* --- Paste your existing <style jsx> for calendar layout and appearance --- */
        /* It should be the one that makes the calendar look compact like Figma */
        .schedule-card-maquette {
          border-radius: 16px !important;
          background-color: #FFFFFF;
          border: none; 
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
        }
        .schedule-card-maquette .card-header {
          background-color: #FFFFFF !important;
          border-radius: 16px !important;

          border-bottom: none; 
          padding: 1.25rem 1.5rem 0.75rem 1.5rem; 
        }
        .schedule-card-maquette .card-header-title {
          font-size: 1.25rem; 
          font-weight: 500; 
          color: #212529; 
          margin-bottom: 0.75rem; 
        }
        .header-divider {
          height: 1px;
          background-color: #E9ECEF; 
        }
        .schedule-card-maquette .card-body {
          padding: 1rem 1rem; 
        }
        .schedule-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem; 
        }
        .schedule-month-display {
          font-size: 1.375rem; 
          font-weight: 700; 
          color: #212529;
        }
        .schedule-nav-arrow {
          color: #495057; 
          cursor: pointer;
          padding: 0.25rem; 
          transition: color 0.2s ease;
          display: inline-flex; 
          align-items: center;
        }
        .schedule-nav-arrow:hover {
          color: #0D6EFD; 
        }
        .schedule-nav-arrow svg { 
            vertical-align: middle; 
        }
        .calendar-grid-wrapper {
          background-color: #FFFFFF; 
          border-radius: 12px; 
          padding: 0.75rem; 
          border: 1px solid #F0F2F5; 
          display: flex; 
          flex-direction: column; 
        }
        .calendar-header-row, .calendar-body-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px; 
        }
        .calendar-header-row {
            margin-bottom: 0.5rem; 
        }
        .calendar-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px; 
        }
        .calendar-header-cell {
          font-weight: 500; 
          color: #ADB5BD;
          font-size: 0.6875rem; 
          text-transform: uppercase;
        }
        .calendar-day-cell .day-number {
          width: 28px;  
          height: 28px; 
          line-height: 28px; 
          border-radius: 50%;
          display: inline-block;
          text-align: center;
          font-size: 0.8125rem; 
          font-weight: 400; 
          color: #343A40; 
          transition: transform 0.1s ease-in-out, background-color 0.2s ease;
          cursor: default; 
        }
        .calendar-day-cell.has-event .day-number {
            font-weight: 500; 
            color: white !important; 
            cursor: help; 
        }
        .calendar-day-cell.empty {
          background-color: transparent;
          pointer-events: none; 
        }
      `}</style>
    </div>
  );
};

export default ScheduleOverviewCard;