import React from 'react'
import TenantStorageChart from './storageUsageChart'
import ImageWithBasePath from '@/core/common/imageWithBasePath'
import Link from 'next/link'

const TenantUsageMetricsModal = () => {
    return (
        <>
            {/* View Invoice */}
            <div className="modal fade" id="view_details">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4>Tenant Usage Detail</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-between align-items-center p-4 mb-4">
                                <div className="d-flex align-items-center file-name-icon">
                                    <span className="avatar avatar-lg border rounded-circle">
                                        <ImageWithBasePath
                                            src="assets/img/company/company-01.svg"
                                            className="img-fluid"
                                            alt="img"
                                        />
                                    </span>
                                    <div className="ms-2">
                                        <h6 className="fw-medium">
                                            <Link href="#">BrightWave Innovations</Link>
                                        </h6>
                                        <p className="text-gray-5 fs-14">michael@example.com</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="badge badge-success dlign-items-center badge-xs">
                                        <i className="ti ti-point-filled me-1" />
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div className="row row-gap-3 mb-4">
                                <div className="col-md-12 col-lg-6">
                                    <h5 className="mb-3">Storage Usage Info</h5>
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <div className="mb-3 ">
                                                <TenantStorageChart />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="mb-0 text-gray-5">
                                                        <i className="ti ti-circle-filled fs-8 text-secondary me-2" />
                                                        Database :
                                                    </p>
                                                    <span className="text-gray-9 fw-medium ms-2 fs-14">
                                                        4.34 GB
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="mb-0 text-gray-5">
                                                        <i className="ti ti-circle-filled fs-8 text-skyblue me-2" />
                                                        Image :
                                                    </p>
                                                    <span className="text-gray-9 fw-medium ms-2 fs-14">
                                                        3.10 GB
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="mb-0 text-gray-5">
                                                        <i className="ti ti-circle-filled fs-8 text-info me-2" />
                                                        Videos :
                                                    </p>
                                                    <span className="text-gray-9 fw-medium ms-2 fs-14">
                                                        2.48 GB
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="mb-0 text-gray-5 text-nowrap">
                                                        <i className="ti ti-circle-filled fs-8 text-warning me-2" />
                                                        Documentation :
                                                    </p>
                                                    <span className="text-gray-9 fw-medium ms-2 fs-14 text-nowrap">
                                                        1.86 GB
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="mb-0 text-gray-5">
                                                        <i className="ti ti-circle-filled fs-8 text-primary me-2" />
                                                        Audio :
                                                    </p>
                                                    <span className="text-gray-9 fw-medium ms-2 fs-14">
                                                        0.62 GB
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12 col-lg-6">
                                    <h5 className="mb-3">Notificatoions Info</h5>
                                    <div className="row align-items-center">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <div className="notification-chart">
                                                    <div className="tenent-chart">
                                                        <div className="text-center d-flex align-items-center justify-content-center flex-column bg-primary rounded-circle chart-stage-1">
                                                            <h6 className="text-white">540</h6>
                                                        </div>
                                                        <div className="text-center d-flex align-items-center justify-content-center flex-column bg-transparent-purple rounded-circle chart-stage-3">
                                                            <h6 className="text-purple">920</h6>
                                                        </div>
                                                        <div className="text-center d-flex align-items-center justify-content-center flex-column bg-transparent-skyblue rounded-circle chart-stage-4">
                                                            <h6 className="text-skyblue">310</h6>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-around align-items-center mt-5 pt-3">
                                                <p className="mb-0 text-gray-5">
                                                    <i className="ti ti-circle-filled fs-8 text-primary me-2" />
                                                    Push
                                                </p>
                                                <p className="mb-0 text-gray-5">
                                                    <i className="ti ti-circle-filled fs-8 text-purple me-2" />
                                                    Push
                                                </p>
                                                <p className="mb-0 text-gray-5">
                                                    <i className="ti ti-circle-filled fs-8 text-skyblue me-2" />
                                                    SMS
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-light p-4">
                                <div className="border-bottom mb-4">
                                    <h6 className="fw-medium mb-3">Basic Info</h6>
                                    <div className="row row-gap-3  mb-4">
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Active Users</p>
                                            <span className="text-gray-9">82</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Total Logins</p>
                                            <span className="text-gray-9">18,230</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">
                                                Avg. Session Duration
                                            </p>
                                            <span className="text-gray-9">30 mins</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Peak Usage Time</p>
                                            <span className="text-gray-9">10:00 AM – 12:00 PM</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-bottom mb-4">
                                    <h6 className="fw-medium mb-3">Most Module Usage Info</h6>
                                    <div className="row row-gap-3  mb-4">
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">HR Module</p>
                                            <span className="text-gray-9">2,430 actions</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Payroll Module</p>
                                            <span className="text-gray-9">1,810 actions</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Attendance Module</p>
                                            <span className="text-gray-9">680 actions</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Contacts</p>
                                            <span className="text-gray-9">540 actions</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-bottom mb-4">
                                    <h6 className="fw-medium mb-3">API Usage Info</h6>
                                    <div className="row row-gap-3  mb-4">
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">API Calls</p>
                                            <span className="text-gray-9">18,230</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Records Created</p>
                                            <span className="text-gray-9">4,920</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Records Updated</p>
                                            <span className="text-gray-9">1,110</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Records Deleted</p>
                                            <span className="text-gray-9">210</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    <h6 className="fw-medium mb-3">Tickets Info</h6>
                                    <div className="row row-gap-3">
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Total Tickets</p>
                                            <span className="text-gray-9">20</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Tickets Resolved</p>
                                            <span className="text-gray-9">15</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Tickets Pending</p>
                                            <span className="text-gray-9">5</span>
                                        </div>
                                        <div className="col-lg-3 col-md-6">
                                            <p className="fs-12 mb-0 text-gray-5">Avg. Resolution Time</p>
                                            <span className="text-gray-9">6 hrs 20 mins</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /View Invoice */}
        </>
    )
}

export default TenantUsageMetricsModal