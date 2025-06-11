// src/components/bookings/DateTimePicker.jsx

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Form, Spinner } from 'react-bootstrap';
import { fetchVehicleSchedule } from '../../services/api'; // We will create this

import "react-datepicker/dist/react-datepicker.css";
import "./BookingDetailModal.css"; // We will create this custom CSS file

const DateTimePicker = ({
  label,
  selectedDate,
  onChange,
  vehicleId,
  isStartDate,
  otherDate, // The corresponding start or end date
  currentBookingId, // The ID of the booking being edited, if any
}) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId) {
      setSchedule([]);
      return;
    }
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const response = await fetchVehicleSchedule(vehicleId);
        // We need to parse the date strings into Date objects
        const parsedSchedule = (response.data.data || []).map(b => ({
            id: b.id,
            start: new Date(b.start_date),
            end: new Date(b.end_date),
        }));
        setSchedule(parsedSchedule);
      } catch (error) {
        console.error("Error fetching vehicle schedule for date picker:", error);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [vehicleId]);

  // Create an array of objects for date ranges to exclude
  const excludeTimes = schedule
    .filter(booking => booking.id !== currentBookingId) // Exclude the current booking's own dates
    .map(booking => ({
        start: booking.start,
        end: booking.end,
    }));

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label} {loading && <Spinner animation="border" size="sm" />}</Form.Label>
      <DatePicker
        selected={selectedDate ? new Date(selectedDate) : null}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={30}
        dateFormat="MMMM d, yyyy h:mm aa"
        className="form-control"
        placeholderText="Select date and time"
        minDate={isStartDate ? new Date() : new Date(otherDate)} // End date cannot be before start date
        excludeDateIntervals={excludeTimes}
        selectsRange={!isStartDate} // Helps with visual highlighting
        startDate={isStartDate ? new Date(selectedDate) : new Date(otherDate)}
        endDate={isStartDate ? new Date(otherDate) : new Date(selectedDate)}
        withPortal // Shows the calendar in a modal, better for forms
      />
    </Form.Group>
  );
};

export default DateTimePicker;