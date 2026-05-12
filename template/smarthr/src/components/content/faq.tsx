"use client";

import PredefinedDateRanges from "../../core/common/datePicker";
import { faq_data } from "../../core/data/json/faq_data";
import Table from "../../core/common/dataTable/index";
import CollapseHeader from "../../core/common/collapse-header/collapse-header";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";

type FaqRow = {
  key: string;
  questions: string;
  answers: string;
  category: string;
};

const FaqComponent = () => {
  const data = faq_data;
  const columns = [
    {
      title: "Questions",
      dataIndex: "questions",
      key: "questions",
      render: (text: FaqRow["questions"]) => (
        <h6 className="fw-medium">
          <Link href="#">{text}</Link>
        </h6>
      ),
      sorter: (a: FaqRow, b: FaqRow) => a.questions.length - b.questions.length,
    },
    {
      title: "Answers",
      dataIndex: "answers",
      key: "answers",
      sorter: (a: FaqRow, b: FaqRow) => a.answers.length - b.answers.length,
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: () => (
        <div className="action-icon d-inline-flex">
          <Link
            href="#"
            data-bs-toggle="modal"
            data-inert={true}
            data-bs-target="#edit_faq"
            className="me-2"
          >
            <i className="ti ti-edit" />
          </Link>
          <Link
            href="#"
            data-bs-toggle="modal"
            data-inert={true}
            data-bs-target="#delete_modal"
          >
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
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
              <h2 className="mb-1">Faq</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Content</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Faq
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
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
                      <Link href="#" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mb-2">
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-inert={true}
                  data-bs-target="#add_faq"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Faq
                </Link>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>FAQ List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon position-relative">
                    <PredefinedDateRanges />
                  </div>
                </div>
                <div className="dropdown">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Category
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        General
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Feature
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Employee
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <Table<FaqRow>
                dataSource={data}
                columns={columns}
                Selection={true}
              />
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
      {/* Add Faq */}
      <div className="modal fade" id="add_faq">
        <div className="modal-dialog modal-dialog-centered modal-mg w-100">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Faq</h4>
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
                      <label className="form-label">Category</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Questions</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        defaultValue={""}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Answer</label>
                      <textarea
                        rows={3}
                        className="form-control"
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
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-primary"
                >
                  Add Faq
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Faq */}
      {/* Edit Faq */}
      <div className="modal fade" id="edit_faq">
        <div className="modal-dialog modal-dialog-centered modal-mg w-100">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit FAQ</h4>
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
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="General"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Questions</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        defaultValue={"What is an HRMS?"}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Answer</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        defaultValue={
                          "Software system that automates and manages various human resources tasks"
                        }
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
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-primary"
                >
                  Save Faq
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Faq */}
    </>
  );
};

export default FaqComponent;
