"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import CommonFooter from "@/core/common/commonFooter/footer";
import TicketReportChart from "./ticketReportChart";
import { ticketReportData } from "@/core/data/json/ticketReportData";
import PredefinedDatePicker from "@/core/common/datePicker";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";

interface TicketReportData {
  TicketId: string;
  Description: string;
  Image1: string;
  Image: string;
  Priority: string;
  Tenants: string;
  Date: string;
  Assignee: string;
  Status: string;
}
const TicketReportsComponent = () => {
  const data: TicketReportData[] = ticketReportData;
  const columns = [
    {
      title: "Ticket Id",
      dataIndex: "TicketId",
      render: (text: string, _record: TicketReportData) => (
        <Link href="#" className="link-default">
          {text}
        </Link>
      ),
      sorter: (a: TicketReportData, b: TicketReportData) =>
        a.TicketId.length - b.TicketId.length,
    },
    {
      title: "Description",
      dataIndex: "Description",
      render: (text: string, _record: TicketReportData) => (
        <Link href="#" className="link-default fw-medium">
          {text}
        </Link>
      ),
      sorter: (a: TicketReportData, b: TicketReportData) =>
        a.Description.length - b.Description.length,
    },
    {
      title: "Priority",
      dataIndex: "Priority",
      render: (
        text: TicketReportData["Priority"],
        _record: TicketReportData,
      ) => (
        <Link
          href="#"
          className={`badge border ${text === "Low" ? "border-success text-success" : text === "Medium" ? "border-warning text-warning" : text === "Critical" ? "border-pink text-pink" : "border-danger text-danger"} d-inline-flex align-items-center badge-xs`}
        >
          {text}
        </Link>
      ),
      sorter: (a: TicketReportData, b: TicketReportData) =>
        a.Priority.length - b.Priority.length,
    },
    {
      title: "Tenants",
      dataIndex: "Tenants",
      render: (_text: string, record: TicketReportData) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md border avatar-rounded">
            <ImageWithBasePath
              src={`assets/img/company/${record.Image1}`}
              className="img-fluid"
              alt={`${record.Tenants} logo`}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href="#">{record.Tenants}</Link>
            </h6>
          </div>
        </div>
      ),
      sorter: (a: TicketReportData, b: TicketReportData) =>
        a.Tenants.length - b.Tenants.length,
    },
    {
      title: "Date",
      dataIndex: "Date",
      sorter: (a: TicketReportData, b: TicketReportData) =>
        a.Date.length - b.Date.length,
    },
    {
      title: "Assignee",
      dataIndex: "Assignee",
      render: (_text: string, record: TicketReportData) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md border avatar-rounded">
            <ImageWithBasePath
              src={`assets/img/agents/${record.Image}`}
              className="img-fluid"
              alt={`${record.Assignee} logo`}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href="#">{record.Assignee}</Link>
            </h6>
          </div>
        </div>
      ),
      sorter: (a: TicketReportData, b: TicketReportData) =>
        a.Assignee.length - b.Assignee.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: TicketReportData["Status"], _record: TicketReportData) => (
        <Link
          href="#"
          className={`badge ${text === "Closed" ? "badge-success" : text === "Open" ? "badge-purple" : text === "Pending" ? "badge-info" : text === "On Hold" ? "badge-warning" : "badge-danger"} d-inline-flex align-items-center badge-xs`}
        >
          {text}
        </Link>
      ),
      sorter: (a: TicketReportData, b: TicketReportData) =>
        a.Status.length - b.Status.length,
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
              <h2 className="mb-1">Ticket Report</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Tickets</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Ticket Report
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="dropdown">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-file-export me-1" />
                    Export
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="head-icons">
                <CollapseHeader />
              </div>
            </div>
          </div>

          <div className="row">
            {/* Total Exponses */}
            <div className="col-lg-6 col-md-6 d-flex">
              <div className="row flex-fill">
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="ticket-report-card flex-fill d-flex">
                    <div className="card-content flex-fill">
                      <div>
                        <div className="mb-2">
                          <span className="fs-14 fw-normal text-truncate text-body mb-1">
                            Total Projects
                          </span>
                          <h5>240</h5>
                        </div>
                      </div>
                      <div className="d-flex mt-2">
                        <span className="badge badge-success-transparent">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +5.50%
                        </span>
                      </div>
                    </div>
                    <div className="ticket-report-card-icon">
                      <i className="ti ti-ticket" />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="ticket-report-card flex-fill d-flex">
                    <div className="card-content flex-fill">
                      <div>
                        <div className="mb-2">
                          <span className="fs-14 fw-normal text-truncate text-body mb-1">
                            Open Tickets
                          </span>
                          <h5>35</h5>
                        </div>
                      </div>
                      <div className="d-flex mt-2">
                        <span className="badge badge-success-transparent">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +2.10%
                        </span>
                      </div>
                    </div>
                    <div className="ticket-report-card-icon">
                      <i className="ti ti-clock-hour-3" />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="ticket-report-card flex-fill d-flex">
                    <div className="card-content flex-fill">
                      <div>
                        <div className="mb-2">
                          <span className="fs-14 fw-normal text-truncate text-body mb-1">
                            {" "}
                            Pending Tickets
                          </span>
                          <h5>15</h5>
                        </div>
                      </div>
                      <div className="d-flex mt-2">
                        <span className="badge badge-danger-transparent">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +3.40%
                        </span>
                      </div>
                    </div>
                    <div className="ticket-report-card-icon">
                      <i className="ti ti-hourglass-empty" />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="ticket-report-card flex-fill d-flex">
                    <div className="card-content flex-fill">
                      <div>
                        <div className="mb-2">
                          <span className="fs-14 fw-normal text-truncate text-body mb-1">
                            Resolved Tickets
                          </span>
                          <h5>170</h5>
                        </div>
                      </div>
                      <div className="d-flex mt-2">
                        <span className="badge badge-success-transparent">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +4.30%
                        </span>
                      </div>
                    </div>
                    <div className="ticket-report-card-icon">
                      <i className="ti ti-checklist" />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="ticket-report-card flex-fill d-flex">
                    <div className="card-content flex-fill">
                      <div>
                        <div className="mb-2">
                          <span className="fs-14 fw-normal text-truncate text-body mb-1">
                            SLA Breached
                          </span>
                          <h5>08</h5>
                        </div>
                      </div>
                      <div className="d-flex mt-2">
                        <span className="badge badge-success-transparent">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +1.20%
                        </span>
                      </div>
                    </div>
                    <div className="ticket-report-card-icon">
                      <i className="ti ti-alert-triangle" />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="ticket-report-card flex-fill d-flex">
                    <div className="card-content flex-fill">
                      <div>
                        <div className="mb-2">
                          <span className="fs-14 fw-normal text-truncate text-body mb-1">
                            Tickets Escalated
                          </span>
                          <h5>12</h5>
                        </div>
                      </div>
                      <div className="d-flex mt-2">
                        <span className="badge badge-danger-transparent">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +2.70%
                        </span>
                      </div>
                    </div>
                    <div className="ticket-report-card-icon">
                      <i className="ti ti-user-share" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Total Exponses */}
            {/* Total Exponses */}
            <div className="col-lg-6 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header border-0">
                  <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <h5>
                        <span className="me-2">
                          <i className="ti ti-chart-bar text-danger" />
                        </span>
                        Ticket Categories Vs Priority
                      </h5>
                    </div>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="dropdown-toggle btn btn-sm fs-12 btn-white d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        This Year
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-2">
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            2025
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            2024
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            2024
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <TicketReportChart />
                </div>
              </div>
            </div>
            {/* /Total Exponses */}
          </div>

          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Ticket List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3 input-icon position-relative">
                  <PredefinedDatePicker />
                </div>
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Tenant
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        BrightWave Innovations
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Stellar Dynamics
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Quantum Nexus
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Priority
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Low
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Medium
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        High
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Status
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Active
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Inactive
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
                      <Link href="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Last Month
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
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
        <CommonFooter />
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default TicketReportsComponent;
