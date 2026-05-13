"use client";
import CommonFooter from "@/core/common/commonFooter/footer"
import PurchaseTrendChart from "./charts/purchaseTrendChart"
import AssetsDepartmentChart from "./charts/assetsDepartmentChart"
import TotalAssetsChart from "./charts/totalAssetsChart"
import AssetsAssignedChart from "./charts/assetsAssignedChart"
import AssetsAvailableChart from "./charts/assetsAvailableChart"
import AssetValueChart from "./charts/assetValue"
import DepreciatedValueChart from "./charts/depreciatedValueChart"
import AssetCategoriesChart from "./charts/assetCategoriesChart"
import CollapseHeader from "@/core/common/collapse-header/collapse-header"
import Link from "next/link"
import { all_routes } from "@/routes/all_routes"

const AssetDashboardComponent = () => {
    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Asset Management</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Dashboard</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Asset Management
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <Link href="#" className="btn btn-white me-2 mb-2">
                                {" "}
                                <i className="ti ti-user" /> Add Assignee
                            </Link>
                            <Link href="#" className="btn btn-secondary mb-2 me-2">
                                {" "}
                                <i className="ti ti-calendar" /> Schedule Maintainance
                            </Link>
                            <Link href="#" className="btn btn-primary-gradient mb-2">
                                {" "}
                                <i className="ti ti-plus" /> Add New Job
                            </Link>
                            <div className="ms-2 head-icons">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    {/* start row */}
                    <div className="row">
                        <div className="col-xl-8">
                            {/* Candidate Hiring Analysis */}
                            <div className="card position-relative analysis-card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                                        <h3 className="mb-0 card-title">Purchase Trend</h3>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1 fw-medium"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar fs-14" /> Weekly
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Monthly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Yearly
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mb-1 d-flex align-items-center gap-2 flex-wrap">
                                        <h4 className="mb-0">654</h4>
                                        <div className="border rounded-pill  bg-light fs-13 text-gray-9 d-flex align-items-center gap-2 p-2px ps-2">
                                            +18%
                                            <p className="btn btn-sm btn-icon pe-none bg-success rounded-circle d-flex align-items-center justify-content-center  text-white">
                                                <i className="ti ti-arrow-up-right fs-20" />
                                            </p>
                                        </div>
                                        <p className="mb-0 fs-14">vs last year</p>
                                    </div>
                                    <div style={{ position: "relative" }}>
                                        <PurchaseTrendChart />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 d-flex flex-column">
                            {/* Salary Range Distribution */}
                            <div className="card">
                                <div className="card-body">
                                    <div className="pb-2 d-flex align-items-center justify-content-between flex-wrap mb-3">
                                        <h5 className="mb-2">Assets by Department</h5>
                                        <Link href="#">
                                            <i className="ti ti-refresh fs-20 text-secondary" />
                                        </Link>
                                    </div>
                                    <AssetsDepartmentChart />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* end row */}
                    {/* start row */}
                    <div className="row">
                        <div className="col-xl-4">
                            <div className="card">
                                <div className="card-body">
                                    <div className="mb-3 d-flex align-items-center justify-content-between flex-wrap">
                                        <p className="mb-0 d-flex align-items-center">
                                            <i className="ti ti-device-desktop text-primary fs-20 me-1" />{" "}
                                            Total Assets
                                        </p>
                                        <p className="d-flex align-items-center fs-16 text-success fw-bold">
                                            <i className="ti ti-square-rounded-chevron-up me-1" />
                                            9.25%
                                        </p>
                                    </div>
                                    <h2>1,247</h2>
                                    <TotalAssetsChart />
                                </div>
                            </div>
                        </div>
                        {/* end col */}
                        <div className="col-xl-4 ">
                            <div className="card">
                                <div className="card-body">
                                    <div className="mb-3 d-flex align-items-center justify-content-between flex-wrap">
                                        <p className="mb-0 d-flex align-items-center">
                                            <i className="ti ti-user-star text-secondary fs-20 me-1" />{" "}
                                            Assets Assigned
                                        </p>
                                        <p className="d-flex align-items-center fs-16 text-success fw-bold">
                                            <i className="ti ti-square-rounded-chevron-up me-1" />
                                            9.25%
                                        </p>
                                    </div>
                                    <h2>892</h2>
                                    <AssetsAssignedChart />
                                </div>
                            </div>
                        </div>
                        {/* end col */}
                        <div className="col-xl-4 ">
                            <div className="card">
                                <div className="card-body">
                                    <div className="mb-3 d-flex align-items-center justify-content-between flex-wrap">
                                        <p className="mb-0 d-flex align-items-center">
                                            <i className="ti ti-cylinder-plus text-purple fs-20 me-1" />{" "}
                                            Assets Available
                                        </p>
                                        <p className="d-flex align-items-center fs-16 text-danger fw-bold">
                                            <i className="ti ti-square-rounded-chevron-down me-1" />
                                            9.25%
                                        </p>
                                    </div>
                                    <h2>287</h2>
                                    <AssetsAvailableChart />
                                </div>
                            </div>
                        </div>
                        {/* end col */}
                    </div>
                    {/* end row */}
                    <div className="row">
                        <div className="col-xl-5">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                                        <h3 className="mb-0 card-title">Asset Value</h3>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1 fw-medium"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar fs-14" /> Weekly
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Monthly
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mb-1 d-flex align-items-center gap-2 flex-wrap mb-3">
                                        <h4 className="mb-0">$2.4M</h4>
                                        <div className="border rounded-pill bg-light fs-13 text-gray-9 d-flex align-items-center gap-2 p-2px ps-2">
                                            +22%
                                            <p className="btn pe-none btn-sm btn-icon bg-success rounded-circle d-flex align-items-center justify-content-center text-white">
                                                <i className="ti ti-arrow-up-right fs-20 " />
                                            </p>
                                        </div>
                                        <p className="mb-0 fs-14">vs last month</p>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between px-2 asset-value-lable">
                                        <p className="fs-12 m-0 fw-semibold">0</p>
                                        <p className="fs-12 m-0 fw-semibold">2M</p>
                                        <p className="fs-12 m-0 fw-semibold">4M</p>
                                    </div>
                                    <AssetValueChart />
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                                        <h3 className="mb-0 card-title">Depreciated Value</h3>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1 fw-medium"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar fs-14" /> Monthly
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Monthly
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="mb-1 d-flex flex-column gap-2">
                                            <h4 className="mb-0">$1.8M</h4>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="border rounded-pill bg-light fs-13 text-gray-9 d-flex align-items-center gap-2 p-2px ps-2">
                                                    +22%{" "}
                                                    <p className="btn pe-none btn-sm btn-icon bg-danger rounded-circle d-flex align-items-center justify-content-center  text-white">
                                                        <i className="ti ti-arrow-down-right fs-20" />
                                                    </p>
                                                </div>
                                                <p className="mb-0 fs-14">vs last month</p>
                                            </div>
                                        </div>
                                        <DepreciatedValueChart />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-7 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-4">
                                        <h3 className="mb-0 card-title">Assets by Category</h3>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1 fw-medium"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar fs-14" /> Monthly
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Monthly
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="row d-flex align-items-center justify-content-center ">
                                        <div className="col-md-6">
                                            <AssetCategoriesChart />
                                        </div>
                                        <div className="col-md-6">
                                            <div className="asset-list">
                                                <div className="asset-item border rounded-pill">
                                                    <div className="bar">
                                                        <div className="fill fill-40">
                                                            <span className="percent">40%</span>
                                                        </div>
                                                        <span className="label">Laptops</span>
                                                    </div>
                                                </div>
                                                <div className="asset-item border rounded-pill">
                                                    <div className="bar">
                                                        <div className="fill fill-20">
                                                            <span className="percent">20%</span>
                                                        </div>
                                                        <span className="label">Mouse</span>
                                                    </div>
                                                </div>
                                                <div className="asset-item border rounded-pill">
                                                    <div className="bar">
                                                        <div className="fill fill-15">
                                                            <span className="percent">15%</span>
                                                        </div>
                                                        <span className="label">Writing Pad</span>
                                                    </div>
                                                </div>
                                                <div className="asset-item border rounded-pill">
                                                    <div className="bar">
                                                        <div className="fill fill-15">
                                                            <span className="percent">15%</span>
                                                        </div>
                                                        <span className="label">Keyboard</span>
                                                    </div>
                                                </div>
                                                <div className="asset-item border rounded-pill">
                                                    <div className="bar">
                                                        <div className="fill fill-5">
                                                            <span className="percent">5%</span>
                                                        </div>
                                                        <span className="label">Chairs</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card job-opening-table">
                        <div className="card-body">
                            <div className="pb-2 d-flex align-items-center justify-content-between flex-wrap mb-3">
                                <h3 className="mb-0 card-title">Active Job Openings</h3>
                                <Link
                                    href="#"
                                    className="btn btn-primary-gradient border btn-sm d-inline-flex align-items-center"                                >
                                    View All
                                </Link>
                            </div>
                            <div className="mb-4 d-flex align-items-center gap-2">
                                <div className="input-group input-group-flat d-inline-flex w-100">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search in HRMS"
                                    />
                                    <span className="input-icon-addon border-end">
                                        <i className="ti ti-search" />
                                    </span>
                                </div>
                                <div className="dropdown w-100">
                                    <Link
                                        href="#"
                                        className="dropdown-toggle w-100 btn btn-white d-inline-flex align-items-center justify-content-between"
                                        data-bs-toggle="dropdown"
                                    >
                                        All Status
                                    </Link>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                In Use
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Available
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Active
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Under Repair
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <div className="dropdown w-100">
                                    <Link
                                        href="#"
                                        className="dropdown-toggle w-100 btn btn-white d-inline-flex align-items-center justify-content-between"
                                        data-bs-toggle="dropdown"
                                    >
                                        All Categories
                                    </Link>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Laptops
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Mouse
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Keyboard
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Chairs
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-nowrap mb-0">
                                <thead>
                                    <tr>
                                        <th>Asset ID</th>
                                        <th>Asset Name</th>
                                        <th>Assigned To</th>
                                        <th>Purchase Date</th>
                                        <th>Warranty Expiry</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-782</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Dell XPS 13"</p>
                                        </td>
                                        <td>
                                            <p>Sarah Johnson</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2022-08-20
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2025-08-20
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                In Use
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-815</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">HP EliteBook</p>
                                        </td>
                                        <td>
                                            <p>David Lee</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2022-09-10
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2025-09-10
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-236</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Lenovo ThinkPad</p>
                                        </td>
                                        <td>
                                            <p>Emily Wilson</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2022-10-01
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2025-10-01
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                In Use
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-947</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Apple iPad Pro</p>
                                        </td>
                                        <td>
                                            <p>Unassigned</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2022-11-15
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2025-11-15
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-purple d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                Available
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-529</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Samsung Monitor</p>
                                        </td>
                                        <td>
                                            <p>Ashley Green</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2022-12-05
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2025-12-05
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-681</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Logitech Mouse</p>
                                        </td>
                                        <td>
                                            <p>Andrew Brown</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2023-01-25
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2026-01-25
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-danger d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                Under Repair
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-354</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Ergonomic Keyboard</p>
                                        </td>
                                        <td>
                                            <p>Jessica White</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2023-02-14
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2026-02-14
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-496</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Office Chair</p>
                                        </td>
                                        <td>
                                            <p>Jason Hill</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2023-03-08
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2026-03-08
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-123</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Standing Desk</p>
                                        </td>
                                        <td>
                                            <p>Megan King</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2023-04-02
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2026-04-02
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Link href="#">
                                                <p className="text-gray-5">AP-069</p>
                                            </Link>
                                        </td>
                                        <td>
                                            <p className="fw-medium text-dark">Plantronics Headset</p>
                                        </td>
                                        <td>
                                            <p>Brandon Wright</p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2023-05-19
                                            </p>
                                        </td>
                                        <td>
                                            <p>
                                                <i className="ti ti-calendar-up me-1" />
                                                2026-05-19
                                            </p>
                                        </td>
                                        <td>
                                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                                                <i className="ti ti-point-filled " />
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icon d-inline-flex">
                                                <Link href="#" className="me-1">
                                                    <i className="ti ti-edit" />
                                                </Link>
                                                <Link href="#">
                                                    <i className="ti ti-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
        </>
    )
}

export default AssetDashboardComponent