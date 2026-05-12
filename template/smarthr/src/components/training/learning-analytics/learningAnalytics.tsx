"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import CommonFooter from "@/core/common/commonFooter/footer";
import { learningAnalyticsData } from "@/core/data/json/learningAnalyticsData";
import LearnEmployeeChart from "./charts/learnEmployee";
import CertificationChart from "./charts/certificationChart";
import EnrollCourseChart from "./charts/enrollCourse";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";


interface LearningAnalyticsData {
    key: string;
    Image1: string;
    name: string;
    Designation: string;
    Training_Course: string;
    Status: string;
    Score: string;
    Completion_date: string;
    Feedback: string;
    Attempts: string;
    Certificate: string;
}
const LearningAnalyticsComponent = () => {
    const data: LearningAnalyticsData[] = learningAnalyticsData;
    const columns = [
        {
            title: "Employee Name",
            dataIndex: "name",
            render: (_text: string, record: LearningAnalyticsData) => (
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
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) => a.name.length - b.name.length,
        },
        {
            title: "Designation",
            dataIndex: "Designation",
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) => a.Designation.length - b.Designation.length,
        },
        {
            title: "Training Course",
            dataIndex: "Training_Course",
            render: (_text: string, record: LearningAnalyticsData) => {
                return (
                    <p className="text-dark fw-semibold">
                        {record.Training_Course}
                    </p>
                );
            },
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) => a.Training_Course.length - b.Training_Course.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: LearningAnalyticsData['Status'], _record: LearningAnalyticsData) => (
                <Link
                    href="#"
                    className={`badge ${text === 'Completed' ? 'badge-soft-success' : text === 'Not Started' ? 'badge-soft-purple' : text === 'In Progress' ? 'badge-soft-info' : 'badge-soft-danger'} d-inline-flex align-items-center badge-xs`}
                >
                    {text}
                </Link>
            ),
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) => a.Status.length - b.Status.length,
        },
        {
            title: "Score(%)",
            dataIndex: "Score",
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) => a.Score.length - b.Score.length,
        },
        {
            title: "Completion_date",
            dataIndex: "Completion_date",
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) => a.Completion_date.length - b.Completion_date.length,
        },
        {
            title: "Feedback",
            dataIndex: "Feedback",
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) => a.Feedback.length - b.Feedback.length,
        },
        {
            title: "Attempts",
            dataIndex: "Attempts",
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) => a.Attempts.length - b.Attempts.length,
        },
        {
            title: "Certificate",
            dataIndex: "Certificate",
            render: (text: LearningAnalyticsData['Certificate']) => {
                if (text === "Issued") {
                    return (
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                            <i className="ti ti-point-filled me-1"></i>Issued
                        </span>
                    );
                }
                return <span>{text}</span>;
            },
            sorter: (a: LearningAnalyticsData, b: LearningAnalyticsData) =>
                a.Certificate.localeCompare(b.Certificate),
        }

    ]
    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Learning Analytics</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Training</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Learning Analytics
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                            <div className="ms-2 head-icons">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="row">
                        {/* Total Exponses */}
                        <div className="col-xxl-5 col-lg-12 col-md-12 d-flex">
                            <div className="card flex-fill">
                                <div className="card-header border-0">
                                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                                        <div className="d-flex align-items-center ">
                                            <h5>Learning Employees</h5>
                                        </div>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="btn btn-white border d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar me-1" />
                                                2025
                                            </Link>
                                            <ul className="dropdown-menu  dropdown-menu-end p-3">
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
                                    <LearnEmployeeChart />
                                </div>
                            </div>
                        </div>
                        {/* /Total Exponses */}
                        {/* Total Exponses */}
                        <div className="col-xxl-7 col-lg-12 col-md-12 d-flex">
                            <div className="row flex-fill">
                                <div className="col-lg-5 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body pb-0">
                                            <div className="d-flex flex-column align-items-center">
                                                <div className="p-2 rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-2">
                                                    <i className="ti ti-certificate fs-22" />
                                                </div>
                                                <p className="fw-semibold text-dark mb-1">
                                                    Certification Completed
                                                </p>
                                                <div className="fw-bold text-dark fs-24 mb-1">225</div>
                                                <span className="badge badge-soft-success rounded-pill border border-success mb-1">
                                                    <i className="ti ti-arrow-up" />
                                                    12%
                                                </span>
                                                <p className="fs-12 fw-normal d-flex align-items-center text-truncate">
                                                    from last month
                                                </p>
                                            </div>
                                            <CertificationChart />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-7 col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="card-header border-0 p-0">
                                                <div className="d-flex flex-wrap justify-content-between align-items-center row-gap-3">
                                                    <div className="d-flex align-items-center ">
                                                        <h5>Highly Enrolled Courses</h5>
                                                    </div>
                                                    <div className="dropdown">
                                                        <Link
                                                            href="#"
                                                            className="btn btn-white border d-inline-flex align-items-center"
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            <i className="ti ti-calendar me-1" />
                                                            2025
                                                        </Link>
                                                        <ul className="dropdown-menu  dropdown-menu-end p-3">
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
                                                <EnrollCourseChart />
                                                <div>
                                                    <p>
                                                        <i className="ti ti-point-filled me-1 text-info" />
                                                        No of Employees increased by{" "}
                                                        <span className="text-success">+20%</span> from last Week
                                                    </p>
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
                            <h5>Learning Employee List</h5>
                            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
        </>
    )
}

export default LearningAnalyticsComponent