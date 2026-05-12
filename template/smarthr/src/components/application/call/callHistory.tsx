"use client";

import { callhistorydata } from "../../../core/data/json/callHistoryData";
import Table from "../../../core/common/dataTable/index";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CallerDetails from "../../../core/modals/callerDetailsModal";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { all_routes } from "@/routes/all_routes";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Link from "next/link";

// Define interface for call history data
interface CallHistoryItem {
  name: string;
  phone_number: string;
  call_type: string;
  icon: string;
  duration: string;
  date_time: string;
  image_url: string;
  text: string;
  [key: string]: any; // Remove if not needed
}

interface ColumnType<T> {
  title: string;
  dataIndex: keyof T | string;
  render?: (text: any, record?: T) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
}

const CallHistoryComponent = () => {
  const data: CallHistoryItem[] = callhistorydata;
  const columns: ColumnType<CallHistoryItem>[] = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text: string, record?: CallHistoryItem) => (
        <div className="d-flex align-items-center">
          <Link href="#" className="avatar avatar-md" data-bs-toggle="modal" data-inert={true} data-bs-target="#view_details">
            <ImageWithBasePath src={record?.image_url || ''} className="img-fluid rounded-circle" alt={record?.name || "Caller"} />
          </Link>
          <div className="ms-2">
            <p className="text-dark fw-medium mb-0">
              <Link href="#" data-bs-toggle="modal" data-inert={true} data-bs-target="#view_details">{text}</Link>
            </p>
            <span className="fs-12">{record?.text}</span>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      sorter: (a, b) => a.phone_number.length - b.phone_number.length,
    },
    {
      title: "Call Type",
      dataIndex: "call_type",
      render: (text: string, record?: CallHistoryItem) => (
        <div className="d-inline-flex align-items-center">
          <i className={`ti ti-${record?.icon}  ${text === "Incoming" ? 'text-success' : text === "Outgoing" ? 'text-success' : 'text-danger'} me-2`}></i>
          {text}
        </div>
      ),
      sorter: (a, b) => a.call_type.length - b.call_type.length,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      sorter: (a, b) => a.duration.length - b.duration.length,
    },
    {
      title: "Date & Time",
      dataIndex: "date_time",
      sorter: (a, b) => a.date_time.length - b.date_time.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div>
          <div className="action-icon d-inline-flex">
            <Link
              href="#"
              className="me-2"
              data-bs-toggle="modal" data-inert={true} data-bs-target="#call_history"
            >
              <i className="ti ti-eye"></i>
            </Link>
          </div>
          <div className="action-icon d-inline-flex">
            <Link
              href="#"
              className="me-2"
              data-bs-toggle="modal" data-inert={true} data-bs-target="#delete_modal"
            >
              <i className="ti ti-trash"></i>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Call History</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Calls</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Call History
                  </li>
                </ol>
              </nav>
            </div>
            <div className="head-icons">
              <CollapseHeader />
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Call History List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon position-relative">
                    <PredefinedDateRanges />
                  </div>
                </div>
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Call Type
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Incoming
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Outgoing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Missed Call
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Desending
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Last Month
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Last 7 Days
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <Table dataSource={data} columns={columns} Selection={true} />
            </div>
          </div>
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014 - 2026 © SmartHR.</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link href="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      <CallerDetails />
      {/* /Page Wrapper */}
    </>
  );
};

export default CallHistoryComponent;


