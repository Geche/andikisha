"use client";

import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import CollapseHeader from '../../../core/common/collapse-header/collapse-header'
import AddCompany from '../../../core/modals/add_company'
import EditCompany from '../../../core/modals/edit_company'
import { all_routes } from '@/routes/all_routes'
import Link from 'next/link'

const CompaniesGridComponent = () => {
  const routes = all_routes
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
              Companies Grid
            </li>
          </ol>
        </nav>
      </div>
      <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
        <div className="me-2 mb-2">
          <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
            <Link href={routes.companiesList} className="btn btn-icon btn-sm me-1">
              <i className="ti ti-list-tree" />
            </Link>
            <Link
              href={routes.companiesGrid}
              className="btn btn-icon btn-sm active bg-primary text-white"
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
                <Link
                  href="#"
                  className="dropdown-item rounded-1"
                >
                  <i className="ti ti-file-type-pdf me-1" />
                  Export as PDF
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="dropdown-item rounded-1"
                >
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
        <div className="head-icons ms-2">
        <CollapseHeader/>
        </div>
      </div>
    </div>
    {/* /Breadcrumb */}
    <div className="card">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between">
          <h5>Companies Grid</h5>
          <div className="dropdown">
            <Link
              href="#"
              className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
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
    </div>
    <div className="row">
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-12.svg"
                    className="img-fluid h-auto w-auto"
                    alt="BrightWave Innovations Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>BrightWave Innovations</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-05.jpg"
                    alt="Darlee's Avatar"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-06.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-07.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-08.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-09.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                darlee@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (163) 2459 315
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                Germany
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                4.2
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-13.svg"
                    className="img-fluid h-auto w-auto"
                    alt="Stellar Dynamics Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>Stellar Dynamics</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-01.jpg"
                    alt="Avatar 1"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-02.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-03.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-04.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-05.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                sharon@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (146) 1249 296
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                USA
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                5.0
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-14.svg"
                    className="img-fluid h-auto w-auto"
                    alt="Quantum Nexus Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>Quantum Nexus</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-06.jpg"
                    alt="Avatar 1"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-07.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-03.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-04.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-05.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                vaughan@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (158) 3459 596
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                India
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                4.5
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-14.svg"
                    className="img-fluid h-auto w-auto"
                    alt="EcoVision Enterprises Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>EcoVision Enterprises</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-08.jpg"
                    alt="Avatar 1"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-09.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-10.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-11.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-12.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                jessica@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (135) 3489 516
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                Canada
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                4.5
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-15.svg"
                    className="img-fluid h-auto w-auto"
                    alt="UrbanPulse Design Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>UrbanPulse Design</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-18.jpg"
                    alt="Avatar 1"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-19.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-20.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-01.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-02.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                jonella@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (184) 6348 195
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                Cuba
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                4.5
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-16.svg"
                    className="img-fluid h-auto w-auto"
                    alt="Aurora Technologies Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>Aurora Technologies</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-13.jpg"
                    alt="Avatar 1"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-14.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-15.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-16.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-17.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                carol@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (196) 4862 196
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                China
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                3.0
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-17.svg"
                    className="img-fluid h-auto w-auto"
                    alt="BlueSky Ventures Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>BlueSky Ventures</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-18.jpg"
                    alt="Avatar 1"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-19.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-20.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-21.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-22.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                dawn@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (163) 6498 256
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                Japan
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                5.0
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-18.svg"
                    className="img-fluid h-auto w-auto"
                    alt="TerraFusion Energy Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>TerraFusion Energy</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-23.jpg"
                    alt="Avatar 1"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-24.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-25.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-26.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-27.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                rachel@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (154) 6481 075
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                Indonesia
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                3.5
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="form-check form-check-md">
                <input className="form-check-input" type="checkbox" />
              </div>
              <div>
                <Link
                  href={routes.companiesDetails}
                  className="avatar avatar-xl avatar-rounded online border rounded-circle"
                >
                  <ImageWithBasePath
                    src="assets/img/company/company-19.svg"
                    className="img-fluid h-auto w-auto"
                    alt="Beacon Softwares Logo"
                  />
                </Link>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-icon btn-sm rounded-circle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_company"
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="ti ti-trash me-1" />
                      Delete
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-3">
              <h6 className="mb-1">
                <Link href={routes.companiesDetails}>Beacon Softwares</Link>
              </h6>
              <div className="avatar-list-stacked avatar-group-sm">
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-25.jpg"
                    alt="Avatar 1"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-26.jpg"
                    alt="Avatar 2"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-27.jpg"
                    alt="Avatar 3"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-28.jpg"
                    alt="Avatar 4"
                  />
                </span>
                <span className="avatar avatar-rounded">
                  <ImageWithBasePath
                    className="border border-white"
                    src="assets/img/profiles/avatar-29.jpg"
                    alt="Avatar 5"
                  />
                </span>
                <Link
                  className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                  href="#"
                >
                  +1
                </Link>
              </div>
            </div>
            <div className="d-flex flex-column">
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-mail-forward text-gray-5 me-2" />
                gloria@example.com
              </p>
              <p className="text-dark d-inline-flex align-items-center mb-2">
                <i className="ti ti-phone text-gray-5 me-2" />
                (134) 7589 6348
              </p>
              <p className="text-dark d-inline-flex align-items-center">
                <i className="ti ti-map-pin text-gray-5 me-2" />
                Brazil
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
              <div className="icons-social d-flex align-items-center">
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-mail" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-phone-call" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-message-2" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm me-1">
                  <i className="ti ti-brand-skype" />
                </Link>
                <Link href="#" className="avatar avatar-rounded avatar-sm">
                  <i className="ti ti-brand-facebook" />
                </Link>
              </div>
              <span className="d-inline-flex align-items-center">
                <i className="ti ti-star-filled text-warning me-1" />
                4.2
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="text-center mb-4">
      <Link href="#" className="btn btn-white border">
        <i className="ti ti-loader-3 text-primary me-2" />
        Load More
      </Link>
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
<AddCompany/>
<EditCompany/>
    </>
  )
}

export default CompaniesGridComponent