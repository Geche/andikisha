"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header"
import ImageWithBasePath from "@/core/common/imageWithBasePath"
import TenantSupportChart1 from "./charts/tenentSupportChart1"
import TenantSupportChart2 from "./charts/tenantSupportChart2"
import TenantSupportChart4 from "./charts/tenantSupportChart3"
import TenantSupportChart5 from "./charts/tenantSupportChart4"
import AddSupportTicketModa from "./modal/addSupportTicketModa"
import CommonFooter from "@/core/common/commonFooter/footer"
import { all_routes } from "@/routes/all_routes"
import Link from "next/link"

const TenantSupportTicketsComponent = () => {
    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Tenant Support Tickets</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Super Admin</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Tenant Support Tickets
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
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

                            <div className="ms-2 head-icons">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="row">
                        <div className="col-md-6 col-xl-3 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="row justify-content-between">
                                        <div className="col-8">
                                            <div className="flex-fill">
                                                <div className="rounded d-inline-flex align-items-center justify-content-center mb-3">
                                                    <span className="avatar avatar-lg rounded bg-primary-transparent ">
                                                        <i className="ti ti-ticket fs-20" />
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <h2 className="me-2">80</h2>
                                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                                        <span className="badge bg-transparent-purple d-inline-flex align-items-center">
                                                            <i className="ti ti-arrow-wave-right-down me-1" />
                                                            +5.50%
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="fs-12 fw-medium text-gray-5">
                                                    New Tickets
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-end">
                                                <TenantSupportChart1 />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-3 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-8">
                                            <div className="flex-fill">
                                                <div className="rounded d-inline-flex align-items-center justify-content-center mb-3">
                                                    <span className="avatar avatar-lg rounded bg-transparent-purple ">
                                                        <i className="ti ti-ticket fs-20" />
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <h2 className="me-2">25</h2>
                                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                                        <span className="badge bg-transparent-purple d-inline-flex align-items-center">
                                                            <i className="ti ti-arrow-wave-right-down me-1" />
                                                            +5.50%
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="fs-12 fw-medium text-gray-5">
                                                    Open Tickets
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-end">
                                                <TenantSupportChart2 />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-3 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-8">
                                            <div className="flex-fill">
                                                <div className="rounded d-inline-flex align-items-center justify-content-center mb-3">
                                                    <span className="avatar avatar-lg rounded bg-transparent-skyblue text-skyblue">
                                                        <i className="ti ti-ticket fs-20" />
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <h2 className="me-2">40</h2>
                                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                                        <span className="badge bg-transparent-purple d-inline-flex align-items-center">
                                                            <i className="ti ti-arrow-wave-right-down me-1" />
                                                            +5.50%
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="fs-12 fw-medium text-gray-5">
                                                    Pending Tickets
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-end">
                                                <TenantSupportChart4 />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-3 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-8">
                                            <div className="flex-fill">
                                                <div className="rounded d-inline-flex align-items-center justify-content-center mb-3">
                                                    <span className="avatar avatar-lg rounded bg-transparent-success text-success">
                                                        <i className="ti ti-ticket fs-20" />
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <h2 className="me-2">70</h2>
                                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                                        <span className="badge bg-transparent-purple d-inline-flex align-items-center">
                                                            <i className="ti ti-arrow-wave-right-down me-1" />
                                                            +5.50%
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="fs-12 fw-medium text-gray-5">
                                                    Solved Tickets
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-end">
                                                <TenantSupportChart5 />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                                <h5>Ticket List</h5>
                                <div className="d-flex align-items-center flex-wrap row-gap-3">
                                    <div className="dropdown me-2">
                                        <Link
                                            href="#"
                                            className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                                            data-bs-toggle="dropdown"
                                        >
                                            Priority
                                        </Link>
                                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                                            <li>
                                                <Link
                                                    href="#"
                                                    className="dropdown-item rounded-1"
                                                >
                                                    Priority
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="#"
                                                    className="dropdown-item rounded-1"
                                                >
                                                    High
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="#"
                                                    className="dropdown-item rounded-1"
                                                >
                                                    Low
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="#"
                                                    className="dropdown-item rounded-1"
                                                >
                                                    Medium
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="dropdown me-2">
                                        <Link
                                            href="#"
                                            className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
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
                                                    Open
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="#"
                                                    className="dropdown-item rounded-1"
                                                >
                                                    On Hold
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="#"
                                                    className="dropdown-item rounded-1"
                                                >
                                                    Reopened
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
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
                                                    Descending
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
                    </div>
                    <div className="row">
                        <div className="col-xl-9 col-md-8">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row row-gap-3">
                                        <div className="col-xl-3 col-lg-4 col-md-4">
                                            <div className="bg-light border rounded p-4 text-center">
                                                <p className="fs-12 fw-medium text-gray-9 mb-2">#TIC0016</p>
                                                <span className="badge badge-danger mb-2">
                                                    <i className="ti ti-point-filled me-1" />
                                                    High
                                                </span>
                                                <p className="fs-12 fw-medium text-gray-9 mb-0">15 Dec 2025</p>
                                            </div>
                                        </div>
                                        <div className="col-xl-9 col-lg-8 col-md-8">
                                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                                <h5>
                                                    Login not working{" "}
                                                    <span className="badge rounded-pill badge-info fs-10 text-white ms-2">
                                                        Access Issue
                                                    </span>
                                                </h5>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Link href={all_routes.tenentTicketDetails}>
                                                        <i className="ti ti-eye fs-16 text-gray-5" />
                                                    </Link>
                                                    <Link
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit_ticket"
                                                    >
                                                        <i className="ti ti-edit fs-16 text-gray-5" />
                                                    </Link>
                                                    <Link
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#delete_modal"
                                                    >
                                                        <i className="ti ti-trash fs-16 text-gray-5" />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-2">
                                                        Ticket Raised By
                                                    </h6>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="avatar avatar-md rounded-circle border p-1 flex-shrink-0">
                                                            <ImageWithBasePath
                                                                src="assets/img/company/company-01.svg"
                                                                className="rounded-circle"
                                                                alt="logo"
                                                            />
                                                        </span>
                                                        <p className="fw-medium text-gray-9 mb-0">
                                                            BrightWave Innovations
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-3">Assignee</h6>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <ImageWithBasePath
                                                            src="assets/img/agents/agent-11.jpg"
                                                            className="avatar avatar-xs rounded-circle"
                                                            alt="logo"
                                                        />
                                                        <p className="fw-medium text-gray-9 mb-0">Edgar Hansel</p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-3">Status</h6>
                                                    <div className="dropdown">
                                                        <Link
                                                            href="#"
                                                            className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                                                <i className="ti ti-point-filled text-success" />
                                                            </span>{" "}
                                                            Open
                                                        </Link>
                                                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-success" />
                                                                    </span>
                                                                    Open
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-danger" />
                                                                    </span>
                                                                    Close
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-purple d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-purple" />
                                                                    </span>
                                                                    New
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row row-gap-3">
                                        <div className="col-xl-3 col-lg-4 col-md-4">
                                            <div className="bg-light border rounded p-4 text-center">
                                                <p className="fs-12 fw-medium text-gray-9 mb-2">#TIC0015</p>
                                                <span className="badge badge-warning mb-2">
                                                    <i className="ti ti-point-filled me-1" />
                                                    Medium
                                                </span>
                                                <p className="fs-12 fw-medium text-gray-9 mb-0">10 Dec 2025</p>
                                            </div>
                                        </div>
                                        <div className="col-xl-9 col-lg-8 col-md-8">
                                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                                <h5>
                                                    HR module not loading{" "}
                                                    <span className="badge rounded-pill badge-pink fs-10 text-white ms-2">
                                                        Module Issue
                                                    </span>
                                                </h5>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Link href={all_routes.tenentTicketDetails}>
                                                        <i className="ti ti-eye fs-16 text-gray-5" />
                                                    </Link>
                                                    <Link
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit_ticket"
                                                    >
                                                        <i className="ti ti-edit fs-16 text-gray-5" />
                                                    </Link>
                                                    <Link
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#delete_modal"
                                                    >
                                                        <i className="ti ti-trash fs-16 text-gray-5" />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-2">
                                                        Ticket Raised By
                                                    </h6>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="avatar avatar-md rounded-circle border p-1 flex-shrink-0">
                                                            <ImageWithBasePath
                                                                src="assets/img/company/company-02.svg"
                                                                className="rounded-circle"
                                                                alt="logo"
                                                            />
                                                        </span>
                                                        <p className="fw-medium text-gray-9 mb-0">Ann Lynch</p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-3">Assignee</h6>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <ImageWithBasePath
                                                            src="assets/img/agents/agent-12.jpg"
                                                            className="avatar avatar-xs rounded-circle"
                                                            alt="logo"
                                                        />
                                                        <p className="fw-medium text-gray-9 mb-0">Edgar Hansel</p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-3">Status</h6>
                                                    <div className="dropdown">
                                                        <Link
                                                            href="#"
                                                            className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                                                <i className="ti ti-point-filled text-success" />
                                                            </span>{" "}
                                                            Open
                                                        </Link>
                                                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-success" />
                                                                    </span>
                                                                    Open
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-danger" />
                                                                    </span>
                                                                    Close
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-purple d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-purple" />
                                                                    </span>
                                                                    New
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row row-gap-3">
                                        <div className="col-xl-3 col-lg-4 col-md-4">
                                            <div className="bg-light border rounded p-4 text-center">
                                                <p className="fs-12 fw-medium text-gray-9 mb-2">#TIC0014</p>
                                                <span className="badge badge-success mb-2">
                                                    <i className="ti ti-point-filled me-1" />
                                                    Low
                                                </span>
                                                <p className="fs-12 fw-medium text-gray-9 mb-0">08 Dec 2025</p>
                                            </div>
                                        </div>
                                        <div className="col-xl-9 col-lg-8 col-md-8">
                                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                                <h5>
                                                    Unable to access dashboard{" "}
                                                    <span className="badge rounded-pill badge-info fs-10 text-white ms-2">
                                                        Access Issue
                                                    </span>
                                                </h5>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Link href={all_routes.tenentTicketDetails}>
                                                        <i className="ti ti-eye fs-16 text-gray-5" />
                                                    </Link>
                                                    <Link
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit_ticket"
                                                    >
                                                        <i className="ti ti-edit fs-16 text-gray-5" />
                                                    </Link>
                                                    <Link
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#delete_modal"
                                                    >
                                                        <i className="ti ti-trash fs-16 text-gray-5" />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-2">
                                                        Ticket Raised By
                                                    </h6>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="avatar avatar-md rounded-circle border p-1 flex-shrink-0">
                                                            <ImageWithBasePath
                                                                src="assets/img/company/company-03.svg"
                                                                className="rounded-circle"
                                                                alt="logo"
                                                            />
                                                        </span>
                                                        <p className="fw-medium text-gray-9 mb-0">
                                                            Aurora Technologies
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-3">Assignee</h6>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <ImageWithBasePath
                                                            src="assets/img/agents/agent-13.jpg"
                                                            className="avatar avatar-xs rounded-circle"
                                                            alt="logo"
                                                        />
                                                        <p className="fw-medium text-gray-9 mb-0">Juan Hermann</p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-3">Status</h6>
                                                    <div className="dropdown">
                                                        <Link
                                                            href="#"
                                                            className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                                                <i className="ti ti-point-filled text-success" />
                                                            </span>{" "}
                                                            Open
                                                        </Link>
                                                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-success" />
                                                                    </span>
                                                                    Open
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-danger" />
                                                                    </span>
                                                                    Close
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-purple d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-purple" />
                                                                    </span>
                                                                    New
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row row-gap-3">
                                        <div className="col-xl-3 col-lg-4 col-md-4">
                                            <div className="bg-light border rounded p-4 text-center">
                                                <p className="fs-12 fw-medium text-gray-9 mb-2">#TIC0013</p>
                                                <span className="badge badge-warning mb-2">
                                                    <i className="ti ti-point-filled me-1" />
                                                    Medium
                                                </span>
                                                <p className="fs-12 fw-medium text-gray-9 mb-0">02 Dec 2025</p>
                                            </div>
                                        </div>
                                        <div className="col-xl-9 col-lg-8 col-md-8">
                                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                                <h5>
                                                    Billing amount incorrect
                                                    <span className="badge rounded-pill badge-purple fs-10 text-white ms-2">
                                                        Billing &amp; Payments
                                                    </span>
                                                </h5>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Link href={all_routes.tenentTicketDetails}>
                                                        <i className="ti ti-eye fs-16 text-gray-5" />
                                                    </Link>
                                                    <Link
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit_ticket"
                                                    >
                                                        <i className="ti ti-edit fs-16 text-gray-5" />
                                                    </Link>
                                                    <Link
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#delete_modal"
                                                    >
                                                        <i className="ti ti-trash fs-16 text-gray-5" />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-2">
                                                        Ticket Raised By
                                                    </h6>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="avatar avatar-md rounded-circle border p-1 flex-shrink-0">
                                                            <ImageWithBasePath
                                                                src="assets/img/company/company-04.svg"
                                                                className="rounded-circle"
                                                                alt="logo"
                                                            />
                                                        </span>
                                                        <p className="fw-medium text-gray-9 mb-0">Quantum Nexus</p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-3">Assignee</h6>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <ImageWithBasePath
                                                            src="assets/img/agents/agent-14.jpg"
                                                            className="avatar avatar-xs rounded-circle"
                                                            alt="logo"
                                                        />
                                                        <p className="fw-medium text-gray-9 mb-0">Jessie Otero</p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <h6 className="fs-12 fw-normal text-gray-5 mb-3">Status</h6>
                                                    <div className="dropdown">
                                                        <Link
                                                            href="#"
                                                            className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                                                <i className="ti ti-point-filled text-success" />
                                                            </span>{" "}
                                                            Open
                                                        </Link>
                                                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-success" />
                                                                    </span>
                                                                    Open
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-danger" />
                                                                    </span>
                                                                    Close
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                                                                >
                                                                    <span className="rounded-circle bg-transparent-purple d-flex justify-content-center align-items-center me-2">
                                                                        <i className="ti ti-point-filled text-purple" />
                                                                    </span>
                                                                    New
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mb-4">
                                <Link href="#" className="btn btn-primary">
                                    <i className="ti ti-loader-3 me-1" />
                                    Load More
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-4">
                            <div className="card">
                                <div className="card-header">
                                    <h4>Ticket Categories</h4>
                                </div>
                                <div className="card-body p-0">
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                                            <Link href="#">Access Issue</Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">1</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                                            <Link href="#">Module Issue</Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">1</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                                            <Link href="#">Billing &amp; Payments</Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">0</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                                            <Link href="#">API / Integration Issues</Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">2</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between p-3">
                                            <Link href="#">Plan / Subscription Issues</Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">1</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-header">
                                    <h4>Support Agents</h4>
                                </div>
                                <div className="card-body p-0">
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                                            <span className="d-flex align-items-center">
                                                <ImageWithBasePath
                                                    src="assets/img/profiles/avatar-01.jpg"
                                                    className="avatar avatar-xs rounded-circle me-2"
                                                    alt="img"
                                                />
                                                Edgar Hansel
                                            </span>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">0</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                                            <span className="d-flex align-items-center">
                                                <ImageWithBasePath
                                                    src="assets/img/agents/agent-12.jpg"
                                                    className="avatar avatar-xs rounded-circle me-2"
                                                    alt="img"
                                                />
                                                Ann Lynch
                                            </span>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">1</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                                            <span className="d-flex align-items-center">
                                                <ImageWithBasePath
                                                    src="assets/img/agents/agent-13.jpg"
                                                    className="avatar avatar-xs rounded-circle me-2"
                                                    alt="img"
                                                />
                                                Juan Hermann
                                            </span>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">0</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between p-3">
                                            <span className="d-flex align-items-center">
                                                <ImageWithBasePath
                                                    src="assets/img/agents/agent-14.jpg"
                                                    className="avatar avatar-xs rounded-circle me-2"
                                                    alt="img"
                                                />
                                                Jessie Otero
                                            </span>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-xs bg-dark rounded-circle">2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
            <AddSupportTicketModa />
        </>
    )
}

export default TenantSupportTicketsComponent