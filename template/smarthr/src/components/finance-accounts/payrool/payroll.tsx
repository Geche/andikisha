"use client";

import Table from "../../../core/common/dataTable/index";
import CommonSelect from "../../../core/common/commonSelect";
import { payrollAdditional } from "../../../core/data/json/payroll_addition";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";

// Define a type for payroll data
interface PayrollData {
  Name: string;
  Category: string;
  Amount: string;
  action?: string;
}

const PayRollComponent = () => {
  const data: PayrollData[] = payrollAdditional;
  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      render: (text: string) => (
        <h6 className="fs-14 fw-medium text-gray-9">{text}</h6>
      ),
      sorter: (a: PayrollData, b: PayrollData) => a.Name.length - b.Name.length,
    },
    {
      title: "Category",
      dataIndex: "Category",
      sorter: (a: PayrollData, b: PayrollData) => a.Category.length - b.Category.length,
    },
    {
      title: "Default / Unit Amount",
      dataIndex: "Amount",
      sorter: (a: PayrollData, b: PayrollData) => a.Amount.length - b.Amount.length,
    },
    {
      title: "",
      dataIndex: "action",
      render: (_text: string, _record: PayrollData) => (
        <div className="action-icon d-inline-flex">
          <Link
            href="#"
            className="me-2"
            data-bs-toggle="modal"
            data-bs-target="#edit_payroll"
            aria-label="Edit payroll"
          >
            <i className="ti ti-edit" />
          </Link>
          <Link
            href="#"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            aria-label="Delete payroll"
          >
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
      sorter: (a: PayrollData, b: PayrollData) =>
        (a.action?.length || 0) - (b.action?.length || 0),
    },
  ];
  const categoryName = [
    { value: "Select", label: "Select" },
    { value: "Additional  Remuneration", label: "Additional  Remuneration" },
    { value: "Monthly Remuneration", label: "Monthly Remuneration" },
  ];

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Payroll Items</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Payroll</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Payroll Items
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
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
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          <div className="d-flex flex-wrap gy-2 justify-content-between my-4">
            <div className="payroll-btns">
              <Link href={all_routes.payrollAddition} className="btn btn-white active border me-2">
                Additions
              </Link>
              <Link href={all_routes.payrollOvertime} className="btn btn-white border me-2">
                Overtime
              </Link>
              <Link href={all_routes.payrollDeduction} className="btn btn-white border">
                Deductions
              </Link>
            </div>
            <div className="mb-2">
              <button
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#add_payroll"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="ti ti-circle-plus me-2" />
                Add Addition
              </button>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Payroll list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Additions List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <Table dataSource={data} columns={columns} Selection={true} />
            </div>
          </div>
          {/* /Payroll list */}
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
      {/* Add Payroll */}
      <div className="modal fade" id="add_payroll">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Addition</h4>
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
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <CommonSelect
                        className='select'
                        options={categoryName}
                        defaultValue={categoryName[0]}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div>
                        <label className="form-label">Amount</label>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <input type="text" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label mb-0 fs-12 fw-normal">
                          Unit Calculation
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="flexSwitchCheckDefault"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault2"
                              defaultChecked
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault2"
                            >
                              No Assignee
                            </label>
                          </div>
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault3"
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault3"
                            >
                              All Employees
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault4"
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault4"
                            >
                              Select Employee
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-white border me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="button" data-bs-dismiss="Modal" className="btn btn-primary">
                  Add Addition
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Payroll */}
      {/* Edit  Payroll */}
      <div className="modal fade" id="edit_payroll">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Addition</h4>
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
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Leave Balance Amount"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <CommonSelect
                        className='select'
                        options={categoryName}
                        defaultValue={categoryName[1]}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div>
                        <label className="form-label">Amount</label>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="$5"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label mb-0 fs-12 fw-normal">
                          Unit Calculation
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="flexSwitchCheckDefault9"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault6"
                              defaultChecked
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault6"
                            >
                              No Assignee
                            </label>
                          </div>
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault7"
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault7"
                            >
                              All Employees
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault8"
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault8"
                            >
                              Select Employee
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-white border me-2"
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
      {/* /Edit  Payroll */}
    </>
  );
};

export default PayRollComponent;
