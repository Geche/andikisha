"use client";

import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import { projectlistdetails } from "../../../core/data/json/projectlistdetails";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import CommonTextEditor from "../../../core/common/textEditor";
import { useState } from "react";
import TagInput from "../../../core/common/Taginput";
import CommonSelect from "../../../core/common/commonSelect";
import { DatePicker } from "antd";
import { priority } from "../../../core/common/selectoption/selectoption";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";

// Define interfaces for type safety
interface ProjectRecord {
  ProjectID: string;
  ProjectName: string;
  Leader: string;
  UserImg: string;
  Team: string;
  share: string[];
  Deadline: string;
  Priority: string;
  Status: string;
}

interface ColumnType<T> {
  title: string;
  dataIndex: keyof T | string;
  sorter?: (a: T, b: T) => number;
  render?: (text: any, record?: T) => React.ReactNode;
}

const ProjectListComponent = () => {
  const data: ProjectRecord[] = projectlistdetails;
  const columns: ColumnType<ProjectRecord>[] = [
    {
      title: "Project ID",
      dataIndex: "ProjectID",
      render: (_text: string, record?: ProjectRecord) => (
        <Link href={all_routes.projectdetails}>{record?.ProjectID}</Link>
      ),
      sorter: (a, b) => a.ProjectID.length - b.ProjectID.length,
    },
    {
      title: "Project Name",
      dataIndex: "ProjectName",
      render: (_text: string, record?: ProjectRecord) => (
        <h6 className="fw-medium">
          <Link href={all_routes.projectdetails}>{record?.ProjectName}</Link>
        </h6>
      ),
      sorter: (a, b) => a.ProjectName.length - b.ProjectName.length,
    },
    {
      title: "Leader",
      dataIndex: "Leader",
      render: (text: string, record?: ProjectRecord) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-sm border avatar-rounded">
            <ImageWithBasePath
              src={`assets/img/users/${record?.UserImg}`}
              className="img-fluid"
              alt={text}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-normal">
              <Link href="#">{text}</Link>
            </h6>
          </div>
        </div>
      ),
      sorter: (a, b) => a.Leader.length - b.Leader.length,
    },
    {
      title: "Team",
      dataIndex: "Team",
      render: (_text: string, record?: ProjectRecord) => (
        <div className="avatar-list-stacked avatar-group-sm">
          {record?.share.map((img, idx) => (
            <span className="avatar avatar-rounded" key={img}>
              <ImageWithBasePath
                className="border border-white"
                src={`assets/img/profiles/${img}`}
                alt={`Team member ${idx + 1}`}
              />
            </span>
          ))}
          <Link
            className="avatar bg-primary avatar-rounded text-fixed-white fs-12 fw-medium"
            href="#"
          >
            {record?.Team}
          </Link>
        </div>
      ),
      sorter: (a, b) => a.Team.length - b.Team.length,
    },
    {
      title: "Deadline",
      dataIndex: "Deadline",
      sorter: (a, b) => a.Deadline.length - b.Deadline.length,
    },
    {
      title: "Priority",
      dataIndex: "Priority",
      render: (text: string) => (
        <div className="dropdown">
          <Link
            href="#"
            className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            <span
              className={`rounded-circle d-flex justify-content-center align-items-center me-2 ${
                text === "High"
                  ? "bg-transparent-danger"
                  : text === "Low"
                  ? "bg-transparent-success"
                  : "bg-transparent-warning"
              }`}
            >
              <i
                className={`ti ti-point-filled ${
                  text === "High"
                    ? "text-danger"
                    : text === "Low"
                    ? "text-success"
                    : "text-warning"
                }`}
              />
            </span>{" "}
            {text}
          </Link>
          <ul className="dropdown-menu  dropdown-menu-end p-3">
            <li>
              <Link
                href="#"
                className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
              >
                <span className="rounded-circle d-flex justify-content-center align-items-center me-2">
                  <i className="ti ti-point-filled text-danger" />
                </span>
                High
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
              >
                <span className="rounded-circle bg-transparent-warning d-flex justify-content-center align-items-center me-2">
                  <i className="ti ti-point-filled text-warning" />
                </span>
                Medium
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
              >
                <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                  <i className="ti ti-point-filled text-success" />
                </span>
                Low
              </Link>
            </li>
          </ul>
        </div>
      ),
      sorter: (a, b) => a.Priority.length - b.Priority.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge  ${
            text === "Active" ? "badge-success" : "badge-danger"
          } d-inline-flex align-items-center badge-xs`}
        >
          <i className="ti ti-point-filled me-1" />
          {text}
        </span>
      ),
      sorter: (a, b) => a.Status.length - b.Status.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div className="action-icon d-inline-flex">
          <Link
            href="#"
            className="me-2"
            data-bs-toggle="modal"
            data-inert={true}
            data-bs-target="#edit_project"
            aria-label="Edit Project"
          >
            <i className="ti ti-edit" />
          </Link>
          <Link
            href="#"
            data-bs-toggle="modal"
            data-inert={true}
            data-bs-target="#delete_modal"
            aria-label="Delete Project"
          >
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
    },
  ];
  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
  };

  const [tags, setTags] = useState<string[]>([
    "Jerald",
    "Andrew",
    "Philip",
    "Davis",
  ]);
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };
  const [tags1, setTags1] = useState<string[]>(["Hendry", "James"]);
  const handleTagsChange1 = (newTags: string[]) => {
    setTags1(newTags);
  };
  const [tags2, setTags2] = useState<string[]>(["Dwight"]);
  const handleTagsChange2 = (newTags: string[]) => {
    setTags2(newTags);
  };
  const [tags3, setTags3] = useState<string[]>([
    "Collab",
    "Promotion",
    "Rated",
  ]);
  const handleTagsChange3 = (newTags: string[]) => {
    setTags3(newTags);
  };
  const clinetChoose = [
    { value: "Anthony Lewis", label: "Anthony Lewis" },
    { value: "Brian Villalobos", label: "Brian Villalobos" },
  ];
  const statusChoose = [
    { value: "Select", label: "Select" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];
  const priorityChoose = [
    { value: "Select", label: "Select" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];
  return (
    <>
      <>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content">
            {/* Breadcrumb */}
            <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
              <div className="my-auto mb-2">
                <h2 className="mb-1">Projects</h2>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link href={all_routes.adminDashboard}>
                        <i className="ti ti-smart-home" />
                      </Link>
                    </li>
                    <li className="breadcrumb-item">Employee</li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Projects
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                <div className="me-2 mb-2">
                  <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                    <Link
                      href={all_routes.projectlist}
                      className="btn btn-icon btn-sm active bg-primary text-white me-1"
                    >
                      <i className="ti ti-list-tree" />
                    </Link>
                    <Link
                      href={all_routes.project}
                      className="btn btn-icon btn-sm"
                    >
                      <i className="ti ti-layout-grid" />
                    </Link>
                  </div>
                </div>
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
                    data-bs-target="#add_project"
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <i className="ti ti-circle-plus me-2" />
                    Add Project
                  </Link>
                </div>
                <div className="ms-2 head-icons">
                  <CollapseHeader />
                </div>
              </div>
            </div>
            {/* /Breadcrumb */}
            {/* Project list */}
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <h5>Project List</h5>
                <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
                          Desending
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
            {/* / Project list  */}
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
      </>

      {/* Add Project */}
      <div className="modal fade" id="add_project" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header header-border align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <h5 className="modal-title me-2">Add Project </h5>
                <p className="text-dark">Project ID : PRO-0004</p>
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="add-info-fieldset ">
              <div className="contact-grids-tab p-3 pb-0">
                <ul className="nav nav-underline" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="basic-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#basic-info"
                      type="button"
                      role="tab"
                      aria-selected="true"
                    >
                      Basic Information
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="member-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#member"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      Members
                    </button>
                  </li>
                </ul>
              </div>
              <div className="tab-content" id="myTabContent">
                <div
                  className="tab-pane fade show active"
                  id="basic-info"
                  role="tabpanel"
                  aria-labelledby="basic-tab"
                  tabIndex={0}
                >
                  <form>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                              <i className="ti ti-photo text-gray-2 fs-16" />
                            </div>
                            <div className="profile-upload">
                              <div className="mb-2">
                                <h6 className="mb-1">Upload Project Logo</h6>
                                <p className="fs-12">
                                  Image should be below 4 mb
                                </p>
                              </div>
                              <div className="profile-uploader d-flex align-items-center">
                                <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                                  Upload
                                  <input
                                    type="file"
                                    className="form-control image-sign"
                                    multiple
                                  />
                                </div>
                                <Link href="#" className="btn btn-light btn-sm">
                                  Cancel
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Project Name</label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Client</label>
                            <CommonSelect
                              className="select"
                              options={clinetChoose}
                              defaultValue={clinetChoose[0]}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Start Date</label>
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
                                <label className="form-label">End Date</label>
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
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Priority</label>
                                <CommonSelect
                                  className="select"
                                  options={priority}
                                  defaultValue={priority[0]}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">
                                  Project Value
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  defaultValue="$"
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Price Type</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  defaultValue=""
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Description</label>
                            <CommonTextEditor />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="input-block mb-0">
                            <label className="form-label">Upload Files</label>
                            <input className="form-control" type="file" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <div className="d-flex align-items-center justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-light border me-2"
                          data-bs-dismiss="modal"
                        >
                          Cancel
                        </button>
                        <button className="btn btn-primary" type="submit">
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                <div
                  className="tab-pane fade"
                  id="member"
                  role="tabpanel"
                  aria-labelledby="member-tab"
                  tabIndex={0}
                >
                  <form>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label me-2">
                              Team Members
                            </label>
                            <TagInput
                              initialTags={tags}
                              onTagsChange={handleTagsChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label me-2">
                              Team Leader
                            </label>
                            <TagInput
                              initialTags={tags2}
                              onTagsChange={handleTagsChange2}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label me-2">
                              Project Manager
                            </label>
                            <TagInput
                              initialTags={tags2}
                              onTagsChange={handleTagsChange2}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div>
                            <label className="form-label">Tags</label>
                            <TagInput
                              initialTags={tags3}
                              onTagsChange={handleTagsChange3}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Status</label>
                            <CommonSelect
                              className="select"
                              options={statusChoose}
                              defaultValue={statusChoose[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <div className="d-flex align-items-center justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-light border me-2"
                          data-bs-dismiss="modal"
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          type="button"
                          data-bs-toggle="modal"
                          data-inert={true}
                          data-bs-target="#success_modal"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Project */}
      {/* Edit Project */}
      <div className="modal fade" id="edit_project" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header header-border align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <h5 className="modal-title me-2">Edit Project </h5>
                <p className="text-dark">Project ID : PRO-0004</p>
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="add-info-fieldset ">
              <div className="contact-grids-tab p-3 pb-0">
                <ul className="nav nav-underline" id="myTab1" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="basic-tab1"
                      data-bs-toggle="tab"
                      data-bs-target="#basic-info1"
                      type="button"
                      role="tab"
                      aria-selected="true"
                    >
                      Basic Information
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="member-tab1"
                      data-bs-toggle="tab"
                      data-bs-target="#member1"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      Members
                    </button>
                  </li>
                </ul>
              </div>
              <div className="tab-content" id="myTabContent1">
                <div
                  className="tab-pane fade show active"
                  id="basic-info1"
                  role="tabpanel"
                  aria-labelledby="basic-tab1"
                  tabIndex={0}
                >
                  <form>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                              <i className="ti ti-photo text-gray-2 fs-16" />
                            </div>
                            <div className="profile-upload">
                              <div className="mb-2">
                                <h6 className="mb-1">Upload Project Logo</h6>
                                <p className="fs-12">
                                  Image should be below 4 mb
                                </p>
                              </div>
                              <div className="profile-uploader d-flex align-items-center">
                                <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                                  Upload
                                  <input
                                    type="file"
                                    className="form-control image-sign"
                                    multiple
                                  />
                                </div>
                                <Link href="#" className="btn btn-light btn-sm">
                                  Cancel
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Project Name</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="Office Management"
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Client</label>
                            <CommonSelect
                              className="select"
                              options={clinetChoose}
                              defaultValue={clinetChoose[1]}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Start Date</label>
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
                                <label className="form-label">End Date</label>
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
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Priority</label>
                                <CommonSelect
                                  className="select"
                                  options={priorityChoose}
                                  defaultValue={priorityChoose[1]}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">
                                  Project Value
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  defaultValue="$"
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Price Type</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  defaultValue=""
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Description</label>
                            <CommonTextEditor />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="input-block mb-0">
                            <label className="form-label">Upload Files</label>
                            <input className="form-control" type="file" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <div className="d-flex align-items-center justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-light border me-2"
                          data-bs-dismiss="modal"
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          type="button"
                          data-bs-dismiss="modal"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                <div
                  className="tab-pane fade"
                  id="member1"
                  role="tabpanel"
                  aria-labelledby="member-tab1"
                  tabIndex={0}
                >
                  <form>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label me-2">
                              Team Members
                            </label>
                            <TagInput
                              initialTags={tags}
                              onTagsChange={handleTagsChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label me-2">
                              Team Leader
                            </label>
                            <TagInput
                              initialTags={tags1}
                              onTagsChange={handleTagsChange1}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label me-2">
                              Project Manager
                            </label>
                            <TagInput
                              initialTags={tags2}
                              onTagsChange={handleTagsChange2}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div>
                            <label className="form-label">Tags</label>
                            <TagInput
                              initialTags={tags3}
                              onTagsChange={handleTagsChange3}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Status</label>
                            <CommonSelect
                              className="select"
                              options={statusChoose}
                              defaultValue={statusChoose[1]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <div className="d-flex align-items-center justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-light border me-2"
                          data-bs-dismiss="modal"
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          type="button"
                          data-bs-toggle="modal"
                          data-inert={true}
                          data-bs-target="#success_modal"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Project */}
      {/* Add Project Success */}
      <div className="modal fade" id="success_modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body">
              <div className="text-center p-3">
                <span className="avatar avatar-lg avatar-rounded bg-success mb-3">
                  <i className="ti ti-check fs-24" />
                </span>
                <h5 className="mb-2">Project Added Successfully</h5>
                <p className="mb-3">
                  Stephan Peralt has been added with Client ID :{" "}
                  <span className="text-primary">#pro - 0004</span>
                </p>
                <div>
                  <div className="row g-2">
                    <div className="col-6">
                      <Link
                        href={all_routes.project}
                        className="btn btn-dark w-100"
                      >
                        Back to List
                      </Link>
                    </div>
                    <div className="col-6">
                      <Link
                        href={all_routes.projectdetails}
                        className="btn btn-primary w-100"
                      >
                        Detail Page
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Project Success */}
    </>
  );
};

export default ProjectListComponent;
