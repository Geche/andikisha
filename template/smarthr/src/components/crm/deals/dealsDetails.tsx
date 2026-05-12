"use client";

import CommonTabs from '../common-components'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import CollapseHeader from '../../../core/common/collapse-header/collapse-header'
import CrmsModal from '../../../core/modals/crms_modal'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { all_routes } from '@/routes/all_routes';
import Link from 'next/link';

function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return (
    <div className="alert alert-danger my-3" role="alert">
      <h5>Something went wrong.</h5>
      <div className="mb-2">{errorMessage}</div>
      <button className="btn btn-sm btn-primary" onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

const DealsDetailsComponent = () => {
  const routes = all_routes
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          <div className="row align-items-center row-gap-3 mb-4">
            <div className="col-sm-6">
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <h6 className="fw-medium d-inline-flex align-items-center me-2">
                  <Link href={routes.dealsList}>
                    <i className="ti ti-arrow-left me-2" />
                    Deals
                  </Link>
                  <span className="text-gray d-inline-flex ms-2">
                    / Website Redesign
                  </span>
                </h6>
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-git-branch me-1" />
                    Marketing Pipeline
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Marketing Pipeline
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Deal Pipeline
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="d-flex justify-content-sm-end">
                <div className="head-icons ms-2">
                  <CollapseHeader />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4 theiaStickySidebar">
              <div className="card card-bg-1 sticky-class">
                <div className="card-body p-0">
                  <span className="avatar avatar-xl border text-dark bg-white rounded-circle m-auto d-flex mb-2">
                    WR
                  </span>
                  <div className="text-center px-3 pb-3 border-bottom">
                    <h5 className="d-flex align-items-center justify-content-center mb-1">
                      Website Redesign
                      <span className="avatar avatar-sm avatar-rounded bg-light ms-2">
                        <i className="ti ti-star-filled text-warning fs-14" />
                      </span>
                    </h5>
                    <p className="text-dark mb-1">
                      1861 Bayonne Ave, Manchester, NJ, 08759
                    </p>
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="badge badge-dark-transparent me-2">
                        <i className="ti ti-lock me-1" />
                        Private
                      </span>
                      <span className="badge badge-success-transparent">
                        <i className="ti ti-thumb-up me-1" />
                        Won
                      </span>
                    </div>
                  </div>
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6>Deals information</h6>
                      <button
                        type="button"
                        className="btn btn-icon btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#edit_company"
                        aria-label="Edit deal"
                      >
                        <i className="ti ti-edit" />
                      </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-gender-male me-2" />
                        Date Created
                      </span>
                      <p className="text-dark">10 Jan 2024, 11:45 pm</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-phone me-2" />
                        Probability - Win
                      </span>
                      <p className="text-dark">85%</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-phone me-2" />
                        Deal Value
                      </span>
                      <p className="text-dark">$4,50,000 </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-gender-male me-2" />
                        Due Date
                      </span>
                      <p className="text-dark">25 Jan 2024, 11:45 pm</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-phone me-2" />
                        Follow Up
                      </span>
                      <p className="text-dark">25 Jan 2024</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-phone me-2" />
                        Source
                      </span>
                      <p className="text-dark">Google</p>
                    </div>
                  </div>
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6>Deal Owner</h6>
                      <button type="button" className="btn btn-icon btn-sm" aria-label="Edit owner">
                        <i className="ti ti-edit" />
                      </button>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <span className="avatar avatar-md avatar-rounded me-2">
                        <ImageWithBasePath src="assets/img/profiles/avatar-01.jpg" alt="Sharon Roy Profile" />
                      </span>
                      <h6>Sharon Roy</h6>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-md avatar-rounded me-2">
                        <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="Vaughan Lewis Profile" />
                      </span>
                      <h6>Vaughan Lewis</h6>
                    </div>
                  </div>
                  <div className="p-3 border-bottom">
                    <h5 className="mb-3">Tags</h5>
                    <div className="d-flex align-items-center">
                      <span className="badge badge-soft-success me-3">Collab</span>
                      <span className="badge badge-soft-warning">Rated</span>
                    </div>
                  </div>
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5>Company</h5>
                      <button
                        type="button"
                        className="text-primary d-inline-flex align-items-center btn btn-link p-0"
                        data-bs-toggle="modal"
                        data-bs-target="#add_company"
                        aria-label="Add new company"
                      >
                        <i className="ti ti-circle-plus me-1" />
                        Add New
                      </button>
                    </div>
                    <div className="d-flex align-items-center file-name-icon mb-3">
                      <Link
                        href="#"
                        className="avatar avatar-md border rounded-circle"
                      >
                        <ImageWithBasePath
                          src="assets/img/company/company-01.svg"
                          className="img-fluid"
                          alt="BrightWave Innovations Logo"
                        />
                      </Link>
                      <div className="ms-2">
                        <h6 className="fw-medium">BrightWave Innovations</h6>
                        <span className="d-block">bwi.example.com</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center file-name-icon">
                      <Link
                        href="#"
                        className="avatar avatar-md border rounded-circle"
                      >
                        <ImageWithBasePath
                          src="assets/img/company/company-02.svg"
                          className="img-fluid"
                          alt="Stellar Dynamics Logo"
                        />
                      </Link>
                      <div className="ms-2">
                        <h6 className="fw-medium">Stellar Dynamics</h6>
                        <span className="d-block">sd.example.com</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6>Other information</h6>
                      <button type="button" className="btn btn-icon btn-sm" aria-label="Edit other info">
                        <i className="ti ti-edit" />
                      </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-calendar-check me-2" />
                        Last Modified
                      </span>
                      <p className="text-dark">10 Jan 2024, 11:45 pm</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-user-check me-2" />
                        Modified By
                      </span>
                      <p className="text-dark d-flex align-items-center">
                        <span className="avatar avatar-sm avatar-rounded me-2">
                          <ImageWithBasePath src="assets/img/profiles/avatar-19.jpg" alt="Darlee Robertson Profile" />
                        </span>
                        Darlee Robertson
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ErrorBoundary FallbackComponent={FallbackComponent}>
              <CommonTabs />
            </ErrorBoundary>
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
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <CrmsModal />
      </ErrorBoundary>
    </>
  )
}

export default DealsDetailsComponent