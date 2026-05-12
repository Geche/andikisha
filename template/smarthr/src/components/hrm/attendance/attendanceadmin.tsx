"use client";

import { attendance_admin_details } from '../../../core/data/json/attendanceadmin';
import PredefinedDateRanges from '../../../core/common/datePicker';
import Table from "../../../core/common/dataTable/index";
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import CommonSelect from '../../../core/common/commonSelect';
import { DatePicker, TimePicker } from 'antd';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import Link from 'next/link';
import { all_routes } from '@/routes/all_routes';

// Define a type for attendance admin data
interface AttendanceAdminData {
  Employee: string;
  Image: string;
  Role: string;
  Status: string;
  CheckIn: string;
  CheckOut: string;
  Break: string;
  Late: string;
  ProductionHours: string;
}

const AttendanceAdminComponent = () => {

  const data: AttendanceAdminData[] = attendance_admin_details;
  const columns = [
    {
      title: "Employee",
      dataIndex: "Employee",
      render: (_text: string, record: AttendanceAdminData) => (
        <div className="d-flex align-items-center file-name-icon">
          <span className="avatar avatar-md border avatar-rounded">
            <ImageWithBasePath src={`assets/img/users/${record.Image}`} className="img-fluid" alt={`${record.Employee} Profile`} />
          </span>
          <div className="ms-2">
            <h6 className="fw-medium">{record.Employee}</h6>
            <span className="fs-12 fw-normal ">{record.Role}</span>
          </div>
        </div>
      ),
      sorter: (a: AttendanceAdminData, b: AttendanceAdminData) => a.Employee.length - b.Employee.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string, record: AttendanceAdminData) => (
        <span className={`badge ${text === 'Present' ? 'badge-success-transparent' : 'badge-danger-transparent'} d-inline-flex align-items-center`}>
          <i className="ti ti-point-filled me-1" />
          {record.Status}
        </span>
      ),
      sorter: (a: AttendanceAdminData, b: AttendanceAdminData) => a.Status.length - b.Status.length,
    },
    {
      title: "Check In",
      dataIndex: "CheckIn",
      sorter: (a: AttendanceAdminData, b: AttendanceAdminData) => a.CheckIn.length - b.CheckIn.length,
    },
    {
      title: "Check Out",
      dataIndex: "CheckOut",
      sorter: (a: AttendanceAdminData, b: AttendanceAdminData) => a.CheckOut.length - b.CheckOut.length,
    },
    {
      title: "Break",
      dataIndex: "Break",
      sorter: (a: AttendanceAdminData, b: AttendanceAdminData) => a.Break.length - b.Break.length,
    },
    {
      title: "Late",
      dataIndex: "Late",
      sorter: (a: AttendanceAdminData, b: AttendanceAdminData) => a.Late.length - b.Late.length,
    },
    {
      title: "Production Hours",
      dataIndex: "ProductionHours",
      render: (_text: string, record: AttendanceAdminData) => (
        <span className={`badge d-inline-flex align-items-center badge-sm ${
          parseFloat(record.ProductionHours) < 8
            ? 'badge-danger'
            : parseFloat(record.ProductionHours) >= 8 && parseFloat(record.ProductionHours) <= 9
              ? 'badge-success'
              : 'badge-info'
          }`}
        >
          <i className="ti ti-clock-hour-11 me-1"></i>{record.ProductionHours}
        </span>
      ),
      sorter: (a: AttendanceAdminData, b: AttendanceAdminData) => a.ProductionHours.length - b.ProductionHours.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div className="action-icon d-inline-flex">
          <button
            type="button"
            className="me-2"
            data-bs-toggle="modal"
            data-bs-target="#edit_attendance"
            aria-label="Edit attendance"
          >
            <i className="ti ti-edit" />
          </button>
        </div>
      ),
    },
  ];

  const statusChoose = [
    { value: "Select", label: "Select" },
    { value: "Present", label: "Present" },
    { value: "Absent", label: "Absent" },
  ];

  const getModalContainer = () => {
    const modalElement = document.getElementById('modal-datepicker');
    return modalElement ? modalElement : document.body;
  };
  const getModalContainer2 = () => {
    const modalElement = document.getElementById('modal_datepicker');
    return modalElement ? modalElement : document.body;
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Attendance Admin</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Attendance</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Attendance Admin
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    href={all_routes.attendanceemployee}
                    className="btn btn-icon btn-sm  me-1"
                  >
                    <i className="ti ti-brand-days-counter" />
                  </Link>
                  <Link
                    href={all_routes.attendanceadmin}
                    className="btn btn-icon btn-sm active bg-primary text-white"
                  >
                    <i className="ti ti-calendar-event" />
                  </Link>
                </div>
              </div>
              <div className="me-2 mb-2">
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-file-export me-1" />
                    Export
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mb-2">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
                  data-bs-target="#attendance_report"
                  data-bs-toggle="modal"
                >
                  <i className="ti ti-file-analytics me-2" />
                  Report
                </button>
              </div>
              <div className="ms-2 head-icons">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card border-0">
            <div className="card-body">
              <div className="row align-items-center mb-4">
                <div className="col-md-5">
                  <div className="mb-3 mb-md-0">
                    <h4 className="mb-1">Attendance Details Today</h4>
                    <p>Data from the 800+ total no of employees</p>
                  </div>
                </div>
                <div className="col-md-7">
                  <div className="d-flex align-items-center justify-content-md-end">
                    <h6>Total Absenties today</h6>
                    <div className="avatar-list-stacked avatar-group-sm ms-4">
                      <span className="avatar avatar-rounded">
                        <ImageWithBasePath
                          className="border border-white"
                          src="assets/img/profiles/avatar-02.jpg"
                          alt="avatar"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <ImageWithBasePath
                          className="border border-white"
                          src="assets/img/profiles/avatar-03.jpg"
                          alt="avatar"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <ImageWithBasePath
                          className="border border-white"
                          src="assets/img/profiles/avatar-05.jpg"
                          alt="avatar"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <ImageWithBasePath
                          className="border border-white"
                          src="assets/img/profiles/avatar-06.jpg"
                          alt="avatar"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <ImageWithBasePath
                          className="border border-white"
                          src="assets/img/profiles/avatar-07.jpg"
                          alt="avatar"
                        />
                      </span>
                      <Link
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="#"
                      >
                        +1
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border rounded">
                <div className="row gx-0">
                  <div className="col-md col-sm-4 border-end">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Present</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>250</h5>
                        <span className="badge badge-success d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          +1%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md col-sm-4 border-end">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Late Login</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>45</h5>
                        <span className="badge badge-danger d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          -1%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md col-sm-4 border-end">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Uninformed</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>15</h5>
                        <span className="badge badge-danger d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          -12%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md col-sm-4 border-end">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Permisson</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>03</h5>
                        <span className="badge badge-success d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          +1%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md col-sm-4">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Absent</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>12</h5>
                        <span className="badge badge-danger d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          -19%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Admin Attendance</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon position-relative">
                    <PredefinedDateRanges />
                  </div>
                </div>
                <div className="dropdown me-3">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Department
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Finance
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Application Development
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        IT Management
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Status
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Present
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Absent
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Recently Added
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Ascending
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Desending
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Last Month
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Last 7 Days
                      </button>
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
      {/* Edit Attendance */}
      <div className="modal fade" id="edit_attendance">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Attendance</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Date</label>
                      <div className="input-icon input-icon-new position-relative w-100 me-2">
                        <DatePicker
                          className="form-control datetimepicker"
                          format={{
                            format: "DD-MM-YYYY",
                            type: "mask",
                          }}
                          getPopupContainer={getModalContainer}
                          placeholder="DD-MM-YYYY"
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Check In</label>
                      <div className="input-icon input-icon-new position-relative w-100">
                        <TimePicker getPopupContainer={getModalContainer2} use12Hours placeholder="Choose" format="h:mm A" className="form-control timepicker" />
                        <span className="input-icon-addon">
                          <i className="ti ti-clock-hour-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Check Out</label>
                      <div className="input-icon input-icon-new position-relative w-100">
                        <TimePicker getPopupContainer={getModalContainer2} use12Hours placeholder="Choose" format="h:mm A" className="form-control timepicker" />
                        <span className="input-icon-addon">
                          <i className="ti ti-clock-hour-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Break</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="30 Min	"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Late</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="32 Min"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Production Hours</label>
                      <div className="input-icon input-icon-new position-relative w-100">
                        <TimePicker getPopupContainer={getModalContainer2} use12Hours placeholder="Choose" format="h:mm A" className="form-control timepicker" />
                        <span className="input-icon-addon">
                          <i className="ti ti-clock-hour-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3 ">
                      <label className="form-label">Status</label>
                      <CommonSelect
                        className='select'
                        options={statusChoose}
                        defaultValue={statusChoose[1]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="button" data-bs-dismiss="modal" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Attendance */}
      {/* Attendance Report */}
      <div className="modal fade" id="attendance_report">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Attendance</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="card shadow-none bg-transparent-light">
                <div className="card-body pb-1">
                  <div className="row align-items-center">
                    <div className="col-lg-4">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar avatar-sm avatar-rounded flex-shrink-0 me-2">
                          <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
                        </span>
                        <div>
                          <h6 className="fw-medium">Anthony Lewis</h6>
                          <span>UI/UX Team</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-8">
                      <div className="row">
                        <div className="col-sm-3">
                          <div className="mb-3 text-sm-end">
                            <span>Date</span>
                            <p className="text-gray-9 fw-medium">15 Apr 2025</p>
                          </div>
                        </div>
                        <div className="col-sm-3">
                          <div className="mb-3 text-sm-end">
                            <span>Punch in at</span>
                            <p className="text-gray-9 fw-medium">09:00 AM</p>
                          </div>
                        </div>
                        <div className="col-sm-3">
                          <div className="mb-3 text-sm-end">
                            <span>Punch out at</span>
                            <p className="text-gray-9 fw-medium">06:45 PM</p>
                          </div>
                        </div>
                        <div className="col-sm-3">
                          <div className="mb-3 text-sm-end">
                            <span>Status</span>
                            <p className="text-gray-9 fw-medium">Present</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-none border mb-0">
                <div className="card-body">
                  <div className="row">
                    <div className="col-xl-3">
                      <div className="mb-4">
                        <p className="d-flex align-items-center mb-1">
                          <i className="ti ti-point-filled text-dark-transparent me-1" />
                          Total Working hours
                        </p>
                        <h3>12h 36m</h3>
                      </div>
                    </div>
                    <div className="col-xl-3">
                      <div className="mb-4">
                        <p className="d-flex align-items-center mb-1">
                          <i className="ti ti-point-filled text-success me-1" />
                          Productive Hours
                        </p>
                        <h3>08h 36m</h3>
                      </div>
                    </div>
                    <div className="col-xl-3">
                      <div className="mb-4">
                        <p className="d-flex align-items-center mb-1">
                          <i className="ti ti-point-filled text-warning me-1" />
                          Break hours
                        </p>
                        <h3>22m 15s</h3>
                      </div>
                    </div>
                    <div className="col-xl-3">
                      <div className="mb-4">
                        <p className="d-flex align-items-center mb-1">
                          <i className="ti ti-point-filled text-info me-1" />
                          Overtime
                        </p>
                        <h3>02h 15m</h3>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-8 mx-auto">
                      <div
                        className="progress bg-transparent-dark mb-3"
                        style={{ height: 24 }}
                      >
                        <div
                          className="progress-bar bg-success rounded me-2"
                          role="progressbar"
                          style={{ width: "18%" }}
                        />
                        <div
                          className="progress-bar bg-warning rounded me-2"
                          role="progressbar"
                          style={{ width: "5%" }}
                        />
                        <div
                          className="progress-bar bg-success rounded me-2"
                          role="progressbar"
                          style={{ width: "28%" }}
                        />
                        <div
                          className="progress-bar bg-warning rounded me-2"
                          role="progressbar"
                          style={{ width: "17%" }}
                        />
                        <div
                          className="progress-bar bg-success rounded me-2"
                          role="progressbar"
                          style={{ width: "22%" }}
                        />
                        <div
                          className="progress-bar bg-warning rounded me-2"
                          role="progressbar"
                          style={{ width: "5%" }}
                        />
                        <div
                          className="progress-bar bg-info rounded me-2"
                          role="progressbar"
                          style={{ width: "3%" }}
                        />
                        <div
                          className="progress-bar bg-info rounded"
                          role="progressbar"
                          style={{ width: "2%" }}
                        />
                      </div>
                    </div>
                    <div className="co-md-12">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fs-10">06:00</span>
                        <span className="fs-10">07:00</span>
                        <span className="fs-10">08:00</span>
                        <span className="fs-10">09:00</span>
                        <span className="fs-10">10:00</span>
                        <span className="fs-10">11:00</span>
                        <span className="fs-10">12:00</span>
                        <span className="fs-10">01:00</span>
                        <span className="fs-10">02:00</span>
                        <span className="fs-10">03:00</span>
                        <span className="fs-10">04:00</span>
                        <span className="fs-10">05:00</span>
                        <span className="fs-10">06:00</span>
                        <span className="fs-10">07:00</span>
                        <span className="fs-10">08:00</span>
                        <span className="fs-10">09:00</span>
                        <span className="fs-10">10:00</span>
                        <span className="fs-10">11:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Attendance Report */}
    </>




  )
}

export default AttendanceAdminComponent
