"use client";

import PredefinedDateRanges from "../../../core/common/datePicker";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { candidatelistDetails } from "./candidatelistDetails";
import Table from "../../../core/common/dataTable/index";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";

// Define Candidate interface for type safety
interface Candidate {
  Key: string;
  Cand_ID: string;
  Candidate: string;
  Image: string;
  Email: string;
  Resume: string;
  Applied_Role: string;
  Phone: string;
  Applied_Date: string;
  Status: string;
}

const CandidatesListComponent = () => {
  const data = candidatelistDetails;
  const columns = [
    {
      title: "Cand ID",
      dataIndex: "Cand_ID",
      sorter: (a: Candidate, b: Candidate) =>
        a.Cand_ID.length - b.Cand_ID.length,
    },
    {
      title: "Candidate",
      dataIndex: "Candidate",
      render: (_text: string, record: Candidate) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md ">
            <ImageWithBasePath
              src={`assets/img/users/${record.Image}`}
              className="img-fluid rounded-circle"
              alt={record.Candidate} // Accessibility: use candidate name
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href="#">{record.Candidate}</Link>
            </h6>
            <span className="d-block mt-1">{record.Email}</span>
          </div>
        </div>
      ),
      sorter: (a: Candidate, b: Candidate) =>
        a.Candidate.length - b.Candidate.length,
    },
    {
      title: "Applied Role",
      dataIndex: "Applied_Role",
      sorter: (a: Candidate, b: Candidate) =>
        a.Applied_Role.length - b.Applied_Role.length,
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      sorter: (a: Candidate, b: Candidate) => a.Phone.length - b.Phone.length,
    },
    {
      title: "Applied Date",
      dataIndex: "Applied_Date",
      sorter: (a: Candidate, b: Candidate) =>
        a.Applied_Date.length - b.Applied_Date.length,
    },
 {
      title: "Resume",
      dataIndex: "Resume",
      render: () => (
        <div className="d-inline-flex">
          <Link href="#" className="text-gray me-2 fs-16">
            <i className="ti ti-file-text" />
          </Link>
          <Link href="#" className="text-gray fs-16">
            <i className="ti ti-download" />
          </Link>
        </div>
      ),
      sorter: (a: Candidate, b: Candidate) => a.Resume.length - b.Resume.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge border   ${
            text === "Sent"
              ? "border-purple text-purple"
              : text === "Scheduled"
              ? "border-pink text-pink"
              : text === "Interviewed"
              ? "border-info text-info"
              : text === "Offered"
              ? "border-warning text-warning"
              : text === "Hired"
              ? "border-success text-success"
              : text === "App Received"
              ? "border-purple text-purple"
              : "border-danger text-danger"
          }`}
        >
          <i className="ti ti-point-filled" />
          {text}
        </span>
      ),
      sorter: (a: Candidate, b: Candidate) => a.Status.length - b.Status.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <Link href="#" data-bs-toggle="modal" data-bs-target="#delete_modal">
          <i className="ti ti-trash" />
        </Link>
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
              <h2 className="mb-1">Candidates List</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Administration</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Candidates List
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    href={all_routes.candidateskanban}
                    className="btn btn-icon btn-sm me-1"
                  >
                    <i className="ti ti-layout-kanban" />
                  </Link>
                  <Link
                    href={all_routes.candidateslist}
                    className="btn btn-icon btn-sm active bg-primary text-white me-1"
                  >
                    <i className="ti ti-list-tree" />
                  </Link>
                  <Link
                    href={all_routes.candidateskanban}
                    className="btn btn-icon btn-sm"
                  >
                    <i className="ti ti-layout-grid" />
                  </Link>
                </div>
              </div>
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
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Candidates List</h5>
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
                    Role
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Accountant
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Accountant
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Technician
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
                        Accepted
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        sent
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Expired
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Declined
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
                        Desending
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
      {/* /Page Wrapper */}
    </>
  );
};

export default CandidatesListComponent;
