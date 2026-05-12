"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import CommonFooter from "@/core/common/commonFooter/footer";
import { probationManagementData } from "@/core/data/json/probationManagementData";
import PredefinedDatePicker from "@/core/common/datePicker";
import ProbationManagementModal from "./modal/probationManagementModal";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";


interface ProbationManagementData {
    EmpId: string;
    Image1: string;
    Image: string;
    name: string;
    Designation: string;
    Joining_Date: string;
    Probation_End_date: string;
    Reviewer: string;
    Status: string;
}
const ProbationManagementComponent = () => {
    const data: ProbationManagementData[] = probationManagementData;
    const columns = [
        {
            title: "Emp Id",
            dataIndex: "EmpId",
            render: (text: string, _record: ProbationManagementData) => (
                <Link href="#" className="link-default" data-bs-toggle="offcanvas" data-bs-target="#probation_details">
                    {text}
                </Link>
            ),
            sorter: (a: ProbationManagementData, b: ProbationManagementData) => a.EmpId.length - b.EmpId.length,
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (_text: string, record: ProbationManagementData) => (
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
            sorter: (a: ProbationManagementData, b: ProbationManagementData) => a.name.length - b.name.length,
        },
        {
            title: "Designation",
            dataIndex: "Designation",
            sorter: (a: ProbationManagementData, b: ProbationManagementData) => a.Designation.length - b.Designation.length,
        },
        {
            title: "Joining Date",
            dataIndex: "Joining_Date",
            sorter: (a: ProbationManagementData, b: ProbationManagementData) => a.Joining_Date.length - b.Joining_Date.length,
        },
        {
            title: "Probation End date",
            dataIndex: "Probation_End_date",
            sorter: (a: ProbationManagementData, b: ProbationManagementData) => a.Probation_End_date.length - b.Probation_End_date.length,
        },
        {
            title: "Reviewer",
            dataIndex: "Reviewer",
            render: (_text: string, record: ProbationManagementData) => (
                <div className="d-flex align-items-center file-name-icon">
                    <Link href="#" className="avatar avatar-md border avatar-rounded">
                        <ImageWithBasePath
                            src={`assets/img/agents/${record.Image}`}
                            className="img-fluid"
                            alt={`${record.Reviewer} logo`}
                        />
                    </Link>
                    <div className="ms-2">
                        <h6 className="fw-medium">
                            <Link href="#">{record.Reviewer}</Link>
                        </h6>
                    </div>
                </div>
            ),
            sorter: (a: ProbationManagementData, b: ProbationManagementData) => a.Reviewer.length - b.Reviewer.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: ProbationManagementData['Status'], _record: ProbationManagementData) => (
                <Link
                    href="#"
                    className={`badge ${text === 'Completed' ? 'badge-soft-success' : text === 'Extended' ? 'badge-soft-purple' : text === 'Pending' ? 'badge-soft-info' : text === 'In Review' ? 'badge-soft-warning' : 'badge-soft-danger'} d-inline-flex align-items-center badge-xs`}
                >
                    {text}
                </Link>
            ),
            sorter: (a: ProbationManagementData, b: ProbationManagementData) => a.Status.length - b.Status.length,
        },
        {
            title: "",
            dataIndex: "action",
            render: (_text: string, record: any) => (
                <div className="action-icon d-inline-flex">
                    <Link
                        href="#"
                        className="me-2"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#probation_details"
                    >
                        <i className="ti ti-eye" />
                    </Link>
                    <Link
                        href="#"
                        className={`edit-btn ${record.editBtn ? 'd-flex' : 'd-none'}`}
                        data-bs-toggle="modal"
                        data-bs-target="#edit_modal"
                    >
                        <i className="ti ti-edit" />
                    </Link>
                    <Link
                        href="#"
                        className={`refresh-btn ${record.refreshBtn ? 'd-flex' : 'd-none'}`}
                    >
                        <i className="ti ti-refresh" />
                    </Link>

                    <Link
                        href="#"
                        className={`ban-btn ${record.banBtn ? 'd-flex' : 'd-none'}`}
                    >
                        <i className="ti ti-ban" />
                    </Link>

                    <Link
                        href="#"
                        className={`delete ${record.deleteBtn ? 'd-flex' : 'd-none'}`}
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                    >
                        <i className="ti ti-trash" />
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
                            <h2 className="mb-1">Probation Management</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">HRM</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Probation Management
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
                                    Add New Employee
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
                            <h5>Probation Management</h5>
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
            <ProbationManagementModal />
        </>
    )
}

export default ProbationManagementComponent