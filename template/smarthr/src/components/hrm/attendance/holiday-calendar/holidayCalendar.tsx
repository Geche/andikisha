import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DatePicker } from "antd";
import type { Nullable } from "primereact/ts-helpers";
import Modal from 'react-bootstrap/Modal';
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import React from "react";
import CommonFooter from "@/core/common/commonFooter/footer";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

// Error Boundary Component
interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}
interface ErrorBoundaryState {
    hasError: boolean;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error if needed
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || <div>Something went wrong. Please try again later.</div>;
        }
        return this.props.children;
    }
}

// Event interface
interface CalendarEvent {
    title: string;
    className: string;
    backgroundColor: string;
    textColor: string;
    start: string;
    end?: string;
}

const HolidayCalendarsComponent = () => {
    const routes = all_routes;

    const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
    const [eventDetails, setEventDetails] = useState<string>("");

    const getModalContainer = () => {
        const modalElement = document.getElementById('modal-datepicker');
        return modalElement ? modalElement : document.body;
    };
    const getModalContainer2 = () => {
        const modalElement = document.getElementById('modal_datepicker');
        return modalElement ? modalElement : document.body;
    };
    const calendarRef = useRef<FullCalendar | null>(null);
    const [date, setDate] = useState<Nullable<Date>>(null);

    const handleEventClick = (info: any) => {
        setEventDetails(info.event.title);
        setShowEventDetailsModal(true);
    };

    const handleEventDetailsClose = () => setShowEventDetailsModal(false);

    const events: CalendarEvent[] = [
        {
            title: 'New Year',
            className: 'badge badge-pink-transparent',
            backgroundColor: '#FFEDF6',
            textColor: "#FD3995",
            start: "2026-01-01",
            end: "2026-01-01",
        },
    ];

    return (
        <ErrorBoundary fallback={<div>Failed to load calendar. Please refresh the page.</div>}>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Holiday Calendar</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Attendance</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Holiday Calendar
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                            <div className="mb-2">
                                <Link
                                    href="#"
                                    data-bs-toggle="modal" data-inert={true}
                                    data-bs-target="#add_event"
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Add New Holiday
                                </Link>
                            </div>
                            <div className="ms-2 head-icons">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    <div className="stickybar">
                        <div className="card border-0">
                            <div className="card-body">
                                <FullCalendar
                                    plugins={[
                                        dayGridPlugin,
                                        timeGridPlugin,
                                        interactionPlugin,
                                    ]}
                                    initialView="dayGridMonth"
                                    events={events}
                                    headerToolbar={{
                                        start: "today,prev,next",
                                        center: "title",
                                        end: "dayGridMonth,dayGridWeek,dayGridDay",
                                    }}
                                    eventClick={handleEventClick}
                                    ref={calendarRef}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}

            {/* Event */}
            <Modal show={showEventDetailsModal} onHide={handleEventDetailsClose}>
                <div className="modal-header bg-dark modal-bg">
                    <div className="modal-title text-white">
                        <span id="eventTitle">{eventDetails}</span>
                    </div>
                    <button
                        type="button"
                        className="btn-close custom-btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        onClick={handleEventDetailsClose}
                    >
                        <i className="ti ti-x" />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="d-flex align-items-center fw-medium text-black mb-3">
                        <i className="ti ti-calendar-check text-default me-2" />
                        01 Jan 2026
                    </p>
                    <p className="d-flex align-items-center fw-medium text-black mb-0">
                        <i className="ti ti-calendar-check text-default me-2" />
                        12:00 AM to 12:59 PM
                    </p>
                </div>
            </Modal>
            {/* /Event */}

            {/* Add New Event */}
            <div className="modal fade" id="add_event">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add New Holiday</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="mb-3">
                                            <label className="form-label">Holiday Name</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="mb-3">
                                            <label className="form-label">Holiday Date</label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Holiday
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add New Event */}
        </ErrorBoundary>
    );
};

export default HolidayCalendarsComponent;
