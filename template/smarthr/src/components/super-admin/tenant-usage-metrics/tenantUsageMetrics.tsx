"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import CommonFooter from "@/core/common/commonFooter/footer";
import PredefinedDatePicker from "@/core/common/datePicker";
import { tenantUsageMetricsData } from "@/core/data/json/tenantUsageMetricsData";
import TenantUsageMetricsModal from "./modal/tenantUsageMetricsModal";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";


interface TenantUsageMetricsData {
    Image1: string;
    Tenants: string;
    Plan: string;
    Active_Users: string;
    Most_Used_Modules: string;
    Storage_Usage: string;
    Status: string;
}
const TenantUsageMetricsComponent = () => {
    const data: TenantUsageMetricsData[] = tenantUsageMetricsData;
    const columns = [
        {
            title: "Tenants",
            dataIndex: "Tenants",
            render: (_text: string, record: TenantUsageMetricsData) => (
                <div className="d-flex align-items-center file-name-icon">
                    <Link href="#" className="avatar avatar-md border avatar-rounded">
                        <ImageWithBasePath
                            src={`assets/img/company/${record.Image1}`}
                            className="img-fluid"
                            alt={`${record.Tenants} logo`}
                        />
                    </Link>
                    <div className="ms-2">
                        <h6 className="fw-medium">
                            <Link href="#">{record.Tenants}</Link>
                        </h6>
                    </div>
                </div>
            ),
            sorter: (a: TenantUsageMetricsData, b: TenantUsageMetricsData) => a.Tenants.length - b.Tenants.length,
        },
        {
            title: "Plan",
            dataIndex: "Plan",
            render: (text: TenantUsageMetricsData['Plan'], _record: TenantUsageMetricsData) => (
                <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-0 me-2">{text}</p>
                    <span
                        className={`badge badge-purple d-inline-flex align-items-center badge-xs`}
                    >
                        Upgrade
                    </span>
                </div>
            ),
            sorter: (a: TenantUsageMetricsData, b: TenantUsageMetricsData) => a.Plan.length - b.Plan.length,
        },
        {
            title: "Active Users",
            dataIndex: "Active_Users",
            sorter: (a: TenantUsageMetricsData, b: TenantUsageMetricsData) => a.Active_Users.length - b.Active_Users.length,
        },
        {
            title: "Most Used Modules",
            dataIndex: "Most_Used_Modules",
            sorter: (a: TenantUsageMetricsData, b: TenantUsageMetricsData) => a.Most_Used_Modules.length - b.Most_Used_Modules.length,
        },
        {
            title: "Storage Usage",
            dataIndex: "Storage_Usage",
            sorter: (a: TenantUsageMetricsData, b: TenantUsageMetricsData) => a.Storage_Usage.length - b.Storage_Usage.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: TenantUsageMetricsData['Status'], _record: TenantUsageMetricsData) => (
                <span
                    className={`badge ${text === 'Active' ? 'badge-success' : 'badge-danger'} d-inline-flex align-items-center badge-xs`}
                >
                    <i className="ti ti-point-filled me-1"></i>
                    {text}
                </span>
            ),
            sorter: (a: TenantUsageMetricsData, b: TenantUsageMetricsData) => a.Status.length - b.Status.length,
        },
        {
            title: "",
            dataIndex: "action",
            render: (_text: string) => (
                <div className="action-icon d-inline-flex">
                    <Link
                        href="#"
                        className="me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#view_details"
                    >
                        <i className="ti ti-eye" />
                    </Link>
                    <Link href="#" className="me-2">
                        <i className="ti ti-refresh" />
                    </Link>
                    <Link href="#">
                        <i className="ti ti-ban" />
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
                            <h2 className="mb-1">Tenant Usage Metrics</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Super Admin</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Tenant Usage Metrics
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

                            <div className="head-icons">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>

                    {/* /Breadcrumb */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <h5>Tenants Usage List</h5>
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
                                        Select Plan
                                    </Link>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Advanced (Monthly)
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Basic (Yearly)
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Enterprise (Monthly)
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
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Active
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Inactive
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
            <TenantUsageMetricsModal />
        </>
    )
}

export default TenantUsageMetricsComponent