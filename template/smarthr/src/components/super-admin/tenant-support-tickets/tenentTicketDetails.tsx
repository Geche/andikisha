"use client";
import CommonFooter from "@/core/common/commonFooter/footer"
import CommonSelect from "@/core/common/commonSelect"
import ImageWithBasePath from "@/core/common/imageWithBasePath"
import { Assign_To, priority, Ticket_Status } from "@/core/common/selectoption/selectoption"
import TenentTicketDetailsModal from "./modal/tenentTicketDetailsModal"
import { all_routes } from "@/routes/all_routes"
import Link from "next/link"

const TenentTicketDetailsComponent = () => {
    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="mb-2">
                            <h6 className="fw-medium d-flex align-items-center">
                                <Link href={all_routes.tenantSupportTickets}>
                                    <i className="ti ti-arrow-left me-2" />
                                    Ticket Details
                                </Link>
                            </h6>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
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
                                    data-bs-target="#add_ticket"
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Add New Ticket
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="row">
                        <div className="col-xl-9 col-md-8">
                            <div className="card">
                                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                                    <h5 className="text-info fw-medium">Access Issue</h5>
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-danger me-3">
                                            <i className="ti ti-circle-filled fs-5 me-1" />
                                            High
                                        </span>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="dropdown-toggle px-2 py-1 btn btn-white d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                Mark as Private
                                            </Link>
                                            <ul className="dropdown-menu  dropdown-menu-end p-2">
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Mark as Private
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Mark as Public{" "}
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div>
                                        <div className="d-flex justify-content-between flex-wrap border-bottom mb-3">
                                            <div className="d-flex align-items-center flex-wrap">
                                                <div className="mb-3">
                                                    <span className="badge badge-info rounded-pill mb-2">
                                                        Tic - 001
                                                    </span>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <h5 className="fw-semibold me-2">Login not working</h5>
                                                        <span className="badge bg-outline-pink d-flex align-items-center ms-1">
                                                            <i className="ti ti-circle-filled fs-5 me-1" />
                                                            Open
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center flex-wrap row-gap-2">
                                                        <p className="d-flex align-items-center mb-0 me-2">
                                                            <ImageWithBasePath
                                                                src="assets/img/profiles/avatar-06.jpg"
                                                                className="avatar avatar-xs rounded-circle me-2"
                                                                alt="img"
                                                            />
                                                            Assigned to{" "}
                                                            <span className="text-dark ms-1">Edgar Hansel</span>
                                                        </p>
                                                        <p className="d-flex align-items-center mb-0 me-2">
                                                            <i className="ti ti-calendar-bolt me-1" />
                                                            Updated 10 hours ago
                                                        </p>
                                                        <p className="d-flex align-items-center mb-0">
                                                            <i className="ti ti-message-circle-share me-1" />9
                                                            Comments
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <Link href="#" className="btn btn-dark">
                                                    <i className="ti ti-arrow-forward-up me-1" />
                                                    Post Reply
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="border-bottom mb-3 pb-3">
                                            <div>
                                                <p className="mb-0">
                                                    For the past two days, we have been unable to log in to
                                                    our accounts. Every time we enter our correct email and
                                                    password, the page either refreshes without any message or
                                                    shows “Invalid Credentials.” We have confirmed that the
                                                    credentials are correct, but the issue continues.
                                                </p>
                                                <p>
                                                    We also attempted to reset our passwords, but none of us
                                                    received the password reset email. We checked our inboxes,
                                                    spam folders, and promotion folders no email arrived. This
                                                    issue is preventing our team from accessing the dashboard
                                                    and is affecting our daily operations.
                                                </p>
                                            </div>
                                            <div className="mt-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <span className="avatar avatar-lg avatar-rounded me-2 flex-shrink-0">
                                                        <ImageWithBasePath src="assets/img/users/user-09.jpg" alt="Img" />
                                                    </span>
                                                    <div>
                                                        <h6 className="fw-medium mb-1">Michael Coleman</h6>
                                                        <p>
                                                            <i className="ti ti-calendar-bolt me-1" />
                                                            Updated 5 hours ago
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="mb-3">
                                                        <p>
                                                            This issue is preventing access to the dashboard and
                                                            blocking daily operations for our team
                                                        </p>
                                                    </div>
                                                    <span className="badge bg-light fw-normal">
                                                        Screenshot.png
                                                        <i className="ti ti-download ms-1" />
                                                    </span>
                                                    <div className="d-flex align-items-center mt-3">
                                                        <Link
                                                            href="#"
                                                            className="d-inline-flex align-items-center text-primary fw-medium me-3"
                                                        >
                                                            <i className="ti ti-arrow-forward-up me-1" />
                                                            Reply
                                                        </Link>
                                                        <p>
                                                            <Link href="#" className="d-flex align-items-center">
                                                                <i className="ti ti-message-circle-share me-1" />1
                                                                Comment
                                                            </Link>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-bottom mb-3 pb-3">
                                            <div>
                                                <div className="d-flex align-items-center mb-3">
                                                    <span className="avatar avatar-ld avatar-rounded me-2 flex-shrink-0">
                                                        <ImageWithBasePath src="assets/img/users/user-03.jpg" alt="Img" />
                                                    </span>
                                                    <div>
                                                        <h6 className="mb-1">Edgar Hansel</h6>
                                                        <p>
                                                            <i className="ti ti-calendar-bolt me-1" />
                                                            Updated 5 hours ago
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="mb-3">
                                                        <p>
                                                            Please verify if the authentication service is running
                                                            normally. Also check if the user account is locked due
                                                            to multiple failed attempts.
                                                        </p>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <span className="badge bg-light fw-normal">
                                                            Screenshot.png
                                                            <i className="ti ti-download ms-1" />
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center mt-3">
                                                        <Link
                                                            href="#"
                                                            className="d-inline-flex align-items-center text-primary fw-medium me-3"
                                                        >
                                                            <i className="ti ti-arrow-forward-up me-1" />
                                                            Reply
                                                        </Link>
                                                        <p>
                                                            <Link href="#" className="d-flex align-items-center">
                                                                <i className="ti ti-message-circle-share me-1" />5
                                                                Comments
                                                            </Link>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div>
                                                <div className="d-flex align-items-center mb-3">
                                                    <span className="avatar avatar-lg avatar-rounded me-2 flex-shrink-0">
                                                        <ImageWithBasePath
                                                            src="assets/img/profiles/avatar-04.jpg"
                                                            alt="Img"
                                                        />
                                                    </span>
                                                    <div>
                                                        <h6 className="mb-1">James Hendriques</h6>
                                                        <p>
                                                            <i className="ti ti-calendar-bolt me-1" />
                                                            Updated 5 hours ago
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="mb-3">
                                                        <p>
                                                            Check the email service logs to confirm if password
                                                            reset emails failed or were blocked. Also confirm if
                                                            SMTP configuration is active or not.
                                                        </p>
                                                    </div>
                                                    <div className="d-flex align-items-center mt-3">
                                                        <Link
                                                            href="#"
                                                            className="d-inline-flex align-items-center text-primary fw-medium me-3"
                                                        >
                                                            <i className="ti ti-arrow-forward-up me-1" />
                                                            Reply
                                                        </Link>
                                                        <p>
                                                            <Link href="#" className="d-flex align-items-center">
                                                                <i className="ti ti-message-circle-share me-1" />9
                                                                Comments
                                                            </Link>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-4">
                            <div className="card">
                                <div className="card-header p-3">
                                    <h4>Ticket Info</h4>
                                </div>
                                <div className="card-body p-0">
                                    <div className="border-bottom p-3">
                                        <div className="mb-3">
                                            <label className="form-label">Change Priority</label>
                                            <CommonSelect
                                                className='select'
                                                options={priority}
                                                defaultValue={priority[3]}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Assign To</label>
                                            <CommonSelect
                                                className='select'
                                                options={Assign_To}
                                                defaultValue={Assign_To[2]}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Ticket Status</label>
                                            <CommonSelect
                                                className='select'
                                                options={Ticket_Status}
                                                defaultValue={Ticket_Status[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center border-bottom p-3">
                                        <span className="avatar avatar-md border p-1 rounded-circle me-2 flex-shrink-0">
                                            <ImageWithBasePath
                                                src="assets/img/company/company-01.svg"
                                                className="rounded-circle"
                                                alt="Img"
                                            />
                                        </span>
                                        <div>
                                            <span className="fs-12">User</span>
                                            <p className="text-dark">BrightWave Innovations</p>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center border-bottom p-3">
                                        <span className="avatar avatar-md me-2 flex-shrink-0">
                                            <ImageWithBasePath
                                                src="assets/img/users/user-05.jpg"
                                                className="rounded-circle"
                                                alt="Img"
                                            />
                                        </span>
                                        <div>
                                            <span className="fs-12">Support Agent</span>
                                            <p className="text-dark">Edgar Hansel</p>
                                        </div>
                                    </div>
                                    <div className="border-bottom p-3">
                                        <span className="fs-12">Category</span>
                                        <p className="text-dark">Access Issue</p>
                                    </div>
                                    <div className="border-bottom p-3">
                                        <span className="fs-12">Email</span>
                                        <p className="text-dark">michael@example.com</p>
                                    </div>
                                    <div className="p-3">
                                        <span className="fs-12">Last Updated / Closed On</span>
                                        <p className="text-dark">15 Dec 2025</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
            <TenentTicketDetailsModal />
        </>
    )
}

export default TenentTicketDetailsComponent