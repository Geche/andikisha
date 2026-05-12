"use client";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import { CampusHiringData } from "@/core/data/json/campashHiringData";
import Table from "@/core/common/dataTable/index";
import PredefinedDatePicker from "@/core/common/datePicker";
import AddNewCampus from "./AddNewCampus";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";


// Define a type for company data
interface CampusHiringDataInterface {
  Student_Name: string;
  Branch: string;
  Graduation_Year: string;
  Job_Role: string;
  Recruiter_Name: string;
  Status: string;
  avatar: string;
  Email: string;
}

const CampusHiringComponent = () => {
  const data: CampusHiringDataInterface[] = CampusHiringData;
  const columns = [
    {
      title: "Student Name",
      dataIndex: "Student_Name",
      render: (_text: string, record: CampusHiringDataInterface) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md ">
            <ImageWithBasePath
              src={`assets/img/users/${record.avatar}`}
              className="img-fluid rounded-circle"
              alt={record.Student_Name}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href="#">{record.Student_Name}</Link>
            </h6>
            <span className="d-block mt-1">{record.Email}</span>
          </div>
        </div>
      ),
      sorter: (a: CampusHiringDataInterface, b: CampusHiringDataInterface) =>
        a.Student_Name.length - b.Student_Name.length,
    },
    {
      title: " Branch",
      dataIndex: "Branch",

      sorter: (a: CampusHiringDataInterface, b: CampusHiringDataInterface) =>
        a.Branch.length - b.Branch.length,
    },
    {
      title: " Graduation Year",
      dataIndex: "Graduation_Year",

      sorter: (a: CampusHiringDataInterface, b: CampusHiringDataInterface) =>
        a.Graduation_Year.length - b.Graduation_Year.length,
    },
    {
      title: "  Job Role",
      dataIndex: "Job_Role",

      sorter: (a: CampusHiringDataInterface, b: CampusHiringDataInterface) =>
        a.Job_Role.length - b.Job_Role.length,
    },
    {
      title: "  Recruiter Name ",
      dataIndex: "Recruiter_Name",

      sorter: (a: CampusHiringDataInterface, b: CampusHiringDataInterface) =>
        a.Recruiter_Name.length - b.Recruiter_Name.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge border   ${text === "Applied"
            ? "border-purple text-purple"
            : text === "Shortlisted"
              ? "border-pink text-pink"
              : text === "In progress"
                ? "border-info text-info"
                : text === "Selected"
                  ? "border-success text-success"
                  : text === "Rejected"
                    ? "border-danger text-danger"
                    : "border-warning text-warning"
            }`}
        >
          <i className="ti ti-point-filled" />
          {text}
        </span>
      ),
      sorter: (a: CampusHiringDataInterface, b: CampusHiringDataInterface) => a.Status.length - b.Status.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div className="action-icon d-inline-flex">
          <Link href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_candidate" aria-label="Edit contact">
            <i className="ti ti-edit"></i>
          </Link>
          <Link href="#" data-bs-toggle="modal" data-bs-target="#delete_modal" aria-label="Delete contact">
            <i className="ti ti-trash"></i>
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
              <h2 className="mb-1">Campus Hiring</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Recruitment</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Campus Hiring
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
              <div className="mb-2">
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#add_candidate"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add New Candidate
                </Link>
              </div>
              <div className="ms-2 head-icons">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Students List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="me-3 input-icon position-relative">
                    <PredefinedDatePicker />
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
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Sales Executive Officer
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
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Applied
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        In progress
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Selected
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Rejected
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
              <div className="custom-datatable-filter table-responsive">
                <Table dataSource={data} columns={columns} Selection={true} />
              </div>
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
      <AddNewCampus />
    </>
  );
};
export default CampusHiringComponent;
