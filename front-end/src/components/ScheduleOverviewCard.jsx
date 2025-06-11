// src/components/vehicle/ScheduleOverviewCard.jsx

import React, { useState, useMemo } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import 'bootstrap/dist/css/bootstrap.min.css';

// Centralized color mapping for event types from your original code
const eventColors = { 
  primaryBooking: '#0D6EFD',
  maintenance: '#FFC107',
  cleaning: '#61D4F7',
  operational_hold: '#6c757d',
  damage: '#DC3545',            
  
  secondaryBooking: '#A8C5FF',
  blocked: '#495057',
  unavailable: '#ADB5BD',
  
  multipleEvents: '#7E57C2',
  
  defaultHighlight: '#0D6EFD',
  default: '#FFFFFF',
};

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ScheduleOverviewCard = ({ scheduleEvents = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Memoize the grid calculation to avoid re-computing on every render
  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = [];

    // Add blank cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push({ key: `empty-${i}`, day: null, events: [] });
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0); // Normalize to the start of the day

      // Filter events that fall on this specific day
      const dayEvents = scheduleEvents.filter(event => {
        if (!event.start) return false;
        const eventStart = new Date(event.start);
        eventStart.setHours(0, 0, 0, 0);
        const eventEnd = event.end ? new Date(event.end) : eventStart;
        eventEnd.setHours(0, 0, 0, 0);
        return cellDate >= eventStart && cellDate <= eventEnd;
      })
      .map(e => ({ 
        ...e,
        displayTitle: e.title || (e.type ? e.type.charAt(0).toUpperCase() + e.type.slice(1).replace(/_/g, ' ') : 'Scheduled Event') 
      }));

      grid.push({ key: `${year}-${month}-${day}`, day, events: dayEvents });
    }

    return grid;
  }, [currentDate, scheduleEvents]);

  const renderTooltip = (props, cellEvents) => {
    if (!cellEvents || cellEvents.length === 0) {
      return <div {...props} style={{ ...props.style, display: 'none' }} />;
    }
    return (
      <Tooltip id="schedule-tooltip" {...props}>
        {cellEvents.map((event, i) => (
          <div key={i} style={{ 
            marginBottom: cellEvents.length > 1 && i < cellEvents.length - 1 ? '0.3rem' : '0',
            textAlign: 'left'
          }}>
            <strong>{event.displayTitle}</strong>
          </div>
        ))}
      </Tooltip>
    );
  };
  
  const getDayCellStyle = (events) => {
    if (events.length === 0) return {};
  
    const uniqueEventTypes = [...new Set(events.map(e => e.type))];
  
    if (uniqueEventTypes.length > 1) {
      return { backgroundColor: eventColors.multipleEvents, color: 'white' };
    }
    
    const eventType = uniqueEventTypes[0];
    let colorKey = 'defaultHighlight';
  
    if (eventType === 'booking') colorKey = 'primaryBooking';
    else if (eventType === 'maintenance') colorKey = 'maintenance';
    else if (eventType === 'cleaning') colorKey = 'cleaning';
    else if (eventType === 'operational_hold') colorKey = 'operational_hold';
    else if (eventType === 'damage') colorKey = 'damage';
    // Add other mappings from your original code if needed
  
    return { backgroundColor: eventColors[colorKey] || eventColors.defaultHighlight, color: 'white' };
  };


  return (
    <div className="maquette-card schedule-card-maquette h-100 d-flex flex-column">
      <div className="card-header">
        <h5 className="card-header-title">Schedule Overview</h5>
        <div className="header-divider"></div>
      </div>
      <div className="card-body text-center flex-grow-1 d-flex flex-column">
        <div className="schedule-navigation">
          <span onClick={handlePrevMonth} className="schedule-nav-arrow">
            <LuChevronLeft size={24}/> 
          </span>
          <strong className="schedule-month-display">
            {currentDate.toLocaleString('default', { month: 'long' })}
          </strong>
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
            {monthGrid.map((cell) => {
              const cellStyle = getDayCellStyle(cell.events);
              const daySpan = <span className="day-number" style={cellStyle}>{cell.day}</span>;

              return (
                <div 
                    key={cell.key} 
                    className={`calendar-cell calendar-day-cell ${cell.day === null ? 'empty' : ''} ${cell.events.length > 0 ? 'has-event' : ''}`}
                >
                  {cell.day && (
                    (cell.events.length > 0) ? (
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 200 }} 
                        overlay={(props) => renderTooltip(props, cell.events)}
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
      {/* --- THIS IS YOUR EXACT ORIGINAL STYLE BLOCK --- */}
      <style jsx>{`
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