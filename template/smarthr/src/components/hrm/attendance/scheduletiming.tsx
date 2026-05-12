"use client";

import PredefinedDateRanges from "../../../core/common/datePicker";
import Table from "../../../core/common/dataTable/index";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import CommonSelect from "../../../core/common/commonSelect";
import { DatePicker, TimePicker } from "antd";
import { schedule_timing } from "../../../core/data/json/schedule_timing";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

// Define a type for schedule timing data
interface ScheduleTimingData {
  key: string;
  Name: string;
  Image: string;
  JobTitle: string;
  actions?: string;
}

const ScheduleTimingComponent = () => {
  const data = schedule_timing;
  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      render: (_text: string, record: ScheduleTimingData) => (
        <div className="d-flex align-items-center file-name-icon">
          <span className="avatar avatar-md border avatar-rounded">
            <ImageWithBasePath
              src={`assets/img/users/${record.Image}`}
              className="img-fluid"
              alt={`${record.Name} Profile`}
            />
          </span>
          <div className="ms-2">
            <h6 className="fw-medium">{record.Name}</h6>
          </div>
        </div>
      ),
      sorter: (a: ScheduleTimingData, b: ScheduleTimingData) =>
        a.Name.length - b.Name.length,
    },
    {
      title: "Job Title",
      dataIndex: "JobTitle",
      sorter: (a: ScheduleTimingData, b: ScheduleTimingData) =>
        a.JobTitle.length - b.JobTitle.length,
    },

    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div>
          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#schedule_timing"
            className="btn btn-dark"
          >
            Schedule Timing
          </button>
        </div>
      ),
    },
  ];

  const departmentChoose = [
    { value: "Development", label: "Development" },
    { value: "Finance", label: "Finance" },
    { value: "Finance and Management", label: "Finance and Management" },
    { value: "Hr & Finance", label: "Hr & Finance" },
    { value: "ITech", label: "ITech" },
  ];
  const employeeName = [
    { value: "Richard Miles", label: "Richard Miles" },
    { value: "John Smith", label: "John Smith" },
    { value: "Mike Litorus", label: "Mike Litorus" },
    { value: "Wilmer Deluna", label: "Wilmer Deluna" },
  ];
  const shiftsChoose = [
    { value: "10'o clock Shift", label: "10'o clock Shift" },
    { value: "10:30 shift", label: "10:30 shift" },
    { value: "Daily Shift", label: "Daily Shift" },
    { value: "New Shift", label: "New Shift" },
  ];

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };
  const getModalContainer2 = () => {
    const modalElement = document.getElementById("modal_datepicker");
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
              <h2 className="mb-1">Schedule Timing</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Attendance</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Schedule Timing
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="mb-2">
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
                      <button type="button" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </button>
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
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Schedule Timing List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon position-relative">
                    <PredefinedDateRanges />
                  </div>
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
                      <button type="button" className="dropdown-item rounded-1">
                        Recently Added
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Ascending
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Desending
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Last Month
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Last 7 Days
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="custom-datatable-filter table-responsive">
                <Table dataSource={data} columns={columns} Selection={true} />
              </div>
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
      {/* Add Schedule Modal */}
      <div
        id="schedule_timing"
        className="modal custom-modal fade"
        role="dialog"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Schedule</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Department <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="select"
                        options={departmentChoose}
                        defaultValue={departmentChoose[0]}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Employee Name <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="select"
                        options={employeeName}
                        defaultValue={employeeName[0]}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="input-block mb-3">
                      <label className="form-label">Date</label>
                      <div className="cal-icon">
                        <DatePicker
                          className="form-control datetimepicker"
                          format={{
                            format: "DD-MM-YYYY",
                            type: "mask",
                          }}
                          getPopupContainer={getModalContainer}
                          placeholder="DD-MM-YYYY"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Shifts <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="select"
                        options={shiftsChoose}
                        defaultValue={shiftsChoose[0]}
                      />
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Min Start Time <span className="text-danger">*</span>
                      </label>
                      <div className="input-group time">
                        <TimePicker
                          getPopupContainer={getModalContainer2}
                          use12Hours
                          format="h:mm A"
                          className="form-control timepicker"
                        />
                        <span className="input-group-text">
                          <i className="fa-regular fa-clock" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Start Time <span className="text-danger">*</span>
                      </label>
                      <div className="input-group time">
                        <TimePicker
                          getPopupContainer={getModalContainer2}
                          use12Hours
                          format="h:mm A"
                          className="form-control timepicker"
                        />
                        <span className="input-group-text">
                          <i className="fa-regular fa-clock" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Max Start Time <span className="text-danger">*</span>
                      </label>
                      <div className="input-group time">
                        <TimePicker
                          getPopupContainer={getModalContainer2}
                          use12Hours
                          format="h:mm A"
                          className="form-control timepicker"
                        />
                        <span className="input-group-text">
                          <i className="fa-regular fa-clock" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Min End Time <span className="text-danger">*</span>
                      </label>
                      <div className="input-group time">
                        <TimePicker
                          getPopupContainer={getModalContainer2}
                          use12Hours
                          format="h:mm A"
                          className="form-control timepicker"
                        />
                        <span className="input-group-text">
                          <i className="fa-regular fa-clock" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        End Time <span className="text-danger">*</span>
                      </label>
                      <div className="input-group time">
                        <TimePicker
                          getPopupContainer={getModalContainer2}
                          use12Hours
                          format="h:mm A"
                          className="form-control timepicker"
                        />
                        <span className="input-group-text">
                          <i className="fa-regular fa-clock" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Max End Time <span className="text-danger">*</span>
                      </label>
                      <div className="input-group time">
                        <TimePicker
                          getPopupContainer={getModalContainer2}
                          use12Hours
                          format="h:mm A"
                          className="form-control timepicker"
                        />
                        <span className="input-group-text">
                          <i className="fa-regular fa-clock" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Break Time <span className="text-danger">*</span>
                      </label>
                      <TimePicker
                        getPopupContainer={getModalContainer2}
                        use12Hours
                        format="h:mm A"
                        className="form-control timepicker"
                      />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="input-block mb-3">
                      <label className="form-label">
                        Accept Extra Hours{" "}
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitch1"
                          defaultChecked
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customSwitch1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="input-block mb-3">
                      <label className="form-label">Publish </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customSwitch2"
                          defaultChecked
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customSwitch2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Schedule Modal */}
    </>
  );
};

export default ScheduleTimingComponent;
