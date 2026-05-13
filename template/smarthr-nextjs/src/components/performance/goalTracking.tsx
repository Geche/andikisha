"use client";

import CollapseHeader from "../../core/common/collapse-header/collapse-header";
import { goalTrackingData } from "../../core/data/json/goalTrackingData";
import Table from "../../core/common/dataTable/index";
import GoalTrackingModal from "../../core/modals/goalTrackingModal";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

// Define interface for goal tracking data
interface GoalTrackingRecord {
  GoalType: string;
  Subject: string;
  TargetAchievement: string;
  StartDate: string;
  EndDate: string;
  Description: string;
  Status: string;
  Progress: string;
}

interface ColumnType<T> {
  title: string;
  dataIndex: keyof T | string;
  sorter?: (a: T, b: T) => number;
  render?: (text: any, record?: T) => React.ReactNode;
}

const GoalTrackingComponent = () => {
  const routes = all_routes;
  const data: GoalTrackingRecord[] = goalTrackingData;
  const columns: ColumnType<GoalTrackingRecord>[] = [
    {
      title: "Goal Type",
      dataIndex: "GoalType",
      sorter: (a, b) => a.GoalType.length - b.GoalType.length,
    },
    {
      title: "Subject",
      dataIndex: "Subject",
      sorter: (a, b) => a.Subject.length - b.Subject.length,
    },
    {
      title: "Target Achievement",
      dataIndex: "TargetAchievement",
      sorter: (a, b) => a.TargetAchievement.length - b.TargetAchievement.length,
    },
    {
      title: "Start Date",
      dataIndex: "StartDate",
      sorter: (a, b) => a.StartDate.length - b.StartDate.length,
    },
    {
      title: "End Date",
      dataIndex: "EndDate",
      sorter: (a, b) => a.EndDate.length - b.EndDate.length,
    },
    {
      title: "Description",
      dataIndex: "Description",
      sorter: (a, b) => a.Description.length - b.Description.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
          <i className="ti ti-point-filled me-1" aria-hidden="true" />
          {text}
        </span>
      ),
      sorter: (a, b) => a.Status.length - b.Status.length,
    },
    {
      title: "Progress",
      dataIndex: "Progress",
      render: (_text: string, record?: GoalTrackingRecord) => (
        <>
          <span className="fs-12 mb-1">{record?.Progress}</span>
          <div className="progress" style={{ width: "87px", height: "5px" }}>
            <div
              className="progress-bar bg-primary"
              style={{
                width:
                  record?.Progress === "Completed 70%"
                    ? "80%"
                    : record?.Progress === "Completed 40%"
                    ? "40%"
                    : "60%",
              }}
              aria-valuenow={
                record?.Progress === "Completed 70%"
                  ? 80
                  : record?.Progress === "Completed 40%"
                  ? 40
                  : 60
              }
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            ></div>
          </div>
        </>
      ),
      sorter: (a, b) => a.Progress.length - b.Progress.length,
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
            data-bs-target="#edit_goal"
            aria-label="Edit Goal"
          >
            <i className="ti ti-edit" />
          </Link>
          <Link
            href="#"
            data-bs-toggle="modal"
            data-inert={true}
            data-bs-target="#delete_modal"
            aria-label="Delete Goal"
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
              <h2 className="mb-1">Goal Tracking</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Performance</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Goal Tracking
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="mb-2">
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-inert={true}
                  data-bs-target="#add_goal"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Goal{" "}
                </Link>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Performance Indicator list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Goal Tracking List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <Table dataSource={data} columns={columns} Selection={true} />
            </div>
          </div>
          {/* /Performance Indicator list */}
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

      <GoalTrackingModal />
    </>
  );
};

export default GoalTrackingComponent;
