import PredefinedDatePicker from '@/core/common/datePicker'
import ImageWithBasePath from '@/core/common/imageWithBasePath'
import EmployeeStatusChart from './charts/employeeStatusChart'
import CollapseHeader from '@/core/common/collapse-header/collapse-header'
import LeaveTypeChart from './charts/leaveTypeChart'
import AttendanceChart from './charts/attendanceChart'
import EmployeeDistributionChart from './charts/employeeDistributionChart'
import DeductionChart from './charts/deductionChart'
import PayrollChart from './charts/payrollChart'
import CommonFooter from '@/core/common/commonFooter/footer'
import TrainingChart from './charts/trainingChart'
import ImagePointChart from './charts/topEmployeeChart'
import { all_routes } from '@/routes/all_routes'
import Link from 'next/link'

const HrDashboardComponent = () => {
    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">HR Dashboard</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Dashboard</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        HR Dashboard
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-3 mb-2">
                            <div className="avatar-list-stacked avatar-group-md">
                                <Link href="#" className="avatar avatar-rounded">
                                    <ImageWithBasePath
                                        className="border border-white"
                                        src="assets/img/users/user-31.jpg"
                                        alt="user"
                                    />
                                </Link>
                                <Link href="#" className="avatar avatar-rounded">
                                    <ImageWithBasePath
                                        className="border border-white"
                                        src="assets/img/users/user-32.jpg"
                                        alt="user"
                                    />
                                </Link>
                                <Link href="#" className="avatar avatar-rounded">
                                    <ImageWithBasePath
                                        className="border border-white"
                                        src="assets/img/users/user-29.jpg"
                                        alt="user"
                                    />
                                </Link>
                                <Link href="#" className="avatar avatar-rounded">
                                    <ImageWithBasePath
                                        className="border border-white"
                                        src="assets/img/users/user-56.jpg"
                                        alt="user"
                                    />
                                </Link>
                                <Link
                                    className="avatar bg-dark avatar-rounded fs-20 text-fixed-white"
                                    href="#"
                                >
                                    +
                                </Link>
                            </div>
                            <div className="me-3 input-icon position-relative">
                                <PredefinedDatePicker />
                            </div>
                            <div className="dropdown">
                                <Link
                                    href="#"
                                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                                    data-bs-toggle="dropdown"
                                >
                                    <i className="ti ti-file-export me-1" />
                                    Yearly Report
                                </Link>
                                <ul className="dropdown-menu  dropdown-menu-end p-3">
                                    <li>
                                        <Link
                                            href="#"
                                            className="dropdown-item rounded-1"
                                        >
                                            Monthly Report
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="dropdown-item rounded-1"
                                        >
                                            Yearly Report{" "}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="dropdown">
                                <Link
                                    href="#"
                                    className="dropdown-toggle btn btn-primary d-inline-flex align-items-center"
                                    data-bs-toggle="dropdown"
                                >
                                    Add New
                                </Link>
                                <ul className="dropdown-menu  dropdown-menu-end p-3">
                                    <li>
                                        <Link href={all_routes.employeeList} className="dropdown-item rounded-1">
                                            Employee
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={all_routes.attendanceemployee}
                                            className="dropdown-item rounded-1"
                                        >
                                            Attendance
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={all_routes.leaveadmin} className="dropdown-item rounded-1">
                                            Leave
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-2 head-icons">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    {/* start row */}
                    <div className="row">
                        <div className="col-xl-5 d-flex flex-column">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Employee Status &amp; Type</h2>
                                        <Link href={all_routes.employeereport} className="btn btn-md btn-light">
                                            View All
                                        </Link>
                                    </div>
                                    <div className="mb-3">
                                        <EmployeeStatusChart />
                                    </div>
                                    <div className="row">
                                        <div className="col-4">
                                            <div className="text-center">
                                                <h3 className="main-title mb-1">1054</h3>
                                                <p className="d-inline-flex align-items-center mb-0">
                                                    <span className="chart-line bg-primary me-1" />
                                                    Full-Time
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-center">
                                                <h3 className="main-title mb-1">568</h3>
                                                <p className="d-inline-flex align-items-center mb-0">
                                                    <span className="chart-line bg-secondary me-1" />
                                                    Contract
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-center">
                                                <h3 className="main-title mb-1">80</h3>
                                                <p className="d-inline-flex align-items-center mb-0">
                                                    <span className="chart-line bg-light me-1" />
                                                    Probation
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card flex-fill">
                                <div className="card-body pb-sm-2">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Leave Type Disribution</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar-due me-1" />
                                                Monthly
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
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
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-5">
                                            <LeaveTypeChart />
                                        </div>
                                        <div className="col-sm-7">
                                            <div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="d-inline-flex align-items-center text-dark mb-0">
                                                        <i className="ti ti-circle-filled text-primary-900 fs-7 me-1" />
                                                        Sick Leave
                                                    </p>
                                                    <span className="badge fw-normal bg-light text-dark border rounded-pill fs-13">
                                                        45
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="d-inline-flex align-items-center text-dark mb-0">
                                                        <i className="ti ti-circle-filled text-primary-800 fs-7 me-1" />
                                                        Casual Leave
                                                    </p>
                                                    <span className="badge fw-normal bg-light text-dark border rounded-pill fs-13">
                                                        68
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="d-inline-flex align-items-center text-dark mb-0">
                                                        <i className="ti ti-circle-filled text-primary-700 fs-7 me-1" />
                                                        Unpaid
                                                    </p>
                                                    <span className="badge fw-normal bg-light text-dark border rounded-pill fs-13">
                                                        12
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                        <div className="col-xl-7">
                            <div className="card">
                                <div className="card-body">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Overview Statistics</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar-due me-1" />
                                                Monthly
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
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
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6 d-flex">
                                            <div className="card shadow-none mb-0 flex-fill">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className="avatar avatar-lg bg-primary rounded-circle flex-shrink-0">
                                                            <i className="ti ti-users-group text-white fs-24" />
                                                        </div>
                                                        <div className="ms-2">
                                                            <p className="fw-semibold text-truncate mb-0">
                                                                Total Employees
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <h3 className="main-title mb-1">1,848</h3>
                                                            <p className="fs-13 mb-0">Headcount Overview</p>
                                                        </div>
                                                        <div className="d-inline-flex align-items-center bg-light border rounded-pill text-dark p-1 ps-2">
                                                            +18%
                                                            <span className="bg-success btn-icon btn-sm rounded-circle d-flex align-items-center justify-content-center ms-1">
                                                                <i className="ti ti-arrow-up-right fs-20" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>{" "}
                                                {/* end card */}
                                            </div>{" "}
                                            {/* end card body */}
                                        </div>{" "}
                                        {/* end col */}
                                        <div className="col-md-6 d-flex">
                                            <div className="card shadow-none mb-0 flex-fill">
                                                <div className="card-body">
                                                    <div className="d-flex avatar-lg align-items-center mb-3">
                                                        <div className="avatar bg-secondary rounded-circle flex-shrink-0">
                                                            <i className="ti ti-users-plus text-white fs-24" />
                                                        </div>
                                                        <div className="ms-2">
                                                            <p className="fw-semibold text-truncate mb-0">
                                                                New Joinees
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <h3 className="main-title mb-1">1,248</h3>
                                                            <p className="fs-13 mb-0">All Department</p>
                                                        </div>
                                                        <div className="d-inline-flex align-items-center bg-light border rounded-pill text-dark p-1 ps-2">
                                                            +22%
                                                            <span className="bg-success btn-icon btn-sm rounded-circle d-flex align-items-center justify-content-center ms-1">
                                                                <i className="ti ti-arrow-up-right fs-20" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>{" "}
                                                {/* end card */}
                                            </div>{" "}
                                            {/* end card body */}
                                        </div>{" "}
                                        {/* end col */}
                                        <div className="col-md-6 d-flex">
                                            <div className="card shadow-none mb-0 flex-fill">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className="avatar avatar-lg bg-dark rounded-circle flex-shrink-0">
                                                            <i className="ti ti-clock-x text-white fs-24" />
                                                        </div>
                                                        <div className="ms-2">
                                                            <p className="fw-semibold text-truncate mb-0">
                                                                Late Arrivals Today
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <h3 className="main-title mb-1">12</h3>
                                                            <p className="fs-13 mb-0">Delayed Logins Today</p>
                                                        </div>
                                                        <div className="d-inline-flex align-items-center bg-light border rounded-pill text-dark p-1 ps-2">
                                                            -16%
                                                            <span className="bg-danger btn-icon btn-sm rounded-circle d-flex align-items-center justify-content-center ms-1">
                                                                <i className="ti ti-arrow-down-right fs-20" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>{" "}
                                                {/* end card */}
                                            </div>{" "}
                                            {/* end card body */}
                                        </div>{" "}
                                        {/* end col */}
                                        <div className="col-md-6 d-flex">
                                            <div className="card shadow-none mb-0 flex-fill">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className="avatar avatar-lg bg-purple rounded-circle flex-shrink-0">
                                                            <i className="ti ti-report-money text-white fs-24" />
                                                        </div>
                                                        <div className="ms-2">
                                                            <p className="fw-semibold text-truncate mb-0">
                                                                Total Payroll Cost
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <h3 className="main-title mb-1">$2.4M</h3>
                                                            <p className="fs-13 mb-0">Payroll Outflow</p>
                                                        </div>
                                                        <div className="d-inline-flex align-items-center bg-light border rounded-pill text-dark p-1 ps-2">
                                                            +16%
                                                            <span className="bg-success btn-icon btn-sm rounded-circle d-flex align-items-center justify-content-center ms-1">
                                                                <i className="ti ti-arrow-up-right fs-20" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>{" "}
                                                {/* end card */}
                                            </div>{" "}
                                            {/* end card body */}
                                        </div>{" "}
                                        {/* end col */}
                                    </div>
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                    </div>
                    {/* end row */}
                    {/* start row */}
                    <div className="row">
                        <div className="col-xl-8 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body pb-0">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Attendance Trend</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar-due me-1" />
                                                Weekly
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
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
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                                        <div className="d-flex align-items-center flex-wrap gap-3">
                                            <div className="d-flex align-items-center pe-3 border-end">
                                                <h3 className="mb-0">
                                                    82
                                                    <span className="ms-2 fw-normal fs-14 text-default">
                                                        On-Time
                                                    </span>
                                                </h3>
                                            </div>
                                            <div className="d-flex align-items-center pe-3 border-end">
                                                <h3 className="mb-0">
                                                    11
                                                    <span className="ms-2 fw-normal fs-14 text-default">
                                                        Late
                                                    </span>
                                                </h3>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <h3 className="mb-0">
                                                    6
                                                    <span className="ms-2 fw-normal fs-14 text-default">
                                                        Absent
                                                    </span>
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <p className="mb-0">
                                                <i className="ti ti-square-filled text-primary fs-12 me-1" />
                                                Present
                                            </p>
                                            <p className="mb-0">
                                                <i className="ti ti-square-filled text-secondary fs-12 me-1" />
                                                Late
                                            </p>
                                            <p className="mb-0">
                                                <i className="ti ti-square-filled text-warning fs-12 me-1" />
                                                Absent
                                            </p>
                                        </div>
                                    </div>
                                    <div className="d-sm-flex align-items-center flex-sm-row flex-column">
                                        <div className="w-100">
                                            <AttendanceChart />
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="border p-3 rounded text-center mb-3">
                                                <p className="mb-1">Max Working Hours</p>
                                                <h3 className="main-title mb-0">8.4 hrs</h3>
                                            </div>
                                            <div className="border p-3 rounded text-center mb-3">
                                                <p className="mb-1">Missed Punches</p>
                                                <h3 className="main-title mb-0">12</h3>
                                            </div>
                                            <div className="border p-3 rounded text-center mb-3">
                                                <p className="mb-1">Weekly Avg</p>
                                                <h3 className="main-title mb-0">97.2%</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                        <div className="col-xl-4 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body pb-0">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-0">
                                        <h2 className="card-title mb-0">Top Employee Distribution</h2>
                                        <Link href={all_routes.employeeList} className="btn btn-md btn-light">
                                            View All
                                        </Link>
                                    </div>
                                    <EmployeeDistributionChart />
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                    </div>
                    {/* end row */}
                    {/* start row */}
                    <div className="row">
                        <div className="col-xxl-4 col-xl-6 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Late Arrivals Today</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar-due me-1" />
                                                Today
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
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
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-light rounded border-bottom d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center">
                                            <Link
                                                href="#"
                                                className="avatar flex-shrink-0"
                                            >
                                                <ImageWithBasePath
                                                    src="assets/img/users/user-26.jpg"
                                                    className="rounded-circle"
                                                    alt="user"
                                                />
                                            </Link>
                                            <div className="ms-2">
                                                <p className="fs-14 fw-medium text-truncate mb-1">
                                                    <Link href="#">Jessica Brown</Link>
                                                </p>
                                                <p className="fs-13">Customer Support</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="fs-13 text-dark mb-1">10:15 AM</p>
                                            <span className="badge badge-danger-transparent rounded-pill">
                                                +45 Min
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-light rounded border-bottom d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center">
                                            <Link
                                                href="#"
                                                className="avatar flex-shrink-0"
                                            >
                                                <ImageWithBasePath
                                                    src="assets/img/users/user-31.jpg"
                                                    className="rounded-circle"
                                                    alt="user"
                                                />
                                            </Link>
                                            <div className="ms-2">
                                                <p className="fs-14 fw-medium text-truncate mb-1">
                                                    <Link href="#">Amanda Lewis</Link>
                                                </p>
                                                <p className="fs-13">HR Admin</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="fs-13 text-dark mb-1">10:25 AM</p>
                                            <span className="badge badge-danger-transparent rounded-pill">
                                                +55 Min
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-light rounded border-bottom d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center">
                                            <Link
                                                href="#"
                                                className="avatar flex-shrink-0"
                                            >
                                                <ImageWithBasePath
                                                    src="assets/img/users/user-27.jpg"
                                                    className="rounded-circle"
                                                    alt="user"
                                                />
                                            </Link>
                                            <div className="ms-2">
                                                <p className="fs-14 fw-medium text-truncate mb-1">
                                                    <Link href="#">James Clark</Link>
                                                </p>
                                                <p className="fs-13">Sales</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="fs-13 text-dark mb-1">10:00 AM</p>
                                            <span className="badge badge-danger-transparent rounded-pill">
                                                +30 Min
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-light rounded border-bottom d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center">
                                            <Link
                                                href="#"
                                                className="avatar flex-shrink-0"
                                            >
                                                <ImageWithBasePath
                                                    src="assets/img/users/user-56.jpg"
                                                    className="rounded-circle"
                                                    alt="user"
                                                />
                                            </Link>
                                            <div className="ms-2">
                                                <p className="fs-14 fw-medium text-truncate mb-1">
                                                    <Link href="#">Amanda Davis</Link>
                                                </p>
                                                <p className="fs-13">Administration</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="fs-13 text-dark mb-1">09:40 AM</p>
                                            <span className="badge badge-danger-transparent rounded-pill">
                                                +20 Min
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-light rounded border-bottom d-flex align-items-center justify-content-between mb-0">
                                        <div className="d-flex align-items-center">
                                            <Link
                                                href="#"
                                                className="avatar flex-shrink-0"
                                            >
                                                <ImageWithBasePath
                                                    src="assets/img/users/user-29.jpg"
                                                    className="rounded-circle"
                                                    alt="user"
                                                />
                                            </Link>
                                            <div className="ms-2">
                                                <p className="fs-14 fw-medium text-truncate mb-1">
                                                    <Link href="#">Lisa Anderson</Link>
                                                </p>
                                                <p className="fs-13">Finance</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="fs-13 text-dark mb-1">09:35 AM</p>
                                            <span className="badge badge-danger-transparent rounded-pill">
                                                +05 Min
                                            </span>
                                        </div>
                                    </div>
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                        <div className="col-xxl-4 col-xl-6 d-flex flex-column">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Recruitment Statistics</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar-due me-1" />
                                                Weekly
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
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
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="row g-3">
                                            <div className="col-6 col-sm-4">
                                                <div className="text-center">
                                                    <p className="mb-1">Applicants</p>
                                                    <h2 className="mb-0">487</h2>
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-4">
                                                <div className="text-center">
                                                    <p className="mb-1">Hired</p>
                                                    <h2 className="mb-0">24</h2>
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-4">
                                                <div className="text-center">
                                                    <p className="mb-1">Avg Time</p>
                                                    <h2 className="mb-0">28 days</h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="progress-stacked bg-white statistic-progress mb-4">
                                        <div
                                            className="progress overflow-hidden"
                                            role="progressbar"
                                            aria-label="Segment one"
                                            aria-valuenow={15}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            style={{ width: "42%" }}
                                        >
                                            <div className="progress-bar bg-primary" />
                                        </div>
                                        <div
                                            className="progress overflow-hidden"
                                            role="progressbar"
                                            aria-label="Segment two"
                                            aria-valuenow={30}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            style={{ width: "20%" }}
                                        >
                                            <div className="progress-bar bg-secondary" />
                                        </div>
                                        <div
                                            className="progress overflow-hidden"
                                            role="progressbar"
                                            aria-label="Segment three"
                                            aria-valuenow={20}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            style={{ width: "18%" }}
                                        >
                                            <div className="progress-bar bg-pink" />
                                        </div>
                                        <div
                                            className="progress overflow-hidden"
                                            role="progressbar"
                                            aria-label="Segment four"
                                            aria-valuenow={20}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            style={{ width: "20%" }}
                                        >
                                            <div className="progress-bar bg-success" />
                                        </div>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <div>
                                                <p className="d-inline-flex align-items-center text-dark fw-semibold mb-1">
                                                    <span className="chart-line bg-primary me-2" />
                                                    Applications
                                                </p>
                                                <p className="mb-0">
                                                    <span className="text-dark fw-medium">40%</span> - 57
                                                    Employees
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div>
                                                <p className="d-inline-flex align-items-center text-dark fw-semibold mb-1">
                                                    <span className="chart-line bg-secondary me-2" />
                                                    Screening
                                                </p>
                                                <p className="mb-0">
                                                    <span className="text-dark fw-medium">20%</span> - 36
                                                    Employees
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div>
                                                <p className="d-inline-flex align-items-center text-dark fw-semibold mb-1">
                                                    <span className="chart-line bg-pink me-2" />
                                                    Interview
                                                </p>
                                                <p className="mb-0">
                                                    <span className="text-dark fw-medium">23%</span> - 64
                                                    Employees
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div>
                                                <p className="d-inline-flex align-items-center text-dark fw-semibold mb-1">
                                                    <span className="chart-line bg-success me-2" />
                                                    Hired
                                                </p>
                                                <p className="mb-0">
                                                    <span className="text-dark fw-medium">17%</span> - 18
                                                    Employees
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                            <div className="card bg-secondary shadow-none z-1">
                                <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <div>
                                        <p className="text-white mb-1">Employees in Training</p>
                                        <h2 className="text-white mb-0">80</h2>
                                    </div>
                                    <div className="d-inline-flex align-items-center gap-2">
                                        <div className="avatar-list-stacked avatar-group-md">
                                            <Link href="#" className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/users/user-39.jpg"
                                                    alt="user"
                                                />
                                            </Link>
                                            <Link href="#" className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/users/user-41.jpg"
                                                    alt="user"
                                                />
                                            </Link>
                                            <Link href="#" className="avatar avatar-rounded">
                                                <ImageWithBasePath
                                                    className="border border-white"
                                                    src="assets/img/users/user-44.jpg"
                                                    alt="user"
                                                />
                                            </Link>
                                        </div>
                                        <div className="chartjs-wrapper-demo position-relative">
                                            <TrainingChart />
                                        </div>
                                    </div>
                                </div>{" "}
                                {/* end card body */}
                                <ImageWithBasePath
                                    src="assets/img/bg/emp-bg.png"
                                    alt="bg"
                                    className="img-fluid position-absolute top-0 start-1 z-n1"
                                />
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                        <div className="col-xxl-4 col-xl-12 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Upcoming Interview</h2>
                                        <div className="dropdown">
                                            <Link
                                                href="#"
                                                className="border btn btn-white btn-md d-inline-flex align-items-center"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-calendar-due me-1" />
                                                Today
                                            </Link>
                                            <ul className="dropdown-menu mt-2 p-3">
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
                                                        Weekly
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="#"
                                                        className="dropdown-item rounded-1"
                                                    >
                                                        Today
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded border border-start border-start-4 border-start-primary mb-3">
                                        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
                                            <div>
                                                <p className="text-dark fw-semibold mb-1">
                                                    UI/UX Design Interview
                                                </p>
                                                <p className="fs-13 mb-0">12:00 PM - 01:50 PM</p>
                                            </div>
                                            <div className="avatar-list-stacked avatar-group-md">
                                                <Link href="#" className="avatar avatar-rounded">
                                                    <ImageWithBasePath
                                                        className="border border-white"
                                                        src="assets/img/users/user-31.jpg"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <Link href="#" className="avatar avatar-rounded">
                                                    <ImageWithBasePath
                                                        className="border border-white"
                                                        src="assets/img/users/user-32.jpg"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <Link href="#" className="avatar avatar-rounded">
                                                    <ImageWithBasePath
                                                        className="border border-white"
                                                        src="assets/img/users/user-29.jpg"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <Link href="#" className="avatar avatar-rounded">
                                                    <ImageWithBasePath
                                                        className="border border-white"
                                                        src="assets/img/users/user-56.jpg"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <Link
                                                    className="avatar bg-light border avatar-rounded fs-16 text-dark fw-normal"
                                                    href="#"
                                                >
                                                    +9
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-sm-7">
                                                <Link
                                                    href="#"
                                                    className="btn btn-white d-flex align-items-center justify-content-center w-100"
                                                >
                                                    <i className="ti ti-calendar-due me-1" />
                                                    Add to Calendar
                                                </Link>
                                            </div>
                                            <div className="col-sm-5">
                                                <Link
                                                    href="#"
                                                    className="btn btn-light d-flex align-items-center justify-content-center w-100"
                                                >
                                                    <i className="ti ti-video me-1" />
                                                    Join Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded border border-start border-start-4 border-start-secondary mb-3">
                                        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
                                            <div>
                                                <p className="text-dark fw-semibold mb-1">
                                                    Senior Developer React
                                                </p>
                                                <p className="fs-13 mb-0">03:00 PM - 04:00 PM</p>
                                            </div>
                                            <div className="avatar-list-stacked avatar-group-md">
                                                <Link href="#" className="avatar avatar-rounded">
                                                    <ImageWithBasePath
                                                        className="border border-white"
                                                        src="assets/img/users/user-39.jpg"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <Link href="#" className="avatar avatar-rounded">
                                                    <ImageWithBasePath
                                                        className="border border-white"
                                                        src="assets/img/users/user-41.jpg"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <Link href="#" className="avatar avatar-rounded">
                                                    <ImageWithBasePath
                                                        className="border border-white"
                                                        src="assets/img/users/user-44.jpg"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <Link
                                                    className="avatar bg-light border avatar-rounded fs-16 text-dark fw-normal"
                                                    href="#"
                                                >
                                                    +4
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-sm-7">
                                                <Link
                                                    href="#"
                                                    className="btn btn-white d-flex align-items-center justify-content-center w-100"
                                                >
                                                    <i className="ti ti-calendar-due me-1" />
                                                    Add to Calendar
                                                </Link>
                                            </div>
                                            <div className="col-sm-5">
                                                <Link
                                                    href="#"
                                                    className="btn btn-light d-flex align-items-center justify-content-center w-100"
                                                >
                                                    <i className="ti ti-video me-1" />
                                                    Join Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={all_routes.candidatesGrid} className="btn btn-light w-100">
                                        View All
                                        <i className="ti ti-arrow-right ms-1" />
                                    </Link>
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                    </div>
                    {/* end row */}
                    {/* start row */}
                    <div className="row">
                        <div className="col-xl-7 d-flex flex-column">
                            {/* start row */}
                            <div className="row">
                                <div className="col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <p className="mb-1">Benefits Deductions</p>
                                                    <h2 className="mb-2">$56K</h2>
                                                    <p className="mb-0">Insurance + 401(k)</p>
                                                </div>
                                                <div>
                                                    <DeductionChart />
                                                </div>
                                            </div>
                                        </div>{" "}
                                        {/* end card body */}
                                    </div>{" "}
                                    {/* end card */}
                                </div>{" "}
                                {/* end col */}
                                <div className="col-md-6 d-flex">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <p className="mb-1">Total Payroll</p>
                                                    <h2 className="mb-2">$2.4M</h2>
                                                    <p className="mb-0">
                                                        <span className="text-success">
                                                            <i className="ti ti-arrow-wave-right-up me-1" />
                                                            +55%
                                                        </span>{" "}
                                                        Increased
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <div className="dropdown mb-3">
                                                        <Link
                                                            href="#"
                                                            className="border btn btn-white btn-md d-inline-flex align-items-center"
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            <i className="ti ti-calendar-due me-1" />
                                                            Monthly
                                                        </Link>
                                                        <ul className="dropdown-menu mt-2 p-3">
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
                                                                    Weekly
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href="#"
                                                                    className="dropdown-item rounded-1"
                                                                >
                                                                    Today
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <PayrollChart />
                                                </div>
                                            </div>
                                        </div>{" "}
                                        {/* end card body */}
                                    </div>{" "}
                                    {/* end card */}
                                </div>{" "}
                                {/* end col */}
                            </div>
                            {/* end row */}
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Top Employees</h2>
                                        <div>
                                            <div className="border bg-light rounded p-1">
                                                <nav className="nav nav-pills flex-row gap-1 custom-tab" role="tablist">
                                                    <Link href="#" className="flex-fill text-center nav-link p-1 px-2 active">1D</Link>
                                                    <Link href="#" className="flex-fill text-sm-center nav-link p-1 px-2">7D</Link>
                                                    <Link href="#" className="flex-fill text-sm-center nav-link p-1 px-2">1M</Link>
                                                    <Link href="#" className="flex-fill text-sm-center nav-link p-1 px-2">1Y</Link>
                                                </nav>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="tab-content">
                                        <div
                                            className="tab-pane fade show active"
                                            id="day"
                                            role="tabpanel"
                                            aria-labelledby="day-tab"
                                        >
                                            <div className="chart-container">
                                                <ImagePointChart />
                                            </div>
                                        </div>
                                        <div
                                            className="tab-pane fade"
                                            id="week"
                                            role="tabpanel"
                                            aria-labelledby="week-tab"
                                        >
                                            <div className="chart-container">
                                                <ImagePointChart />
                                            </div>
                                        </div>
                                        <div
                                            className="tab-pane fade"
                                            id="month"
                                            role="tabpanel"
                                            aria-labelledby="month-tab"
                                        >
                                            <div className="chart-container">
                                                <ImagePointChart />
                                            </div>
                                        </div>
                                        <div
                                            className="tab-pane fade"
                                            id="year"
                                            role="tabpanel"
                                            aria-labelledby="year-tab"
                                        >
                                            <div className="chart-container">
                                                <ImagePointChart />
                                            </div>
                                        </div>
                                    </div>
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                        <div className="col-xl-5 d-flex">
                            <div className="card flex-fill">
                                <div className="card-body">
                                    <div className="border rounded border-start border-start-primary d-flex align-items-center justify-content-between p-2 gap-2 flex-wrap mb-3">
                                        <h2 className="card-title mb-0">Pending Approvals</h2>
                                        <Link href={all_routes.leaveemployee} className="btn btn-md btn-light">
                                            View All
                                        </Link>
                                    </div>
                                    <div className="p-2 rounded border d-flex align-items-sm-center justify-content-between gap-2 flex-column flex-sm-row mb-2">
                                        <div>
                                            <div className="d-flex align-items-center mb-1">
                                                <Link href="#" className="avatar avatar-sm flex-shrink-0">
                                                    <ImageWithBasePath
                                                        src="assets/img/users/user-29.jpg"
                                                        className="rounded-circle"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <div className="ms-2">
                                                    <p className="fs-14 fw-semibold text-truncate mb-0">
                                                        <Link href="#">Hendrita Merkel</Link>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-inline-flex align-items-center gap-1">
                                                <p className="fs-13 d-inline-flex align-items-center mb-0">
                                                    <i className="ti ti-calendar-up me-1" />
                                                    Jan 10 - Jan 16
                                                </p>
                                                <span>
                                                    <i className="ti ti-minus-vertical border-color fs-14" />
                                                </span>
                                                <p className="fs-13 d-inline-flex align-items-center mb-0">
                                                    <i className="ti ti-clock-hour-11 me-1" />4 days
                                                </p>
                                            </div>
                                            <p className="fs-13 mb-0">Reason: Family trip</p>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Link href="#" className="btn btn-sm btn-primary">
                                                Approve
                                            </Link>
                                            <Link href="#" className="btn btn-sm btn-outline-primary">
                                                Decline
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded border d-flex align-items-sm-center justify-content-between gap-2 flex-column flex-sm-row  mb-2">
                                        <div>
                                            <div className="d-flex align-items-center mb-1">
                                                <Link href="#" className="avatar avatar-sm flex-shrink-0">
                                                    <ImageWithBasePath
                                                        src="assets/img/users/user-27.jpg"
                                                        className="rounded-circle"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <div className="ms-2">
                                                    <p className="fs-14 fw-semibold text-truncate mb-0">
                                                        <Link href="#">Michael Brown</Link>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-inline-flex align-items-center gap-1">
                                                <p className="fs-13 d-inline-flex align-items-center mb-0">
                                                    <i className="ti ti-calendar-up me-1" />
                                                    Jan 3 - Jan 9
                                                </p>
                                                <span>
                                                    <i className="ti ti-minus-vertical border-color fs-14" />
                                                </span>
                                                <p className="fs-13 d-inline-flex align-items-center mb-0">
                                                    <i className="ti ti-clock-hour-11 me-1" />2 days
                                                </p>
                                            </div>
                                            <p className="fs-13 mb-0">Reason: Medical appointment</p>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Link href="#" className="btn btn-sm btn-primary">
                                                Approve
                                            </Link>
                                            <Link href="#" className="btn btn-sm btn-outline-primary">
                                                Decline
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded border d-flex align-items-sm-center justify-content-between gap-2 flex-column flex-sm-row  mb-0">
                                        <div>
                                            <div className="d-flex align-items-center mb-1">
                                                <Link href="#" className="avatar avatar-sm flex-shrink-0">
                                                    <ImageWithBasePath
                                                        src="assets/img/users/user-30.jpg"
                                                        className="rounded-circle"
                                                        alt="user"
                                                    />
                                                </Link>
                                                <div className="ms-2">
                                                    <p className="fs-14 fw-semibold text-truncate mb-0">
                                                        <Link href="#">Daniel Martinez</Link>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-inline-flex align-items-center gap-1">
                                                <p className="fs-13 d-inline-flex align-items-center mb-0">
                                                    <i className="ti ti-calendar-up me-1" />
                                                    Jan 17 - Jan 23
                                                </p>
                                                <span>
                                                    <i className="ti ti-minus-vertical border-color fs-14" />
                                                </span>
                                                <p className="fs-13 d-inline-flex align-items-center mb-0">
                                                    <i className="ti ti-clock-hour-11 me-1" />2 days
                                                </p>
                                            </div>
                                            <p className="fs-13 mb-0">Reason: Personal Work</p>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Link href="#" className="btn btn-sm btn-primary">
                                                Approve
                                            </Link>
                                            <Link href="#" className="btn btn-sm btn-outline-primary">
                                                Decline
                                            </Link>
                                        </div>
                                    </div>
                                </div>{" "}
                                {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                        </div>{" "}
                        {/* end col */}
                    </div>
                    {/* end row */}
                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
        </>
    )
}

export default HrDashboardComponent