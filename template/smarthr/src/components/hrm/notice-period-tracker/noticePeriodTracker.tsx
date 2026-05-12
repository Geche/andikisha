"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import CommonFooter from "@/core/common/commonFooter/footer";
import { noticePeriodTrackerData } from "@/core/data/json/noticePeriodTrackerData";
import PredefinedDatePicker from "@/core/common/datePicker";
import NoticePeriodTrackerModal from "./modal/noticePeriodTrackerModal";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";


interface NoticePeriodTrackerData {
    EmpId: string;
    Image1: string;
    name: string;
    Designation: string;
    Start_Date: string;
    End_Days: string;
    Total_Day: string;
    Completed: string;
    Remaining: string;
    Status: string;
}
const NoticePeriodTrackerComponent = () => {
    const data: NoticePeriodTrackerData[] = noticePeriodTrackerData;
    const columns = [
        {
            title: "Emp Id",
            dataIndex: "EmpId",
            render: (text: string, _record: NoticePeriodTrackerData) => (
                <Link href="#" className="link-default" data-bs-toggle="offcanvas" data-bs-target="#probation_details">
                    {text}
                </Link>
            ),
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.EmpId.length - b.EmpId.length,
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (_text: string, record: NoticePeriodTrackerData) => (
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
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.name.length - b.name.length,
        },
        {
            title: "Designation",
            dataIndex: "Designation",
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.Designation.length - b.Designation.length,
        },
        {
            title: "Start Date",
            dataIndex: "Start_Date",
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.Start_Date.length - b.Start_Date.length,
        },
        {
            title: "End Days",
            dataIndex: "End_Days",
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.End_Days.length - b.End_Days.length,
        },
        {
            title: "Total Day",
            dataIndex: "Total_Day",
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.Total_Day.length - b.Total_Day.length,
        },
        {
            title: "Completed",
            dataIndex: "Completed",
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.Completed.length - b.Completed.length,
        },
        {
            title: "Remaining",
            dataIndex: "Remaining",
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.Remaining.length - b.Remaining.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: NoticePeriodTrackerData['Status'], _record: NoticePeriodTrackerData) => (
                <Link
                    href="#"
                    className={`badge ${text === 'Completed' ? 'badge-soft-success' : text === 'Closing Soon' ? 'badge-soft-purple' : text === 'Active' ? 'badge-pink-transparent' : 'badge-soft-danger'} d-inline-flex align-items-center badge-xs`}
                >
                    {text}
                </Link>
            ),
            sorter: (a: NoticePeriodTrackerData, b: NoticePeriodTrackerData) => a.Status.length - b.Status.length,
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
                            <h2 className="mb-1">Notice Period Tracker</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">HRM</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Notice Period Tracker
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
                            <h5>Notice Period Tracker</h5>
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
            <NoticePeriodTrackerModal />
        </>
    )
}

export default NoticePeriodTrackerComponent