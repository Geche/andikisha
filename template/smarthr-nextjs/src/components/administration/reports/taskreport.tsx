"use client";
import PredefinedDateRanges from '../../../core/common/datePicker'
import Table from "../../../core/common/dataTable/index";
import { taskDetails } from '../../../core/data/json/taskDetails';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import Link from 'next/link';
import { all_routes } from '@/routes/all_routes';
import TaskChart from '@/components/chart/administration/taskReportChart';
import SmallTaskChart from '@/components/chart/administration/smallTaskChart';
import MiniDonut from './taskReportChart';

// Define interfaces
interface TaskItem {
    TaskName: string;
    ProjectName: string;
    CreatedDate: string;
    DueDate: string;
    Priority: string;
    Status: string;
    [key: string]: any; // Remove if not needed
}

interface ColumnType<T> {
    title: string;
    dataIndex: keyof T | string;
    render?: (text: any, record?: T) => React.ReactNode;
    sorter?: (a: T, b: T) => number;
}

const TaskReportComponent = () => {

    const data: TaskItem[] = taskDetails;
    const columns: ColumnType<TaskItem>[] = [
        {
            title: "Task Name",
            dataIndex: "TaskName",
            render: (text: string) => (
                <div className="d-flex align-items-center file-name-icon">
                    <h6 className="fw-medium">
                        <Link href="#">{text}</Link>
                    </h6>
                </div>
            ),
            sorter: (a, b) => a.TaskName.length - b.TaskName.length,
        },
        {
            title: "Project Name",
            dataIndex: "ProjectName",
            sorter: (a, b) => a.ProjectName.length - b.ProjectName.length,
        },
        {
            title: "Created Date",
            dataIndex: "CreatedDate",
            sorter: (a, b) => a.CreatedDate.length - b.CreatedDate.length,
        },
        {
            title: "Due Date",
            dataIndex: "DueDate",
            sorter: (a, b) => a.DueDate.length - b.DueDate.length,
        },
        {
            title: "Priority",
            dataIndex: "Priority",
            render: (text: string) => (
                <span className={`badge  ${text === 'Low' ? 'badge-success-transparent' : text === 'Medium' ? 'badge-warning-transparent' : 'badge-danger-transparent'}`}>
                    <i className="ti ti-point-filled me-1"></i>{text}
                </span>
            ),
            sorter: (a, b) => a.Priority.length - b.Priority.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: string) => (
                <span className={`badge  d-inline-flex align-items-center badge-xs ${text === 'Completed' ? 'badge-success' : text === 'Inprogress' ? 'badge-purple' : text === 'On Hold' ? 'badge-warning' : 'badge-skyblue'}`}>
                    <i className="ti ti-point-filled me-1" />
                    {text}
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
                            <h2 className="mb-1">Task Report</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Reports</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Task Report
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
                        {/* Total Exponses */}
                        <div className="col-lg-6 col-md-6 d-flex">
                            <div className="row flex-fill">
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body ">
                                            <div className="row align-items-center">
                                                <div className="col-8">
                                                    <div>
                                                        <span className="fs-14 fw-normal text-truncate mb-1">
                                                            Total Tasks
                                                        </span>
                                                        <h5>800</h5>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <MiniDonut value={6} total={7} color="#F26522" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body ">
                                            <div className="row align-items-center">
                                                <div className="col-8">
                                                    <div>
                                                        <span className="fs-14 fw-normal text-truncate mb-1">
                                                            Total Tasks
                                                        </span>
                                                        <h5>800</h5>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <p className="data-attributes">
                                                        <MiniDonut value={4} total={7} color="#03C95A" />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-8">
                                                    <div>
                                                        <span className="fs-14 fw-normal text-truncate mb-1">
                                                            Total Tasks
                                                        </span>
                                                        <h5>800</h5>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <p className="data-attributes">
                                                        <MiniDonut value={2} total={7} color="#FD3995" />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body ">
                                            <div className="row align-items-center">
                                                <div className="col-8">
                                                    <div>
                                                        <span className="fs-14 fw-normal text-truncate mb-1">
                                                            Total Tasks
                                                        </span>
                                                        <h5>800</h5>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <p className="data-attributes">
                                                        <MiniDonut value={1} total={7} color="#0DCAF0" />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* /Total Exponses */}
                        {/* Total Exponses */}
                        <div className="col-lg-6 col-md-6 d-flex">
                            <div className="card flex-fill">
                                <div className="card-header border-0">
                                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                                        <div className="d-flex align-items-center ">
                                            <span className="me-2">
                                                <i className="ti ti-chart-pie text-danger" />
                                            </span>
                                            <h5>Tasks</h5>
                                        </div>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="dropdown-toggle btn btn-sm fs-12 btn-white d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                Office Management App
                                            </Link>
                                            <ul className="dropdown-menu  dropdown-menu-end p-2">
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        PRO-001
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        PRO-002
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        PRO-004
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body pt-0">
                                    <div className="row align-items-center">
                                        <div className="col-md-6 d-flex align-items-center justify-content-center">
                                            <div className="position-relative payment-total">
                                                <TaskChart />
                                                <div className="task-total-content ">
                                                    <p className="fs-16 fw-normal mb-0">Pending</p>
                                                    <span className="display-3 fs-24 fw-bold text-skyblue">
                                                        30%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="row gy-4">
                                                <div className="col-md-6">
                                                    <div className="d-flex task-report-icons">
                                                        <span className="me-2">
                                                            <i className="ti ti-arrow-badge-right-filled text-success" />
                                                        </span>
                                                        <h6 className="fs-16">
                                                            Completed <span className="fs-14 fw-normal">40%</span>
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="d-flex task-report-icons">
                                                        <span className="me-2">
                                                            <i className="ti ti-arrow-badge-right-filled text-skyblue" />
                                                        </span>
                                                        <h6 className="fs-16">
                                                            Pending <span className="fs-14 fw-normal">30 %</span>
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="d-flex task-report-icons">
                                                        <span className="me-2">
                                                            <i className="ti ti-arrow-badge-right-filled text-warning" />
                                                        </span>
                                                        <h6 className="fs-16">
                                                            Inprogress{" "}
                                                            <span className="fs-14 fw-normal">20 %</span>
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="d-flex task-report-icons">
                                                        <span className="me-2">
                                                            <i className="ti ti-arrow-badge-right-filled text-purple" />
                                                        </span>
                                                        <h6 className="fs-16">
                                                            On Hold <span className="fs-14 fw-normal">10 %</span>
                                                        </h6>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* /Total Exponses */}
                    </div>
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <h5>Tasks List</h5>
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
                                        Select Priority
                                    </Link>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
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
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                High
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
                                        Select Status
                                    </Link>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Completed
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Pending
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Inprogress
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
                            <Table dataSource={data} columns={columns} Selection={true} />
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

export default TaskReportComponent
