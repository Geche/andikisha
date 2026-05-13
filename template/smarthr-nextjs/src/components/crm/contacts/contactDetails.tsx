"use client";

import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import CommonTabs from '../common-components'
import CollapseHeader from '../../../core/common/collapse-header/collapse-header'
import CrmsModal from '../../../core/modals/crms_modal'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { all_routes } from '@/routes/all_routes'
import Link from 'next/link'

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

const ContactDetailsComponent = () => {
  const routes = all_routes
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="row align-items-center mb-4">
            <div className="col-sm-6">
              <h6 className="fw-medium d-inline-flex align-items-center mb-3 mb-sm-0">
                <Link href={routes.contactList}>
                  <i className="ti ti-arrow-left me-2" />
                  Contacts
                </Link>
                <span className="text-gray d-inline-flex ms-2">
                  / Darlee Robertson
                </span>
              </h6>
            </div>
            <div className="col-sm-6">
              <div className="d-flex align-items-center justify-content-sm-end">
                <button
                  type="button"
                  className="btn btn-primary d-inline-flex align-items-center me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#add_deals"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Deal
                </button>
                <button
                  type="button"
                  className="btn btn-dark d-inline-flex align-items-center"
                >
                  <i className="ti ti-mail me-2" />
                  Send Email
                </button>
                <div className="head-icons ms-2 mb-0">
                  <CollapseHeader />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4 theiaStickySidebar">
              <div className="card card-bg-1 sticky-class">
                <div className="card-body p-0">
                  <span className="avatar avatar-xl avatar-rounded border border-2 border-white m-auto d-flex mb-2">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-19.jpg"
                      className="w-auto h-auto"
                      alt="Darlee Robertson Profile"
                    />
                  </span>
                  <div className="text-center px-3 pb-3 border-bottom">
                    <h5 className="d-flex align-items-center justify-content-center mb-1">
                      Darlee Robertson{" "}
                      <i className="ti ti-discount-check-filled text-success ms-1" />
                    </h5>
                    <p className="text-dark mb-1">BrightWave Innovations</p>
                    <span className="badge bg-pink-transparent">
                      Facility Manager
                    </span>
                  </div>
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6>Basic information</h6>
                      <Link
                        href="#"
                        className="btn btn-icon btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#edit_contact"
                      >
                        <i className="ti ti-edit" />
                      </Link>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-phone me-2" />
                        Phone
                      </span>
                      <p className="text-dark">(163) 2459 315</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-mail-check me-2" />
                        Email
                      </span>
                      <Link
                        href="#"
                        className="text-info d-inline-flex align-items-center"
                      >
                        darlee@example.com <i className="ti ti-copy text-dark ms-2" />
                      </Link>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-gender-male me-2" />
                        Gender
                      </span>
                      <p className="text-dark">Male</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-cake me-2" />
                        Birthday
                      </span>
                      <p className="text-dark">24th July 2000</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-map-pin-check me-2" />
                        Address
                      </span>
                      <p className="text-dark text-end">
                        1861 Bayonne Ave, <br /> Manchester, NJ, 08759
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6>Other Information</h6>
                      <Link href="#" className="btn btn-icon btn-sm">
                        <i className="ti ti-edit" />
                      </Link>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-e-passport me-2" />
                        Language
                      </span>
                      <p className="text-dark">English</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-mail-check me-2" />
                        Currency
                      </span>
                      <p className="text-dark">United States dollar</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-globe me-2" />
                        Last Modified
                      </span>
                      <p className="text-dark">27 Sep 24, 11:45 pm </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-bookmark-plus me-2" />
                        Source
                      </span>
                      <p className="text-dark">Paid Campaign</p>
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
                      >
                        <i className="ti ti-circle-plus me-1" />
                        Add New
                      </button>
                    </div>
                    <div className="d-flex align-items-center file-name-icon">
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
                  </div>
                  <div className="p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6>Social Links</h6>
                      <Link href="#" className="btn btn-icon btn-sm">
                        <i className="ti ti-edit" />
                      </Link>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <Link href="#" className="me-2">
                        <ImageWithBasePath src="assets/img/social/social-01.svg" alt="Facebook" />
                      </Link>
                      <Link href="#" className="me-2">
                        <ImageWithBasePath src="assets/img/social/social-06.svg" alt="LinkedIn" />
                      </Link>
                      <Link href="#" className="me-2">
                        <ImageWithBasePath src="assets/img/social/social-02.svg" alt="Twitter" />
                      </Link>
                      <Link href="#" className="me-2">
                        <ImageWithBasePath src="assets/img/social/social-03.svg" alt="Instagram" />
                      </Link>
                      <Link href="#" className="me-2">
                        <ImageWithBasePath src="assets/img/social/social-04.svg" alt="YouTube" />
                      </Link>
                      <Link href="#" className="me-2">
                        <ImageWithBasePath src="assets/img/social/social-05.svg" alt="Pinterest" />
                      </Link>
                    </div>
                    <div className="row gx-2">
                      <div className="col-6">
                        <button
                          type="button"
                          className="d-flex align-items-center justify-content-center btn btn-dark"
                        >
                          <i className="ti ti-share-2 me-2" />
                          Share
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          type="button"
                          className="d-flex align-items-center justify-content-center btn btn-primary"
                        >
                          <i className="ti ti-trash me-2" />
                          Delete
                        </button>
                      </div>
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

export default ContactDetailsComponent