"use client";
import React from 'react'
import { escalationRulesData } from '@/core/data/json/escalation_rules';
import Modal from './modal';
import { all_routes } from '@/routes/all_routes';
import Link from 'next/link';


// Define a type for company data
interface EscalationRules {
  key: string | number;
  Rule_ID: string,
  Trigger_Type: string,
  Priority: string,
  Condition: string,
  Escalation_Level: string,
  Escalates_To: string,
  Time_Threshold: string,
  Status: string
}
const EscalationRulesComponent = () => {
  const routes = all_routes;
  const data: EscalationRules[] = escalationRulesData;
  const columns = [
    {
      title: "Rule ID",
      dataIndex: "Rule_ID",

      sorter: (a: EscalationRules, b: EscalationRules) =>
        a.Rule_ID.length - b.Rule_ID.length,
    },
    {
      title: " Trigger Type",
      dataIndex: " Trigger_Type",

      sorter: (a: EscalationRules, b: EscalationRules) =>
        a.Trigger_Type.length - b.Trigger_Type.length,
    },
    {
      title: " Priority",
      dataIndex: " Priority",

      sorter: (a: EscalationRules, b: EscalationRules) =>
        a.Priority.length - b.Priority.length,
    },
    {
      title: " Condition",
      dataIndex: "Condition",

      sorter: (a: EscalationRules, b: EscalationRules) =>
        a.Condition.length - b.Condition.length,
    },
    {
      title: "Escalation Level",
      dataIndex: "Escalation_Level",

      sorter: (a: EscalationRules, b: EscalationRules) =>
        a.Escalation_Level.length - b.Escalation_Level.length,
    },
    {
      title: "Escalates To",
      dataIndex: "Escalates_To",

      sorter: (a: EscalationRules, b: EscalationRules) =>
        a.Escalates_To.length - b.Escalates_To.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge d-inline-flex align-items-center badge-xs ${text === 'Active' ? 'badge-success' : 'badge-danger'
            }`}
        >
          <i className="ti ti-point-filled me-1"></i>
          {text}
        </span>
      ),
      sorter: (a: EscalationRules, b: EscalationRules) => a.Status.length - b.Status.length,
    },
  ]
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Escalation Rules</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Super Admin</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Escalation Rules
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="mb-2 me-2">
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
                  className="btn btn-primary d-flex align-items-center"
                  data-bs-toggle="modal"
                  data-bs-target="#add_modal"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add New Rule
                </Link>
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Escalation Rules List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Priority
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Critical
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        High
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Medium
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Low
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
                        Descending
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
              <div className="custom-datatable-filter table-responsive rounded-0">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th className="no-sort">
                        <div className="form-check form-check-md">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="select-all"
                          />
                        </div>
                      </th>
                      <th>Rule ID</th>
                      <th>Trigger Type</th>
                      <th>Priority</th>
                      <th>Condition</th>
                      <th>Escalation Level</th>
                      <th>Escalates To</th>
                      <th>Time Threshold</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>#ER005</td>
                      <td>
                        <p className="text-dark fw-medium mb-0">SLA Breach</p>
                      </td>
                      <td>Critical</td>
                      <td>No resolution</td>
                      <td>Level 1</td>
                      <td>Team Lead</td>
                      <td>30 mins</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td>
                        <span className="badge border border-purple text-purple d-inline-flex align-items-center badge-xs">
                          Notify
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>#ER004</td>
                      <td>
                        <p className="text-dark fw-medium mb-0">SLA Breach</p>
                      </td>
                      <td>High</td>
                      <td>No resolution</td>
                      <td>Level 1</td>
                      <td>Support Lead</td>
                      <td>1 hour</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td>
                        <span className="badge border border-pink text-pink d-inline-flex align-items-center badge-xs">
                          Notify + Assign
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>#ER003</td>
                      <td>
                        <p className="text-dark fw-medium mb-0">Status Based</p>
                      </td>
                      <td>Medium</td>
                      <td>Ticket in Progress</td>
                      <td>Level 1</td>
                      <td>Supervisor</td>
                      <td>4 hours</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td>
                        <span className="badge border border-danger text-danger d-inline-flex align-items-center badge-xs">
                          Reminder
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>#ER002</td>
                      <td>
                        <p className="text-dark fw-medium mb-0">Priority Based</p>
                      </td>
                      <td>Medium</td>
                      <td>Ticket not assigned</td>
                      <td>Level 1</td>
                      <td>Admin</td>
                      <td>6 hours</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td>
                        <span className="badge border border-purple text-purple d-inline-flex align-items-center badge-xs">
                          Notify
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>#ER001</td>
                      <td>
                        <p className="text-dark fw-medium mb-0">Time Based</p>
                      </td>
                      <td>Low</td>
                      <td>Pending too long</td>
                      <td>Level 2</td>
                      <td>Support Lead</td>
                      <td>8 hours</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td>
                        <span className="badge border border-pink text-pink d-inline-flex align-items-center badge-xs">
                          Notify + Assign
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
      <Modal />
    </>
  );
};

export default EscalationRulesComponent;
