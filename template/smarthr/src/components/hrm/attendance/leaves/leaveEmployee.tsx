"use client";

import Table from "../../../../core/common/dataTable/index";
import CommonSelect from '../../../../core/common/commonSelect';
import PredefinedDateRanges from '../../../../core/common/datePicker';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import { DatePicker } from 'antd';
import { leaveemployee_details } from '../../../../core/data/json/leaveemployee_details';
import CollapseHeader from '../../../../core/common/collapse-header/collapse-header';
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

// Add type for leave employee data
interface LeaveEmployeeData {
  LeaveType: string;
  From: string;
  ApprovedBy: string;
  Image: string;
  Roll: string;
  To: string;
  NoOfDays: string;
  Status: string;
  actions?: string;
}

const LeaveEmployeeComponent = () => {

  const data: LeaveEmployeeData[] = leaveemployee_details;
  const columns = [
    {
      title: "Leave Type",
      dataIndex: "LeaveType",
      render: (_text: string, record: LeaveEmployeeData) => (
        <div className="d-flex align-items-center">
          <p className="fs-14 fw-medium d-flex align-items-center mb-0">
            {record.LeaveType}
          </p>
          <button
            type="button"
            className="ms-2 btn btn-link p-0 text-info"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
            title="I am currently experiencing a fever and feeling unwell."
            aria-label="Leave type info"
          >
            <i className="ti ti-info-circle" />
          </button>
        </div>
      ),
      sorter: (a: LeaveEmployeeData, b: LeaveEmployeeData) => a.LeaveType.length - b.LeaveType.length,
    },
    {
      title: "From",
      dataIndex: "From",
      sorter: (a: LeaveEmployeeData, b: LeaveEmployeeData) => a.From.length - b.From.length,
    },
    {
      title: "Approved By",
      dataIndex: "ApprovedBy",
      render: (_text: string, record: LeaveEmployeeData) => (
        <div className="d-flex align-items-center file-name-icon">
          <span className="avatar avatar-md border avatar-rounded">
            <ImageWithBasePath src={`assets/img/users/${record.Image}`} className="img-fluid" alt={`${record.ApprovedBy} Profile`} />
          </span>
          <div className="ms-2">
            <h6 className="fw-medium">{record.ApprovedBy}</h6>
            <span className="fs-12 fw-normal ">{record.Roll}</span>
          </div>
        </div>
      ),
      sorter: (a: LeaveEmployeeData, b: LeaveEmployeeData) => a.ApprovedBy.length - b.ApprovedBy.length,
    },
    {
      title: "To",
      dataIndex: "To",
      sorter: (a: LeaveEmployeeData, b: LeaveEmployeeData) => a.To.length - b.To.length,
    },
    {
      title: "No of Days",
      dataIndex: "NoOfDays",
      sorter: (a: LeaveEmployeeData, b: LeaveEmployeeData) => a.NoOfDays.length - b.NoOfDays.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string, _record: LeaveEmployeeData) => (
        <div className="dropdown">
          <button
            type="button"
            className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            <span className={`rounded-circle ${text === 'Approved' ? 'bg-transparent-success' : text === 'New' ? 'bg-transparent-purple' : 'bg-transparent-danger'} d-flex justify-content-center align-items-center me-2`}>
              <i className={`ti ti-point-filled ${text === 'Approved' ? 'text-success' : text === 'New' ? 'text-purple' : 'text-danger'}`} />
            </span>
            {text}
          </button>
          <ul className="dropdown-menu  dropdown-menu-end p-3">
            <li>
              <button
                type="button"
                className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
              >
                <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                  <i className="ti ti-point-filled text-success" />
                </span>
                Approved
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
              >
                <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                  <i className="ti ti-point-filled text-danger" />
                </span>
                Declined
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
              >
                <span className="rounded-circle bg-transparent-purple d-flex justify-content-center align-items-center me-2">
                  <i className="ti ti-point-filled text-purple" />
                </span>
                New
              </button>
            </li>
          </ul>
        </div>
      ),
      sorter: (a: LeaveEmployeeData, b: LeaveEmployeeData) => a.Status.length - b.Status.length,
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
            data-bs-target="#edit_leaves"
            aria-label="Edit leave"
          >
            <i className="ti ti-edit" />
          </button>
          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            aria-label="Delete leave"
          >
            <i className="ti ti-trash" />
          </button>
        </div>
      ),
    },
  ]

  const leavetype = [
    { value: "Select", label: "Select" },
    { value: "Medical Leave", label: "Medical Leave" },
    { value: "Casual Leave", label: "Casual Leave" },
    { value: "Annual Leave", label: "Annual Leave" },
  ];
  const selectChoose = [
    { value: "Select", label: "Select" },
    { value: "Full Day", label: "Full Day" },
    { value: "First Half", label: "First Half" },
    { value: "Second Half", label: "Second Half" },
  ];

   const getModalContainer = (node: HTMLElement): HTMLElement => {
    if (typeof window === 'undefined') {
      return document.body; // Return document.body during SSR
    }
    const modalElement = document.getElementById('modal-datepicker');
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Leave Employees</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Leaves</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Leave Employees
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
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
                  data-bs-toggle="modal"
                  data-bs-target="#add_leaves"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Leave
                </button>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Leaves Info */}
          <div className="row">
            <div className="col-xl-3 col-md-6">
              <div className="card bg-black-le">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-start">
                      <p className="mb-1">Annual Leaves</p>
                      <h4>05</h4>
                    </div>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-2">
                        <span className="avatar avatar-md d-flex">
                          <i className="ti ti-calendar-event fs-32" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-secondary-transparent">
                    Remaining Leaves : 07
                  </span>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-blue-le">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-start">
                      <p className="mb-1">Medical Leaves</p>
                      <h4>11</h4>
                    </div>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-2">
                        <span className="avatar avatar-md d-flex">
                          <i className="ti ti-vaccine fs-32" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-info-transparent">
                    Remaining Leaves : 01
                  </span>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-purple-le">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-start">
                      <p className="mb-1">Casual Leaves</p>
                      <h4>02</h4>
                    </div>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-2">
                        <span className="avatar avatar-md d-flex">
                          <i className="ti ti-hexagon-letter-c fs-32" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-transparent-purple">
                    Remaining Leaves : 10
                  </span>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-pink-le">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-start">
                      <p className="mb-1">Other Leaves</p>
                      <h4>07</h4>
                    </div>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-2">
                        <span className="avatar avatar-md d-flex">
                          <i className="ti ti-hexagonal-prism-plus fs-32" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-pink-transparent">
                    Remaining Leaves : 05
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* /Leaves Info */}
          {/* Leaves list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="d-flex">
                <h5 className="me-2">Leave List</h5>
                <span className="badge bg-primary-transparent me-2">
                  Total Leaves : 48
                </span>
                <span className="badge bg-secondary-transparent">
                  Total Remaining Leaves : 23
                </span>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon position-relative">
                    <PredefinedDateRanges />
                  </div>
                </div>
                <div className="dropdown me-3">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Leave Type
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Medical Leave
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Casual Leave
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Annual Leave
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Approved By
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Doglas Martini
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Warren Morales
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                      >
                        Doglas Martini
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Status
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                      >
                        <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                          <i className="ti ti-point-filled text-success" />
                        </span>
                        Approved
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                      >
                        <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                          <i className="ti ti-point-filled text-danger" />
                        </span>
                        Declined
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                      >
                        <span className="rounded-circle bg-transparent-purple d-flex justify-content-center align-items-center me-2">
                          <i className="ti ti-point-filled text-purple" />
                        </span>
                        New
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
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
          {/* /Leaves list */}
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
      {/* Add Leaves */}
      <div className="modal fade" id="add_leaves">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Leave</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form >
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Leave Type</label>
                      <CommonSelect
                        className='select'
                        options={leavetype}
                        defaultValue={leavetype[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">From </label>
                      <div className="input-icon-end position-relative">
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
                          <i className="ti ti-calendar text-gray-7" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">To </label>
                      <div className="input-icon-end position-relative">
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
                          <i className="ti ti-calendar text-gray-7" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="input-icon-end position-relative">
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
                          <i className="ti ti-calendar text-gray-7" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <CommonSelect
                        className='select'
                        options={selectChoose}
                        defaultValue={selectChoose[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">No of Days</label>
                      <input type="text" className="form-control" disabled />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Remaining Days</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={8}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Reason</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        defaultValue={""}
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
                  Add Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Leaves */}
      {/* Edit Leaves */}
      <div className="modal fade" id="edit_leaves">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Leave</h4>
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
                      <label className="form-label">Leave Type</label>
                      <CommonSelect
                        className='select'
                        options={leavetype}
                        defaultValue={leavetype[1]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">From </label>
                      <div className="input-icon-end position-relative">
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
                          <i className="ti ti-calendar text-gray-7" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">To </label>
                      <div className="input-icon-end position-relative">
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
                          <i className="ti ti-calendar text-gray-7" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="input-icon-end position-relative">
                        <input
                          type="text"
                          className="form-control datetimepicker"
                          defaultValue="15/01/24"
                          disabled
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar text-gray-7" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <CommonSelect
                        className='select'
                        options={selectChoose}
                        defaultValue={selectChoose[1]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">No of Days</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={'01'}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Remaining Days</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={'07'}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="d-flex align-items-center mb-3">
                      <div className="form-check me-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="leave1"
                          defaultValue="option4"
                          id="leave6"
                        />
                        <label className="form-check-label" htmlFor="leave6">
                          Full Day
                        </label>
                      </div>
                      <div className="form-check me-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="leave1"
                          defaultValue="option5"
                          id="leave5"
                        />
                        <label className="form-check-label" htmlFor="leave5">
                          First Half
                        </label>
                      </div>
                      <div className="form-check me-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="leave1"
                          defaultValue="option6"
                          id="leave4"
                        />
                        <label className="form-check-label" htmlFor="leave4">
                          Second Half
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Reason</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        defaultValue={" Going to Hospital "}
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
      {/* /Edit Leaves */}
    </>



  )
}

export default LeaveEmployeeComponent
