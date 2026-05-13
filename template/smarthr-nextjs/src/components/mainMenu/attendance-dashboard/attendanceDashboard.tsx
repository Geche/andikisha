"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header"
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import { Calendar } from "primereact/calendar";
import { useState } from "react";
import AttendanceTrendChart from "./charts/attendanceTrendChart";
import OfficeChart from "./charts/officeChart";
import ArrivalChart from "./charts/arrivalChart";
import ArrivalMiniChart from "./charts/arrivalChart";
import ViolationMiniChart from "./charts/violationChart";
import CommonFooter from "@/core/common/commonFooter/footer";
import { DatePicker } from "antd";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

const AttendanceDashboardComponent = () => {
    const [date, setDate] = useState(new Date());
    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-xl-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Attendance Dashboard</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Dashboard</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Attendance Dashboard
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-3 p-2 border avatar-groups  rounded">
                                <h5 className="d-flex align-items-center gap-1">
                                    <i className="ti ti-circle-filled text-primary fs-8" /> 06{" "}
                                    <span className="fs-13 fw-normal">Total Leaves</span>{" "}
                                </h5>
                                <div className="avatar-list-stacked avatar-group-sm ms-4">
                                    <span className="avatar avatar-rounded">
                                        <ImageWithBasePath
                                            className="border border-white"
                                            src="assets/img/profiles/avatar-02.jpg"
                                            alt="img"
                                        />
                                    </span>
                                    <span className="avatar avatar-rounded">
                                        <ImageWithBasePath
                                            className="border border-white"
                                            src="assets/img/profiles/avatar-03.jpg"
                                            alt="img"
                                        />
                                    </span>
                                    <span className="avatar avatar-rounded">
                                        <ImageWithBasePath
                                            className="border border-white"
                                            src="assets/img/profiles/avatar-05.jpg"
                                            alt="img"
                                        />
                                    </span>
                                    <span className="avatar avatar-rounded">
                                        <ImageWithBasePath
                                            className="border border-white"
                                            src="assets/img/profiles/avatar-06.jpg"
                                            alt="img"
                                        />
                                    </span>
                                    <span className="avatar avatar-rounded">
                                        <ImageWithBasePath
                                            className="border border-white"
                                            src="assets/img/profiles/avatar-07.jpg"
                                            alt="img"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="me-2">
                                <div className="input-icon position-relative month-year-calendar">
                                    <span className="input-icon-addon">
                                        <i className="ti ti-calendar text-gray-9" />
                                    </span>
                                    <Calendar value={date} onChange={(e: any) => setDate(e.value)} view="month" dateFormat="M yy" className="Calendar-form" />
                                </div>
                            </div>
                            <Link
                                href="#"
                                className="btn btn-primary-gradient d-flex align-items-center gap-1"
                            >
                                {" "}
                                <i className="ti ti-plus" /> Apply Leave{" "}
                            </Link>
                            <div className="ms-2 mt-2 head-icons">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    {/* Overview Statistics */}
                    <div className="card">
                        <div className="card-body">
                            <div className="mb-1 d-flex align-items-center justify-content-between gap-2 flex-wrap mb-4">
                                <h2 className="card-title mb-0">Overview Statistics</h2>
                                <div className="dropdown">
                                    <Link
                                        href="#"
                                        className="border btn btn-white fw-normal d-inline-flex align-items-center justify-content-center rounded-pill gap-2"
                                        data-bs-toggle="dropdown"
                                    >
                                        <i className="ti ti-calendar fs-14" /> Today
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
                            {/* start row */}
                            <div className="row row-gap-4">
                                {/* Item 1 */}
                                <div className="col-xxl-4 col-xl-6 col-lg-6 col-sm-6">
                                    <div className="card bg-light stat-card border shadow-none">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="fs-14 fw-medium mb-2">Total Employees</p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h3 className="fs-20 mb-0">2,847</h3>
                                                        <div className="d-flex align-items-center gap-1">
                                                            {" "}
                                                            <span className="badge bg-success d-inline-flex align-items-center gap-1 rounded fs-12">
                                                                {" "}
                                                                <i className="ti ti-arrow-up-right" /> 12%
                                                            </span>{" "}
                                                            vs yesterday{" "}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="avatar avatar-lg bg-primary">
                                                    <ImageWithBasePath
                                                        src="assets/img/icons/attendance-icon-1.svg"
                                                        alt="attendance"
                                                        className="img-fluid img-1"
                                                    />
                                                    <div className="avatar-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Item 2 */}
                                <div className="col-xxl-4 col-xl-6 col-lg-6 col-sm-6">
                                    <div className="card bg-light stat-card border shadow-none">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="fs-14 fw-medium mb-2">Present Today</p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h3 className="fs-20 mb-0">2,458</h3>
                                                        <div className="d-flex align-items-center gap-1">
                                                            {" "}
                                                            <span className="badge bg-danger d-inline-flex align-items-center gap-1 rounded fs-12">
                                                                {" "}
                                                                <i className="ti ti-arrow-down-right" /> 3.2%
                                                            </span>{" "}
                                                            vs yesterday{" "}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="avatar avatar-lg bg-secondary">
                                                    <ImageWithBasePath
                                                        src="assets/img/icons/attendance-icon-2.svg"
                                                        alt="attendance"
                                                        className="img-fluid img-1"
                                                    />
                                                    <div className="avatar-1 two" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Item 3 */}
                                <div className="col-xxl-4 col-xl-6 col-lg-6 col-sm-6">
                                    <div className="card bg-light stat-card border shadow-none">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="fs-14 fw-medium mb-2">Absent Today</p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h3 className="fs-20 mb-0">124</h3>
                                                        <div className="d-flex align-items-center gap-1">
                                                            {" "}
                                                            <span className="badge bg-warning d-inline-flex align-items-center gap-1 rounded fs-12">
                                                                {" "}
                                                                <i className="ti ti-arrow-up-right" /> 1.4%
                                                            </span>{" "}
                                                            vs yesterday{" "}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="avatar avatar-lg bg-warning">
                                                    <ImageWithBasePath
                                                        src="assets/img/icons/attendance-icon-2.svg"
                                                        alt="attendance"
                                                        className="img-fluid img-1"
                                                    />
                                                    <div className="avatar-1 three" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Item 4 */}
                                <div className="col-xxl-4 col-xl-6 col-lg-6 col-sm-6">
                                    <div className="card bg-light stat-card border shadow-none">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="fs-14 fw-medium mb-2">Late Arrivals</p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h3 className="fs-20 mb-0">89</h3>
                                                        <div className="d-flex align-items-center gap-1">
                                                            {" "}
                                                            <span className="badge bg-info d-inline-flex align-items-center gap-1 rounded fs-12">
                                                                {" "}
                                                                <i className="ti ti-arrow-up-right" /> 12%
                                                            </span>{" "}
                                                            vs yesterday{" "}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="avatar avatar-lg bg-info">
                                                    <ImageWithBasePath
                                                        src="assets/img/icons/attendance-icon-3.svg"
                                                        alt="attendance"
                                                        className="img-fluid img-1"
                                                    />
                                                    <div className="avatar-1 four" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Item 5 */}
                                <div className="col-xxl-4 col-xl-6 col-lg-6 col-sm-6">
                                    <div className="card bg-light stat-card border shadow-none">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="fs-14 fw-medium mb-2">Attendance Rate</p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h3 className="fs-20 mb-0">86.3%</h3>
                                                        <div className="d-flex align-items-center gap-1">
                                                            {" "}
                                                            <span className="badge bg-success d-inline-flex align-items-center gap-1 rounded fs-12">
                                                                {" "}
                                                                <i className="ti ti-arrow-up-right" /> 2.5%
                                                            </span>{" "}
                                                            vs yesterday{" "}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="avatar avatar-lg bg-purple">
                                                    <ImageWithBasePath
                                                        src="assets/img/icons/attendance-icon-4.svg"
                                                        alt="attendance"
                                                        className="img-fluid img-1"
                                                    />
                                                    <div className="avatar-1 five" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Item 6 */}
                                <div className="col-xxl-4 col-xl-6 col-lg-6 col-sm-6">
                                    <div className="card bg-light stat-card border shadow-none">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="fs-14 fw-medium mb-2">
                                                        Pending Regularizations
                                                    </p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h3 className="fs-20 mb-0">42</h3>
                                                        <div className="d-flex align-items-center gap-1">
                                                            {" "}
                                                            <span className="badge bg-danger d-inline-flex align-items-center gap-1 rounded fs-12">
                                                                {" "}
                                                                <i className="ti ti-arrow-down-right" /> 7%
                                                            </span>{" "}
                                                            vs yesterday{" "}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="avatar avatar-lg bg-danger">
                                                    <ImageWithBasePath
                                                        src="assets/img/icons/attendance-icon-5.svg"
                                                        alt="attendance"
                                                        className="img-fluid img-1"
                                                    />
                                                    <div className="avatar-1 six" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Attendance Trends */}
                    <div className="row row-gap-4 mb-4">
                        <div className="col-xxl-8">
                            <div className="card mb-0">
                                <div className="card-body pb-2">
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-2">
                                        <h2 className="card-title mb-0">Attendance Trends</h2>
                                        <div className="day-active-item d-inline-flex align-items-center gap-2">
                                            <button className="day">1D</button>
                                            <button className="day">7D</button>
                                            <button className="day">1M</button>
                                            <button className="day active">1Y</button>
                                        </div>
                                    </div>
                                    <AttendanceTrendChart />
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-4">
                            <div className="card bg-dark position-relative mb-0">
                                <div className="card-body position-relative z-1">
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-4">
                                        <h2 className="card-title mb-0 text-white">
                                            Attendance Status
                                        </h2>
                                        <div className="border btn btn-white btn-icon btn-md d-inline-flex align-items-center justify-content-center rounded-circle">
                                            <i className="ti ti-calendar text-dark fs-18" />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <p className="mb-1 text-white">Total Working Days</p>
                                        <h3 className="main-title mb-0 text-white">300</h3>
                                    </div>
                                    <div className="progress working-progress bg-soft-light mb-1 py-1 px-1 px-1 mb-3">
                                        <div
                                            className="progress-bar bg-primary  me-1"
                                            role="progressbar"
                                            style={{ width: "40%" }}
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="Top"
                                        />
                                        <div
                                            className="progress-bar bg-primary-8  me-1"
                                            role="progressbar"
                                            style={{ width: "20%" }}
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="Top"
                                        />
                                        <div
                                            className="progress-bar bg-primary-7  me-1"
                                            role="progressbar"
                                            style={{ width: "10%" }}
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="Top"
                                        />
                                        <div
                                            className="progress-bar bg-primary-6  me-1"
                                            role="progressbar"
                                            style={{ width: "10%" }}
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="Top"
                                        />
                                        <div
                                            className="progress-bar bg-primary-5"
                                            role="progressbar"
                                            style={{ width: "20%" }}
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="Top"
                                        />
                                    </div>
                                    <div className="attendance-percent d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
                                        <div className="percent">
                                            {" "}
                                            <i className="ti ti-circle-filled fs-10 text-primary" />{" "}
                                            Present{" "}
                                        </div>
                                        <p className="mb-0">2458</p>
                                    </div>
                                    <div className="attendance-percent d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
                                        <div className="percent">
                                            {" "}
                                            <i className="ti ti-circle-filled fs-10 text-primary-8" /> WFH{" "}
                                        </div>
                                        <p className="mb-0">187</p>
                                    </div>
                                    <div className="attendance-percent d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
                                        <div className="percent">
                                            {" "}
                                            <i className="ti ti-circle-filled fs-10 text-primary-7" />{" "}
                                            Late{" "}
                                        </div>
                                        <p className="mb-0">89</p>
                                    </div>
                                    <div className="attendance-percent d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
                                        <div className="percent">
                                            {" "}
                                            <i className="ti ti-circle-filled fs-10 text-primary-6" /> On
                                            Leave{" "}
                                        </div>
                                        <p className="mb-0">78</p>
                                    </div>
                                    <div className="attendance-percent d-flex align-items-center justify-content-between gap-2 flex-wrap mb-0">
                                        <div className="percent">
                                            {" "}
                                            <i className="ti ti-circle-filled fs-10 text-primary-5" />{" "}
                                            Absent{" "}
                                        </div>
                                        <p className="mb-0">124</p>
                                    </div>
                                </div>
                                <ImageWithBasePath
                                    src="assets/img/bg/attendance-bg-2.png"
                                    alt="attendance"
                                    className="img-fluid img-1 position-absolute top-0 end-0"
                                />
                            </div>
                        </div>
                    </div>
                    {/* start row */}
                    <div className="row row-gap-4 mb-4">
                        <div className="col-xxl-6 col-xl-12 col-lg-12 d-flex">
                            <div className="card mb-0 flex-fill">
                                <div className="card-body pb-2">
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-2">
                                        <h2 className="card-title mb-0">Office vs Remote</h2>
                                        <div className="d-flex align-items-center gap-2">
                                            <p className="d-inline-flex align-items-center gap-1 mb-0">
                                                {" "}
                                                <i className="ti ti-circle-filled fs-8 text-primary" />{" "}
                                                Office{" "}
                                            </p>
                                            <p className="d-inline-flex align-items-center gap-1 mb-0">
                                                {" "}
                                                <i className="ti ti-circle-filled fs-8 text-secondary" />{" "}
                                                Remote{" "}
                                            </p>
                                        </div>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-chevron-left fs-14 text-gray-5" />
                                                <i className="ti ti-calendar fs-14" /> Weekly{" "}
                                                <i className="ti ti-chevron-right fs-14 text-gray-5" />
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
                                    <OfficeChart />
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-6 col-xl-12 col-lg-12 d-flex">
                            <div className="card mb-0 flex-fill">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-4">
                                        <h2 className="card-title mb-0">Attendance Summary</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-chevron-left fs-14 text-gray-5" />
                                                <i className="ti ti-calendar fs-14" /> Today{" "}
                                                <i className="ti ti-chevron-right fs-14 text-gray-5" />
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
                                    <div className="avghours-container mb-4">
                                        <div className="fs-14 fw-medium text-gray-6">
                                            Avg Working Hours
                                        </div>
                                        <div className="progress-area">
                                            <div className="tooltip-bubble" style={{ left: "75%" }}>
                                                9.5 hrs
                                                <span className="tooltip-arrow" />
                                            </div>
                                            <div className="progress-bar-track">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: "75%" }}
                                                />
                                                <div className="track-dots" />
                                            </div>
                                        </div>
                                        <p className="d-inline-flex align-items-center gap-2">
                                            <span className="badge bg-danger d-inline-flex align-items-center gap-1 fs-12">
                                                <i className="ti ti-arrow-down-right" />
                                                3.2%
                                            </span>
                                            Compared to yesterday
                                        </p>
                                    </div>
                                    <div className="row row-gap-3">
                                        <div className="col-lg-4">
                                            <div className="card text-center mb-0 shadow-none">
                                                <div className="card-body">
                                                    <h3 className="main-title mb-1">2,458</h3>
                                                    <p>Check-in Count</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="card text-center mb-0 shadow-none">
                                                <div className="card-body">
                                                    <h3 className="main-title mb-1">2,201</h3>
                                                    <p>Check-out Count</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="card text-center mb-0 shadow-none">
                                                <div className="card-body">
                                                    <h3 className="main-title mb-1">9:12 AM</h3>
                                                    <p>Check-in Time</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* end row */}
                    {/* Frequent Late Arrivals */}
                    <div className="row row-gap-4 mb-4 justify-content-center">
                        {/* Item 1 */}
                        <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-6 d-flex">
                            <div className="card arrival-card flex-fill mb-0">
                                <div className="card-body position-relative z-1">
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-4">
                                        <h2 className="card-title mb-0">Frequent Late Arrivals</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-chevron-left fs-14 text-gray-5" />
                                                <i className="ti ti-calendar fs-14" /> Today{" "}
                                                <i className="ti ti-chevron-right fs-14 text-gray-5" />
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
                                    <p className="mb-1">No of Employees</p>
                                    <h3 className="main-title mb-0 d-flex align-items-center gap-2">
                                        22{" "}
                                        <span className="badge badge-soft-purple fs-11">Warnings</span>{" "}
                                    </h3>
                                    <div className="mt-4 d-flex align-items-center justify-content-between gap-2">
                                        <div className="avatar-list-stacked avatar-group-sm">
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-02.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-03.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-05.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-06.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-07.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <Link
                                                className="avatar bg-white avatar-rounded text-fixed-white fs-12 border text-dark"
                                                href="#"
                                            >
                                                <span className="text-dark">+9</span>
                                            </Link>
                                        </div>
                                        <div className="border rounded-pill fs-13 text-gray-9 d-inline-flex align-items-center gap-2 p-1 ps-2 bg-white">
                                            +18%
                                            <p
                                                className="btn btn-sm btn-icon bg-danger pe-none rounded-circle d-flex align-items-center justify-content-center fs-20 text-white"
                                            >
                                                <i className="ti ti-arrow-down-right" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ImageWithBasePath
                                    src="assets/img/bg/attendance-bg.png"
                                    alt="attendance"
                                    className="img-fluid img-1"
                                />
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-6 d-flex">
                            <div className="card arrival-card flex-fill mb-0">
                                <div className="card-body position-relative z-1">
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-4">
                                        <h2 className="card-title mb-0">Missing Punches</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-chevron-left fs-14 text-gray-5" />
                                                <i className="ti ti-calendar fs-14" /> Today{" "}
                                                <i className="ti ti-chevron-right fs-14 text-gray-5" />
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
                                    <p className="mb-1">Total Number of Missing Punches</p>
                                    <h3 className="main-title mb-0 d-flex align-items-center gap-2">
                                        09{" "}
                                        <span className="badge badge-soft-danger fs-11">Critical</span>{" "}
                                    </h3>
                                    <div className="mt-4 d-flex align-items-center justify-content-between gap-2">
                                        <div className="avatar-list-stacked avatar-group-sm">
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-02.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-03.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-05.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-06.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <span className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/profiles/avatar-07.jpg"
                                                    alt="img"
                                                />
                                            </span>
                                            <Link
                                                className="avatar bg-white avatar-rounded text-fixed-white fs-12 border text-dark"
                                                href="#"
                                            >
                                                <span className="text-dark">+6</span>
                                            </Link>
                                        </div>
                                        <div className="border rounded-pill fs-13 text-gray-9 d-inline-flex align-items-center gap-2 p-1 ps-2 bg-white">
                                            +18%
                                            <p
                                                className="btn btn-sm btn-icon bg-success pe-none rounded-circle d-flex align-items-center justify-content-center fs-20 text-white"
                                            >
                                                <i className="ti ti-arrow-up-right" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ImageWithBasePath
                                    src="assets/img/bg/attendance-bg-1.png"
                                    alt="attendance"
                                    className="img-fluid img-1"
                                />
                            </div>
                        </div>
                        {/* Item 3 */}
                        <div className="col-xxl-4 col-xl-6 d-flex">
                            <div className="card arrival-card flex-fill mb-0">
                                <div className="card-body position-relative z-1">
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-4">
                                        <h2 className="card-title mb-0">Violations Statistics</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-chevron-left fs-14 text-gray-5" />
                                                <i className="ti ti-calendar fs-14" /> Today{" "}
                                                <i className="ti ti-chevron-right fs-14 text-gray-5" />
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
                                    {/* start row */}
                                    <div className="row row-gap-3">
                                        <div className="col-sm-7">
                                            <p className="mb-3 d-flex align-items-center gap-2 text-dark">
                                                {" "}
                                                <span className="stat-pill bg-primary-gradient" /> Late
                                                Arrivals{" "}
                                            </p>
                                            <p className="mb-3 d-flex align-items-center gap-2 text-dark">
                                                {" "}
                                                <span className="stat-pill bg-secondary-gradient" /> Missing
                                                Punches{" "}
                                            </p>
                                            <p className="mb-0 d-flex align-items-center gap-2 text-dark">
                                                {" "}
                                                <span className="stat-pill bg-success-gradient" />{" "}
                                                Attendance Below 75%{" "}
                                            </p>
                                        </div>
                                        <div className="col-sm-5">
                                            <ViolationMiniChart />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Late Arrivals & Alerts  */}
                    <div className="row row-gap-4 mb-4">
                        <div className="col-xxl-7">
                            <div className="card mb-0">
                                <div className="card-body">
                                    <div className="mb-1 d-flex align-items-center justify-content-between gap-2 flex-wrap mb-4">
                                        <h2 className="card-title mb-0">Late Arrivals &amp; Alerts</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white fw-normal d-inline-flex align-items-center justify-content-center rounded gap-1"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-chevron-left fs-14 text-gray-5" />
                                                <i className="ti ti-calendar fs-14" /> Today{" "}
                                                <i className="ti ti-chevron-right fs-14 text-gray-5" />
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
                                    <div className="alerts-list">
                                        {/* Item 1 */}
                                        <div className="alerts-item mb-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar rounded-circle">
                                                        <ImageWithBasePath
                                                            src="assets/img/users/user-06.jpg"
                                                            alt="user"
                                                            className="img-fluid img-1 rounded-circle"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="fs-14 fw-medium mb-1">
                                                            <Link href="#">Michael Johnson</Link>
                                                        </h3>
                                                        <p className="mb-0  fs-13">Administration Head</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="d-flex align-items-center gap-1 fs-14 mb-0">
                                                    <span className="fw-normal text-gray-6 ">Check-in: </span>{" "}
                                                    09:45 AM
                                                </h4>
                                            </div>
                                            <div className="d-flex justify-content-center">
                                                <ArrivalMiniChart filledBars={6} />
                                            </div>
                                        </div>
                                        {/* Item 2 */}
                                        <div className="alerts-item mb-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar rounded-circle">
                                                        <ImageWithBasePath
                                                            src="assets/img/users/user-07.jpg"
                                                            alt="user"
                                                            className="img-fluid img-1 rounded-circle"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="fs-14 fw-medium mb-1">
                                                            <Link href="#">Emily Davis</Link>
                                                        </h3>
                                                        <p className="mb-0  fs-13">Frontend Developer</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="d-flex align-items-center gap-1 fs-14 mb-0">
                                                    <span className="fw-normal text-gray-6 ">Check-in: </span>{" "}
                                                    09:30 AM
                                                </h4>
                                            </div>
                                            <div className="d-flex justify-content-center">
                                                <ArrivalMiniChart filledBars={5} />
                                            </div>
                                        </div>
                                        {/* Item 3 */}
                                        <div className="alerts-item mb-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar rounded-circle">
                                                        <ImageWithBasePath
                                                            src="assets/img/users/user-08.jpg"
                                                            alt="user"
                                                            className="img-fluid img-1 rounded-circle"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="fs-14 fw-medium mb-1">
                                                            <Link href="#">Robert Martinez</Link>
                                                        </h3>
                                                        <p className="mb-0  fs-13">Finance Manager</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="d-flex align-items-center gap-1 fs-14 mb-0">
                                                    <span className="fw-normal text-gray-6 ">Check-in: </span>{" "}
                                                    09:25 AM
                                                </h4>
                                            </div>
                                            <div className="d-flex justify-content-center">
                                                <ArrivalMiniChart filledBars={4} />
                                            </div>
                                        </div>
                                        {/* Item 4 */}
                                        <div className="alerts-item">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar rounded-circle">
                                                        <ImageWithBasePath
                                                            src="assets/img/users/user-09.jpg"
                                                            alt="user"
                                                            className="img-fluid img-1 rounded-circle"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="fs-14 fw-medium mb-1">
                                                            <Link href="#">Megan Walker</Link>
                                                        </h3>
                                                        <p className="mb-0  fs-13">SEO Analyst</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="d-flex align-items-center gap-1 fs-14 mb-0">
                                                    <span className="fw-normal text-gray-6 ">Check-in: </span>{" "}
                                                    09:10 AM
                                                </h4>
                                            </div>
                                            <div className="d-flex justify-content-center">
                                                <ArrivalMiniChart filledBars={3} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* AI Assistant */}
                        <div className="col-xxl-5 d-flex">
                            <div className="card flex-fill bg-linear-gradient mb-0">
                                <div className="card-header bg-dark">
                                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="avatar avatar-xl bg-white rounded-circle">
                                                <i className="ti ti-sparkles fs-24 text-dark" />
                                            </div>
                                            <div>
                                                <h4 className="mb-1 text-white">AI Assistant</h4>
                                                <p className="fs-13 mb-0 text-white">Always here to help</p>
                                            </div>
                                        </div>
                                        <span className="badge bg-success d-inline-flex align-items-center gap-1 rounded-pill">
                                            <i className="ti ti-point-filled text-white fs-5 lh-0" />
                                            Online
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body bg-light">
                                    <span className="d-flex align-items-center gap-2 mb-2 text-secondary">
                                        {" "}
                                        <i className="ti ti-sparkles text-secondary" /> AI Assistant
                                    </span>
                                    <p className="mb-0 text-gray-5">
                                        Hello! I'm your AI Attendance Assistant. I can help you analyze
                                        attendance patterns, generate reports, and provide insights. How
                                        can I assist you today?
                                    </p>
                                </div>
                                <div className="card-body chat-inner-item">
                                    <p className="mb-3 fs-14 text-dark">Suggested Questions</p>
                                    <div className="d-inline-flex flex-column gap-2">
                                        <p className="mb-2 prompt">
                                            Show me today's attendance summary
                                        </p>
                                        <p className="mb-0 prompt active">
                                            Why is attendance low on Fridays?
                                        </p>
                                    </div>
                                </div>
                                <div className="card-body border-top">
                                    <div className="chat-input-item item-new">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ask me anything about payroll"
                                        />
                                        <Link href="#" className="btn btn-icon">
                                            <i className="ti ti-send" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
        </>
    )
}

export default AttendanceDashboardComponent