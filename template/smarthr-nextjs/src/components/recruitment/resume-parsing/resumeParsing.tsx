"use client";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import { ResumeParsingData } from "@/core/data/json/resumeParsingData";
import Table from "../../../core/common/dataTable/index";
import PredefinedDatePicker from "@/core/common/datePicker";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
// Define a type for company data
interface ResumeParsingData {
  key: string | number;
  Cand_ID: string;
  avatar: string;
  Candidate: string;
  Email: string;
  Applied_Role: string;
  Phone: string;
  Expereience: string;
  Location: string;
  Status: string;
}
const ResumeParsingComponent = () => {
  const routes = all_routes;
  const data: ResumeParsingData[] = ResumeParsingData;
  const columns = [
    {
      title: "Cand Id",
      dataIndex: "Cand_ID",

      sorter: (a: ResumeParsingData, b: ResumeParsingData) =>
        a.Cand_ID.length - b.Cand_ID.length,
    },
    {
      title: "Candidate",
      dataIndex: "Candidate",
      render: (_text: string, record: ResumeParsingData) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md ">
            <ImageWithBasePath
              src={`assets/img/users/${record.avatar}`}
              className="img-fluid rounded-circle"
              alt={record.Candidate}
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
      sorter: (a: ResumeParsingData, b: ResumeParsingData) =>
        a.Candidate.length - b.Candidate.length,
    },
    {
      title: "Applied Role",
      dataIndex: "Applied_Role",
      sorter: (a: ResumeParsingData, b: ResumeParsingData) =>
        a.Applied_Role.length - b.Applied_Role.length,
    },

    {
      title: "Phone",
      dataIndex: "Phone",
      sorter: (a: ResumeParsingData, b: ResumeParsingData) =>
        a.Phone.length - b.Phone.length,
    },
    {
      title: "Expereience",
      dataIndex: "Expereience",

      sorter: (a: ResumeParsingData, b: ResumeParsingData) =>
        a.Expereience.length - b.Expereience.length,
    },
    {
      title: "Location",
      dataIndex: "Location",

      sorter: (a: ResumeParsingData, b: ResumeParsingData) =>
        a.Location.length - b.Location.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge border   ${text === "Parsed"
            ? "border-info text-info"
            : "border-danger text-danger"
            }`}
        >
          <i className="ti ti-point-filled" />
          {text}
        </span>

      ),
      sorter: (a: ResumeParsingData, b: ResumeParsingData) => a.Status.length - b.Status.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div className="action-icon d-inline-flex">
          <Link href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact" aria-label="Edit contact">
            <i className="ti ti-file-invoice"></i>
          </Link>
          <Link href="#" data-bs-toggle="modal" data-bs-target="#download_modal" aria-label="Download contact">
            <i className="ti ti-download"></i>
          </Link>
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
              <h2 className="mb-1">Resume Parsing</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Recruitment</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Resume Parsing
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="mb-2 me-2">
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
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Resume List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="input-icon position-relative me-3">
                  <PredefinedDatePicker />
                </div>
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Designation
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Accountant
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        App Developer
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Technician
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Web Developer
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

export default ResumeParsingComponent;
