"use client";

import CollapseHeader from '../../../core/common/collapse-header/collapse-header'
import PredefinedDateRanges from '../../../core/common/datePicker'
import { dealListData } from '../../../core/data/json/dealList'
import Table from "../../../core/common/dataTable/index";
import CrmsModal from '../../../core/modals/crms_modal'
import { all_routes } from '@/routes/all_routes';
import Link from 'next/link';

// Define a type for deal data
interface DealData {
  DealName: string;
  Stage: string;
  DealValue: string;
  Tags: string;
  ExpectedClosedDate: string;
  Owner: string;
  Probability: string;
  Status: string;
  key?: string | number;
}

const DealsListComponent = () => {
  const routes = all_routes
  const data: DealData[] = dealListData;
  const columns = [
    {
      title: "Deal Name",
      dataIndex: "DealName",
      render: (text: string) => (
        <h6 className="fw-medium fs-14">
          <Link href={routes.dealsDetails}>{text}</Link>
        </h6>
      ),
      sorter: (a: DealData, b: DealData) => a.DealName.length - b.DealName.length,
    },
    {
      title: "Stage",
      dataIndex: "Stage",
      sorter: (a: DealData, b: DealData) => a.Stage.length - b.Stage.length,
    },
    {
      title: "Deal Value",
      dataIndex: "DealValue",
      sorter: (a: DealData, b: DealData) => a.DealValue.length - b.DealValue.length,
    },
    {
      title: "Tags",
      dataIndex: "Tags",
      render: (text: string) => (
        <span className={`badge  ${text === 'Promotion'? 'badge-info-transparent':text === 'Rated'? 'badge-warning-transparent':text === 'Collab'? 'badge-pink-transparent':text === 'Rejected'? 'badge-danger-transparent':'badge-purple-transparent'}`}>
          {text}
        </span>
      ),
      sorter: (a: DealData, b: DealData) => a.Tags.length - b.Tags.length,
    },
    {
      title: "Expected Closed Date",
      dataIndex: "ExpectedClosedDate",
      sorter: (a: DealData, b: DealData) => a.ExpectedClosedDate.length - b.ExpectedClosedDate.length,
    },
    {
      title: "Owner",
      dataIndex: "Owner",
      sorter: (a: DealData, b: DealData) => a.Owner.length - b.Owner.length,
    },
    {
      title: "Probability",
      dataIndex: "Probability",
      sorter: (a: DealData, b: DealData) => a.Probability.length - b.Probability.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge d-inline-flex align-items-center badge-xs ${text === 'Won'
            ? 'badge-success'
            : text === 'Lost' ? 'badge-danger' : 'badge-info'
          }`}
        >
          <i className="ti ti-point-filled me-1"></i>
          {text}
        </span>
      ),
      sorter: (a: DealData, b: DealData) => a.Status.length - b.Status.length,
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
            data-bs-target="#edit_deals"
            aria-label="Edit deal"
          >
            <i className="ti ti-edit" />
          </Link>
          <Link
            href="#"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            aria-label="Delete deal"
          >
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
    },
  ]
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Deals</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">CRM</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Deals List
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    href={routes.dealsList}
                    className="btn btn-icon btn-sm active bg-primary text-white me-1"
                  >
                    <i className="ti ti-list-tree" />
                  </Link>
                  <Link href={routes.dealsGrid} className="btn btn-icon btn-sm">
                    <i className="ti ti-layout-grid" />
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
                  data-bs-toggle="modal"
                  data-bs-target="#add_deals"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Deal
                </button>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Deal List */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Deal List</h5>
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
                    Stage
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Quality To Buy
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Proposal Made
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
                        Open
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Won
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Last
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
          {/* /Deal List */}
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
      <CrmsModal />
    </>
  )
}

export default DealsListComponent