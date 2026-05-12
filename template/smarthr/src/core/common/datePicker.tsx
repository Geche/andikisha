"use client";
import { DateRangePicker } from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { useState } from 'react';

// Helper to format date as "dd/mm/yyyy"
function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function PredefinedDatePicker() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const initialSettings = {
    startDate: startOfToday,
    endDate: endOfToday,
    ranges: {
      'Last 30 Days': [
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0),
        endOfToday,
      ],
      'Last 7 Days': [
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0),
        endOfToday,
      ],
      'Last Month': [
        startOfLastMonth,
        endOfLastMonth,
      ],
      'This Month': [
        startOfMonth,
        endOfMonth,
      ],
      Today: [
        startOfToday,
        endOfToday,
      ],
      Yesterday: [
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0),
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999),
      ],
    },
    timePicker: false,
    locale: {
      format: 'DD/MM/YYYY',
    },
  };

  const [displayValue, setDisplayValue] = useState(
    `${formatDate(startOfToday)} - ${formatDate(endOfToday)}`
  );

  // Always format the input value when the picker is shown
  const handleShow = (_event: any, picker: any) => {
    setDisplayValue(
      `${formatDate(picker.startDate.toDate())} - ${formatDate(picker.endDate.toDate())}`
    );
  };

  const handleApply = (_event: any, picker: any) => {
    setDisplayValue(
      `${formatDate(picker.startDate.toDate())} - ${formatDate(picker.endDate.toDate())}`
    );
  };

  return (
    <div className='custom-daterange-picker'>
      <span className="input-icon-addon">
        <i className="ti ti-calendar text-gray-9"></i>
      </span>
      <DateRangePicker
        initialSettings={initialSettings}
        onApply={handleApply}
        onShow={handleShow}
      >
        <input
          type="text"
          className="form-control date-range bookingrange"
          placeholder="dd/mm/yyyy - dd/mm/yyyy"
          value={displayValue}
          readOnly
        />
      </DateRangePicker>
    </div>
  );
}
