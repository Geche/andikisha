"use client";

import CommonSelect from "../../../core/common/commonSelect";
import {
  status,
} from "../../../core/common/selectoption/selectoption";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";


const LanguageComponent = () => {
  const routes = all_routes;
  return (
    <div>
      <>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content">
            {/* Breadcrumb */}
            <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
              <div className="my-auto mb-2">
                <h2 className="mb-1">Settings</h2>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link href={routes.adminDashboard}>
                        <i className="ti ti-smart-home" />
                      </Link>
                    </li>
                    <li className="breadcrumb-item">Website Settings</li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Language
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
            {/* /Breadcrumb */}
            <ul className="nav nav-tabs nav-tabs-solid bg-transparent border-bottom mb-3">
              <li className="nav-item">
                <Link className="nav-link" href={routes.profilesettings}>
                  <i className="ti ti-settings me-2" />
                  General Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" href={routes.bussinessSettings}>
                  <i className="ti ti-world-cog me-2" />
                  Website Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={routes.salarySettings}>
                  <i className="ti ti-device-ipad-horizontal-cog me-2" />
                  App Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={routes.emailSettings}>
                  <i className="ti ti-server-cog me-2" />
                  System Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={routes.paymentGateways}>
                  <i className="ti ti-settings-dollar me-2" />
                  Financial Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={routes.customCss}>
                  <i className="ti ti-settings-2 me-2" />
                  Other Settings
                </Link>
              </li>
            </ul>
            <div className="row">
              <div className="col-xl-3 theiaStickySidebar">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex flex-column list-group settings-list">
                      <Link
                        href={routes.bussinessSettings}
                        className="d-inline-flex align-items-center rounded  py-2 px-3"
                      >
                        Business Settings
                      </Link>
                      <Link
                        href={routes.seoSettings}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        SEO Settings
                      </Link>
                      <Link
                        href={routes.localizationSettings}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Localization
                      </Link>
                      <Link
                        href={routes.prefixes}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Prefixes
                      </Link>
                      <Link
                        href={routes.preference}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Preferences
                      </Link>
                      <Link
                        href={routes.appearance}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Appearance
                      </Link>
                      <Link
                        href={routes.languageWeb}
                        className="d-inline-flex align-items-center rounded active py-2 px-3"
                      >
                        <i className="ti ti-arrow-badge-right me-2" />
                        Language
                      </Link>
                      <Link
                        href={routes.authenticationSettings}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Authentication Settings
                      </Link>
                      <Link
                        href={routes.aiSettings}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >

                        AI Settings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-9">
                <div className="card">
                  <div className="card-header px-0 mx-3">
                    <div className="row g-3 align-items-center">
                      <div className="col-md-6 col-sm-4">
                        <h4>Language</h4>
                      </div>
                      <div className="col-md-6 col-sm-8">
                        <div className="d-flex justify-content-sm-end align-items-center flex-wrap row-gap-2">
                          <div className="me-3">
                            <CommonSelect
                              className="select"
                              options={status}
                            />
                          </div>
                          <Link href="#" className="btn btn-primary">
                            Add Language
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body pb-0">
                    <div className="card mb-3">
                      <div className="card-header">
                        <div className="row align-items-center g-3">
                          <div className="col-sm-8">
                            <h6>Language List</h6>
                          </div>
                          <div className="col-sm-4">
                            <div className="position-relative search-input">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Search"
                              />
                              <div className="search-addon">
                                <span>
                                  <i className="ti ti-search" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table">
                            <thead className="thead-light">
                              <tr>
                                <th className="no-sort">
                                  <div className="form-check form-check-md">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="select-all"
                                    />
                                  </div>
                                </th>
                                <th>Language</th>
                                <th>Code</th>
                                <th>RTL</th>
                                <th>Default </th>
                                <th>Total</th>
                                <th>Done</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <div className="form-check form-check-md">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <h6 className="d-flex align-items-center fw-medium">
                                    <ImageWithBasePath
                                      src="assets/img/flags/us.png"
                                      className="me-2 avatar avatar-sm avatar-rounded"
                                     alt="Avatar Image"
                                    />
                                    English
                                  </h6>
                                </td>
                                <td>en</td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      defaultChecked
                                    />
                                  </div>
                                </td>
                                <td>1620</td>
                                <td>1296</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="circle-progress" data-value={80}>
                                      <span className="progress-left">
                                        <span className="progress-bar border-warning" />
                                      </span>
                                      <span className="progress-right">
                                        <span className="progress-bar border-warning" />
                                      </span>
                                    </div>
                                    <div className="progress-value ms-2">80%</div>
                                  </div>
                                </td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      href="#"
                                      className="btn btn-sm btn-icon btn-light border me-2"
                                    >
                                      <i className="ti ti-download" />
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      Web
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      App
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      Admin
                                    </Link>
                                    <Link
                                      href="#"
                                      className="btn btn-sm btn-icon btn-light border"
                                    >
                                      <i className="ti ti-trash" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="form-check form-check-md">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <h6 className="d-flex align-items-center fw-medium">
                                    <ImageWithBasePath
                                      src="assets/img/flags/ae.png"
                                      className="me-2 avatar avatar-sm avatar-rounded"
                                     alt="Avatar Image"
                                    />
                                    Arabic
                                  </h6>
                                </td>
                                <td>ar</td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>1620</td>
                                <td>810</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="circle-progress" data-value={50}>
                                      <span className="progress-left">
                                        <span className="progress-bar border-purple" />
                                      </span>
                                      <span className="progress-right">
                                        <span className="progress-bar border-purple" />
                                      </span>
                                    </div>
                                    <div className="progress-value ms-2">50%</div>
                                  </div>
                                </td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      href="#"
                                      className="btn btn-sm btn-icon btn-light border me-2"
                                    >
                                      <i className="ti ti-download" />
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      Web
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      App
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      Admin
                                    </Link>
                                    <Link
                                      href="#"
                                      className="btn btn-sm btn-icon btn-light border"
                                    >
                                      <i className="ti ti-trash" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="form-check form-check-md">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <h6 className="d-flex align-items-center fw-medium">
                                    <ImageWithBasePath
                                      src="assets/img/flags/de.png"
                                      className="me-2 avatar avatar-sm avatar-rounded"
                                     alt="Avatar Image"
                                    />
                                    German
                                  </h6>
                                </td>
                                <td>de</td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>1620</td>
                                <td>972</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="circle-progress" data-value={70}>
                                      <span className="progress-left">
                                        <span className="progress-bar border-skyblue" />
                                      </span>
                                      <span className="progress-right">
                                        <span className="progress-bar border-skyblue" />
                                      </span>
                                    </div>
                                    <div className="progress-value ms-2">70%</div>
                                  </div>
                                </td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      href="#"
                                      className="btn btn-sm btn-icon btn-light border me-2"
                                    >
                                      <i className="ti ti-download" />
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      Web
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      App
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      Admin
                                    </Link>
                                    <Link
                                      href="#"
                                      className="btn btn-sm btn-icon btn-light border"
                                    >
                                      <i className="ti ti-trash" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="form-check form-check-md">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <h6 className="d-flex align-items-center fw-medium">
                                    <ImageWithBasePath
                                      src="assets/img/flags/fr.png"
                                      className="me-2 avatar avatar-sm avatar-rounded"
                                     alt="Avatar Image"
                                    />
                                    French
                                  </h6>
                                </td>
                                <td>fr</td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>1620</td>
                                <td>324</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="circle-progress" data-value={20}>
                                      <span className="progress-left">
                                        <span className="progress-bar border-danger" />
                                      </span>
                                      <span className="progress-right">
                                        <span className="progress-bar border-danger" />
                                      </span>
                                    </div>
                                    <div className="progress-value ms-2">20%</div>
                                  </div>
                                </td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <Link
                                      href="#"
                                      className="btn btn-sm btn-icon btn-light border me-2"
                                    >
                                      <i className="ti ti-download" />
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      Web
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      App
                                    </Link>
                                    <Link
                                      href={routes.languageWeb}
                                      className="btn btn-sm border me-2"
                                    >
                                      Admin
                                    </Link>
                                    <Link
                                      href="#"
                                      className="btn btn-sm btn-icon btn-light border"
                                    >
                                      <i className="ti ti-trash" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
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
      </>


    </div>
  )
}


export default LanguageComponent;
