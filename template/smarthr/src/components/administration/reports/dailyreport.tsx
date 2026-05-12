"use client";

import Table from "../../../core/common/dataTable/index";
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import PredefinedDateRanges from '../../../core/common/datePicker';
import { dailyreportDetails } from '../../../core/data/json/dailyreportDetails';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import Link from 'next/link';
import { all_routes } from '@/routes/all_routes';
import DailyChart from '@/components/chart/administration/dailyChart';

// Define interfaces
interface DailyReportItem {
    Name: string;
    Image: string;
    Role: string;
    Date: string;
    Department: string;
    Status: string;
    [key: string]: any; // Remove if not needed
}

interface ColumnType<T> {
    title: string;
    dataIndex: keyof T | string;
    render?: (text: any, record?: T) => React.ReactNode;
    sorter?: (a: T, b: T) => number;
}

const DailyReportComponent = () => {

    const data: DailyReportItem[] = dailyreportDetails;
    const columns: ColumnType<DailyReportItem>[] = [
        {
            title: "Name",
            dataIndex: "Name",
            render: (_text: string, record?: DailyReportItem) => (
                <div className="d-flex align-items-center">
                    <Link
                        href="#"
                        className="avatar avatar-md"
                        data-bs-toggle="modal" data-inert={true}
                        data-bs-target="#view_details"
                    >
                        <ImageWithBasePath
                            src={`assets/img/users/${record?.Image}`}
                            className="img-fluid rounded-circle"
                            alt="users-imgage"
                        />
                    </Link>
                    <div className="ms-2">
                        <p className="text-dark mb-0">
                            <Link href="#" data-bs-toggle="modal" data-inert={true} data-bs-target="#view_details">
                                {record?.Name}
                            </Link>
                        </p>
                        <span className="fs-12">{record?.Role}</span>
                    </div>
                </div>
            ),
            sorter: (a, b) => a.Name.length - b.Name.length,
        },
        {
            title: "Date",
            dataIndex: "Date",
            sorter: (a, b) => a.Date.length - b.Date.length,
        },
        {
            title: "Department",
            dataIndex: "Department",
            sorter: (a, b) => a.Department.length - b.Department.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: string) => (
                <span className={`badge  d-inline-flex align-items-center badge-xs ${text === 'Present' ? 'badge-soft-success' : 'badge-soft-danger'}`}>
                    <i className="ti ti-point-filled me-1"></i>{text}
                </span>
            ),
            sorter: (a, b) => a.Status.length - b.Status.length,
        },
    ];

    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Daily Report</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Reports</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Daily Report
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                            <div className="mb-2">
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
                            <div className="head-icons ms-2">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="row">
                        <div className="col-xl-6 d-flex">
                            <div className="row flex-fill">
                                {/* Total Companies */}
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <p className="fs-12 fw-normal mb-1 text-truncate">
                                                        Total Present
                                                    </p>
                                                    <h4>300</h4>
                                                </div>
                                                <div className="leave-report-icon">
                                                    <Link href="#">
                                                        <span className="p-2 border border-primary bg-transparent-primary rounded-circle d-flex align-items-center justify-content-center">
                                                            <i className="ti ti-user-check text-primary" />
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Total Companies */}
                                {/* Total Companies */}
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <p className="fs-12 fw-normal mb-1 text-truncate">
                                                        Completed Tasks
                                                    </p>
                                                    <h4>100</h4>
                                                </div>
                                                <div className="leave-report-icon">
                                                    <Link href="#">
                                                        <span className="p-2 border border-success bg-transparent-success rounded-circle d-flex align-items-center justify-content-center">
                                                            <i className="ti ti-subtask text-success" />
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Total Companies */}
                                {/* Inactive Companies */}
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <p className="fs-12 fw-normal mb-1 text-truncate">
                                                        Total Absent
                                                    </p>
                                                    <h4>15</h4>
                                                </div>
                                                <div className="leave-report-icon">
                                                    <Link href="#">
                                                        <span className="p-2 border border-danger bg-transparent-danger rounded-circle d-flex align-items-center justify-content-center">
                                                            <i className="ti ti-user-x text-danger" />
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Inactive Companies */}
                                {/* Company Location */}
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <p className="fs-12 fw-normal mb-1 text-truncate">
                                                        Pending Tasks
                                                    </p>
                                                    <h4>125</h4>
                                                </div>
                                                <div className="leave-report-icon">
                                                    <Link href="#">
                                                        <span className="p-2 border border-skyblue bg-transparent-skyblue rounded-circle d-flex align-items-center justify-content-center">
                                                            <i className="ti ti-user-x text-skyblue" />
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Company Location */}
                            </div>
                        </div>
                        <div className="col-xl-6 d-flex">
                            <div className="card flex-fill">
                                <div className="card-header border-0 pb-0">
                                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                                        <div className="d-flex align-items-center ">
                                            <span className="me-2">
                                                <i className="ti ti-chart-bar text-danger" />
                                            </span>
                                            <h5>Daily Attendance</h5>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <p className="d-inline-flex align-items-center me-2 mb-0">
                                                <i className="ti ti-square-filled fs-12 text-success me-2" />
                                                Present
                                            </p>
                                            <p className="d-inline-flex align-items-center mb-0 me-2">
                                                <i className="ti ti-square-filled fs-12 text-danger me-2" />
                                                Absent
                                            </p>
                                        </div>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="dropdown-toggle btn btn-sm fs-12 btn-white d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                This Year
                                            </Link>
                                            <ul className="dropdown-menu  dropdown-menu-end p-2">
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        2024
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        2023
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        2022
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body py-0">
                                   <DailyChart/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <h5>Daily Attendance List</h5>
                            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                                <div className="me-3">
                                    <div className="input-icon position-relative">
                                        <PredefinedDateRanges />
                                    
                                    </div>
                                </div>
                                <div className="dropdown me-3">
                                    <Link
                                        href="#"
                                        className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
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
                                                Present
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Absent
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
                                                Desending
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
                        <div className="card-body p-0">
                            <Table dataSource={data} columns={columns} Selection={false} />
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



    )
}

export default DailyReportComponent
