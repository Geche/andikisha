"use client";

import { pipelineData } from '../../../core/data/json/pipelineData';
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import PredefinedDateRanges from "../../../core/common/datePicker";
import Table from "../../../core/common/dataTable/index";
import CrmsModal from '../../../core/modals/crms_modal'
import { all_routes } from '@/routes/all_routes';
import Link from 'next/link';

// Define a type for pipeline data
interface PipelineData {
  Pipeline_Name: string;
  Total_Deal_Value: string;
  No_of_Deals: string;
  Stages: string;
  Created_Date: string;
  Status: string;
  key?: string | number;
}

const PipelineComponent = () => {
  const routes = all_routes;
  const data: PipelineData[] = pipelineData;
  const columns = [
    {
      title: "Pipeline Name",
      dataIndex: "Pipeline_Name",
      render: (text: string) => (
        <h6 className="fs-14 fw-medium">{text}</h6>
      ),
      sorter: (a: PipelineData, b: PipelineData) => a.Pipeline_Name.length - b.Pipeline_Name.length,
    },
    {
      title: "Total_Deal_Value",
      dataIndex: "Total_Deal_Value",
      sorter: (a: PipelineData, b: PipelineData) => a.Total_Deal_Value.length - b.Total_Deal_Value.length,
    },
    {
      title: "No_of_Deals",
      dataIndex: "No_of_Deals",
      sorter: (a: PipelineData, b: PipelineData) => a.No_of_Deals.length - b.No_of_Deals.length,
    },
    {
      title: "Stages",
      dataIndex: "Stages",
      render: (text: string) => (
        <div className="d-flex align-items-center">
          <div
            className="progress me-2"
            role="progressbar"
            aria-label="Stage progress"
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ height: 5, minWidth: 80 }}
          >
            <div
              className={`progress-bar  ${text === 'Won' ? 'bg-success' : text === 'In Pipeline' ? 'bg-purple' : text === 'Conversation' ? 'bg-skyblue' : text === 'Follow Up' ? 'bg-warning' : text === 'Schedule servise' ? 'bg-pink' : 'bg-danger'}`}
              style={{ width: "100%" }}
            />
          </div>
          <span className="fs-14 fw-normal">{text}</span>
        </div>
      ),
      sorter: (a: PipelineData, b: PipelineData) => a.Stages.length - b.Stages.length,
    },
    {
      title: "Created Date",
      dataIndex: "Created_Date",
      sorter: (a: PipelineData, b: PipelineData) => a.Created_Date.length - b.Created_Date.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge d-inline-flex align-items-center badge-xs ${
            text === "Active" ? "badge-success" : "badge-danger"
          }`}
        >
          <i className="ti ti-point-filled me-1"></i>
          {text}
        </span>
      ),
      sorter: (a: PipelineData, b: PipelineData) => a.Status.length - b.Status.length,
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
            data-bs-target="#edit_pipeline"
            aria-label="Edit pipeline"
          >
            <i className="ti ti-edit" />
          </Link>
          <Link
            href="#"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            aria-label="Delete pipeline"
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
              <h2 className="mb-1">Pipeline</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">CRM</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Pipeline List
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
              <div className="mb-2">
                <button
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#add_pipeline"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Pipeline
                </button>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader/>
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Pipeline List */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Pipeline List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon position-relative">
                    <PredefinedDateRanges/>
                    
                  </div>
                </div>
                <div className="dropdown me-3">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Stage
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Won
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        In Pipeline
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Conversation
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Follow Up
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
                    $0.00 - $0.00
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        $10 - $20
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        $20 - $30
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        $40 - $50
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
                      <button type="button" className="dropdown-item rounded-1">
                        Active
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        InActive
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
              <Table dataSource={data} columns={columns} Selection={true} />
            </div>
          </div>
          {/* /Pipeline List */}
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
      <CrmsModal/>
    </>
  )
}

export default PipelineComponent