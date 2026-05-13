"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Table from "@/core/common/dataTable/index";
import CommonFooter from "@/core/common/commonFooter/footer";
import { workFromHomeData } from "@/core/data/json/workFromHomeData";
import PredefinedDatePicker from "@/core/common/datePicker";
import WorkFromHomeModal from "./modal/workFromHomeModal";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";


interface WorkFromHomeData {
    EmpId: string;
    Image1: string;
    name: string;
    Designation: string;
    Date: string;
    Shift: string;
    Reason: string;
    Status: string;
}
const WorkFromHomeComponent = () => {
    const data: WorkFromHomeData[] = workFromHomeData;
    const columns = [
        {
            title: "Emp Id",
            dataIndex: "EmpId",
            render: (text: string, _record: WorkFromHomeData) => (
                <Link href={all_routes.employeedetails} className="link-default" data-bs-toggle="offcanvas" data-bs-target="#probation_details">
                    {text}
                </Link>
            ),
            sorter: (a: WorkFromHomeData, b: WorkFromHomeData) => a.EmpId.length - b.EmpId.length,
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (_text: string, record: WorkFromHomeData) => (
                <div className="d-flex align-items-center file-name-icon">
                    <Link href="#" className="avatar avatar-md border avatar-rounded">
                        <ImageWithBasePath
                            src={`assets/img/users/${record.Image1}`}
                            className="img-fluid"
                            alt={`${record.name} logo`}
                        />
                    </Link>
                    <div className="ms-2">
                        <h6 className="fw-medium">
                            <Link href="#">{record.name}</Link>
                        </h6>
                    </div>
                </div>
            ),
            sorter: (a: WorkFromHomeData, b: WorkFromHomeData) => a.name.length - b.name.length,
        },
        {
            title: "Designation",
            dataIndex: "Designation",
            sorter: (a: WorkFromHomeData, b: WorkFromHomeData) => a.Designation.length - b.Designation.length,
        },
        {
            title: "Shift",
            dataIndex: "Shift",
            sorter: (a: WorkFromHomeData, b: WorkFromHomeData) => a.Shift.length - b.Shift.length,
        },
        {
            title: "Reason",
            dataIndex: "Reason",
            sorter: (a: WorkFromHomeData, b: WorkFromHomeData) => a.Reason.length - b.Reason.length,
        },
        {
            title: "Date",
            dataIndex: "Date",
            sorter: (a: WorkFromHomeData, b: WorkFromHomeData) => a.Date.length - b.Date.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: WorkFromHomeData['Status'], _record: WorkFromHomeData) => (
                <Link
                    href="#"
                    className={`badge ${text === 'Completed' ? 'badge-soft-success' : text === 'Approved' ? 'badge-soft-success' : text === 'Pending' ? 'badge-soft-info' : 'badge-soft-danger'} d-inline-flex align-items-center badge-xs`}
                >
                    {text}
                </Link>
            ),
            sorter: (a: WorkFromHomeData, b: WorkFromHomeData) => a.Status.length - b.Status.length,
        },
        {
            title: "",
            dataIndex: "action",
            render: (_text: string, record: any) => (
                <div className="action-icon d-inline-flex">
                    <Link
                        href="#"
                        className="me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#edit_modal"
                    >
                        <i className="ti ti-edit" />
                    </Link>
                </div>
            ),
        },
    ]
    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Work From Home Management</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Attendance</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Work From Home Management
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
                                    data-bs-target="#add_modal"
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Add New Request
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
                            <h5>Employee List</h5>
                            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                                <div className="me-3 input-icon position-relative">
                                    <PredefinedDatePicker />
                                </div>
                                <div className="dropdown me-3">
                                    <Link
                                        href="#"
                                        className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                                        data-bs-toggle="dropdown"
                                    >
                                        Designation
                                    </Link>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Accountant
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                App Developer
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Technician
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Web Developer
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
                                        Shift
                                    </Link>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Regular
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Night
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
                                        Status
                                    </Link>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Approved
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Pending
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Rejected
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Completed
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
                            <Table dataSource={data} columns={columns} Selection={true} />
                        </div>
                    </div>
                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
            <WorkFromHomeModal />
        </>
    )
}

export default WorkFromHomeComponent