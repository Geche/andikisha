"use client";

import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { companyDatas } from "../../../core/data/json/companyData";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import PredefinedDateRanges from "../../../core/common/datePicker";
import Table from "../../../core/common/dataTable/index";
import CrmsModal from "../../../core/modals/crms_modal";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

// Define a type for company data
interface CompanyData {
  key: string | number;
  Company_Name: string;
  Image: string;
  Email: string;
  Phone: string;
  Location: string;
  Rating: string;
  Owner: string;
  Status: string;
}

const CompaniesListComponent = () => {
  const routes = all_routes;
  const data: CompanyData[] = companyDatas;
  const columns = [
    {
      title: "Company Name",
      dataIndex: "Company_Name",
      render: (text: string, record: CompanyData) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link
            href={routes.companiesDetails}
            className="avatar avatar-md border rounded-circle"
          >
            <ImageWithBasePath
              src={`assets/img/company/${record.Image}`}
              className="img-fluid"
              alt={`${text} Logo`}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href={routes.companiesDetails}>{text}</Link>
            </h6>
          </div>
        </div>
      ),
      sorter: (a: CompanyData, b: CompanyData) => a.Company_Name.length - b.Company_Name.length,
    },
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a: CompanyData, b: CompanyData) => a.Email.length - b.Email.length,
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      sorter: (a: CompanyData, b: CompanyData) => a.Phone.length - b.Phone.length,
    },
    {
      title: "Location",
      dataIndex: "Location",
      sorter: (a: CompanyData, b: CompanyData) => a.Location.length - b.Location.length,
    },
    {
      title: "Rating",
      dataIndex: "Rating",
      render: (text: string) => (
        <span className="d-flex align-items-center">
          <i className="ti ti-star-filled text-warning me-2"></i>
          {text}
        </span>
      ),
      sorter: (a: CompanyData, b: CompanyData) => a.Rating.length - b.Rating.length,
    },
    {
      title: "Owner",
      dataIndex: "Owner",
      sorter: (a: CompanyData, b: CompanyData) => a.Owner.length - b.Owner.length,
    },
    {
      title: "Contact",
      dataIndex: "",
      render: () => (
        <ul className="contact-icon d-flex align-items-center ">
          <li>
            <Link
              href="#"
              className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"
            >
              <span className="d-flex align-items-center justify-content-center">
                <i className="ti ti-mail text-gray-5"></i>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"
            >
              <span className="d-flex align-items-center justify-content-center">
                <i className="ti ti-phone-call text-gray-5"></i>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"
            >
              <span className="d-flex align-items-center justify-content-center">
                <i className="ti ti-message-2 text-gray-5"></i>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"
            >
              <span className="d-flex align-items-center justify-content-center">
                <i className="ti ti-brand-skype text-gray-5"></i>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"
            >
              <span className="d-flex align-items-center justify-content-center">
                <i className="ti ti-brand-facebook text-gray-5"></i>
              </span>
            </Link>
          </li>
        </ul>
      ),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <>
          <span
            className={`badge d-inline-flex align-items-center badge-xs ${
              text === "Active" ? "badge-success" : "badge-danger"
            }`}
          >
            <i className="ti ti-point-filled me-1"></i>
            {text}
          </span>
        </>
      ),
      sorter: (a: CompanyData, b: CompanyData) => a.Status.length - b.Status.length,
    },

    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div className="action-icon d-inline-flex">
          <Link href={routes.companiesDetails} className="me-2" aria-label="View company details">
            <i className="ti ti-eye" />
          </Link>
          <Link
            href="#"
            className="me-2"
            data-bs-toggle="modal"
            data-bs-target="#edit_company"
            aria-label="Edit company"
          >
            <i className="ti ti-edit" />
          </Link>
          <Link href="#" data-bs-toggle="modal" data-bs-target="#delete_modal" aria-label="Delete company">
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
    },
  ];
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Companies</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">CRM</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Companies List
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    href={routes.companiesList}
                    className="btn btn-icon btn-sm active bg-primary text-white me-1"
                  >
                    <i className="ti ti-list-tree" />
                  </Link>
                  <Link
                    href={routes.companiesGrid}
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
              <div className="mb-2">
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#add_company"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Company
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
              <h5>Companies List</h5>
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
                    Company
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        BrightWave Innovations{" "}
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Quantum Nexus
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        TerraFusion Energy
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
        <div className="footer d-sm-flex align-items-center justify-content-between bg-white p-3">
          <p className="mb-0">2014 - 2026 © SmartHR.</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link href="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      <CrmsModal />
    </>
  );
};

export default CompaniesListComponent;
