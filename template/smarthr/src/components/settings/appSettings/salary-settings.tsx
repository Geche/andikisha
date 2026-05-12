"use client";

import Link from "next/link";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import React from "react";
import { all_routes } from "@/routes/all_routes";


const SalarysettingsComponent: React.FC = () => {
  const routes = all_routes;

  // Example state (expand logic as needed)
  // const [form, setForm] = React.useState<SalarySettingsForm>(...);

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
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link href={routes.adminDashboard}>
                        <i className="ti ti-smart-home" aria-hidden="true" />
                        <span className="visually-hidden">Dashboard</span>
                      </Link>
                    </li>
                    <li className="breadcrumb-item">App Settings</li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Salary Setting
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
            {/* /Breadcrumb */}
            <ul className="nav nav-tabs nav-tabs-solid bg-transparent border-bottom mb-3" role="tablist">
              <li className="nav-item">
                <Link className="nav-link" href={routes.profilesettings}>
                  <i className="ti ti-settings me-2" aria-hidden="true" />
                  General Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={routes.bussinessSettings}>
                  <i className="ti ti-world-cog me-2" aria-hidden="true" />
                  Website Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" href={routes.salarySettings} aria-current="page">
                  <i className="ti ti-device-ipad-horizontal-cog me-2" aria-hidden="true" />
                  App Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={routes.emailSettings}>
                  <i className="ti ti-server-cog me-2" aria-hidden="true" />
                  System Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={routes.paymentGateways}>
                  <i className="ti ti-settings-dollar me-2" aria-hidden="true" />
                  Financial Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={routes.customCss}>
                  <i className="ti ti-settings-2 me-2" aria-hidden="true" />
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
                        href={routes.salarySettings}
                        className="d-inline-flex align-items-center rounded active py-2 px-3"
                        aria-current="page"
                      >
                        <i className="ti ti-arrow-badge-right me-2" aria-hidden="true" />
                        Salary Settings
                      </Link>
                      <Link
                        href={routes.approvalSettings}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Approval Settings
                      </Link>
                      <Link
                        href={routes.invoiceSettings}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Invoice Settings
                      </Link>
                      <Link
                        href={routes.leaveType}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Leave Type
                      </Link>
                      <Link
                        href={routes.customFields}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Custom Fields
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-9">
                <div className="card">
                  <div className="card-body">
                    <div className="border-bottom mb-3 pb-3">
                      <h4>Salary Settings</h4>
                    </div>
                    <form>
                      <div className="border-bottom mb-3">
                        <div className="row"></div>
                        <div className="row">
                          <div className="col-md-4 d-flex">
                            <div className="card flex-fill">
                              <div className="card-body pb-1">
                                <div className="content-head d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                  <h5>DA &amp; HRA</h5>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      id="flexSwitchCheckDefault"
                                      aria-label="Enable DA & HRA"
                                    />
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label" htmlFor="da">
                                    DA (%)
                                  </label>
                                  <input type="text" className="form-control" id="da" />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label" htmlFor="hra">
                                    HRA (%)
                                  </label>
                                  <input type="text" className="form-control" id="hra" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 d-flex">
                            <div className="card flex-fill">
                              <div className="card-body pb-1">
                                <div className="content-head d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                  <h5>Provident Fund</h5>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      id="flexSwitchCheckDefault2"
                                      aria-label="Enable Provident Fund"
                                    />
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label" htmlFor="pf-employee">
                                    Employee Share (%)
                                  </label>
                                  <input type="text" className="form-control" id="pf-employee" />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label" htmlFor="pf-org">
                                    Organization Share (%)
                                  </label>
                                  <input type="text" className="form-control" id="pf-org" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 d-flex">
                            <div className="card flex-fill">
                              <div className="card-body pb-1">
                                <div className="content-head d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                  <h5>ESI</h5>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      id="flexSwitchCheckDefault3"
                                      aria-label="Enable ESI"
                                    />
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label" htmlFor="esi-employee">
                                    Employee Share (%)
                                  </label>
                                  <input type="text" className="form-control" id="esi-employee" />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label" htmlFor="esi-org">
                                    Organization Share (%)
                                  </label>
                                  <input type="text" className="form-control" id="esi-org" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-bottom mb-3">
                        <div className="row">
                          <div className="col-md-12">
                            <div className="card">
                              <div className="card-body pb-1">
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                  <h5>
                                    TDS <span> Annual Salary</span>
                                  </h5>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      id="flexSwitchCheckDefault4"
                                      aria-label="Enable TDS"
                                    />
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-12">
                                    <div className="add-salary-info">
                                      <div className="row">
                                        <div className="col-md-4">
                                          <div className="mb-3">
                                            <label className="form-label" htmlFor="salary-from">
                                              Salary From
                                            </label>
                                            <input
                                              type="text"
                                              className="form-control"
                                              id="salary-from"
                                            />
                                          </div>
                                        </div>
                                        <div className="col-md-4">
                                          <div className="mb-3">
                                            <label className="form-label" htmlFor="salary-to">
                                              Salary To
                                            </label>
                                            <input
                                              type="text"
                                              className="form-control"
                                              id="salary-to"
                                            />
                                          </div>
                                        </div>
                                        <div className="col-md-4">
                                          <div className="d-flex align-items-center">
                                            <div className="mb-3 flex-fill">
                                              <label className="form-label" htmlFor="percentage">
                                                Percentage
                                              </label>
                                              <input
                                                type="text"
                                                className="form-control"
                                                id="percentage"
                                              />
                                            </div>
                                            <div className="d-flex align-items-center pt-3 ms-3">
                                              <button
                                                type="button"
                                                className="avatar avatar-md rounded bg-gray add-salary-btn text-primary"
                                                aria-label="Add Salary Range"
                                              >
                                                <i className="ti ti-plus" aria-hidden="true" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {/* Repeat salary range rows as needed */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-light border me-3"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
            <p className="mb-0">2014 - 2026 © SmartHR.</p>
            <p>
              Designed &amp; Developed By{" "}
              <Link href="#" className="text-primary">
                Dreams
              </Link>
            </p>
          </footer>
        </div>
        {/* /Page Wrapper */}
      </>
    </div>
  );
};

export default SalarysettingsComponent;
