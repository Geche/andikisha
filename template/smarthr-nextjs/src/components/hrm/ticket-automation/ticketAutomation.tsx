import CommonFooter from '@/core/common/commonFooter/footer';
import { ticketAutomationData } from '@/core/data/json/ticket_automation';

import AddNewAutomation from './addNewAutomation';
import { all_routes } from '@/routes/all_routes';
import Link from 'next/link';


 // Define a type for company data
interface TicketAutomation {
  key: string | number;
  Rule_ID: string,
  Rule_Name: string,
  Trigger_Event: string,
  Condition: string,
  Action: string,
  Assigned_To: string,
  Status: string
}
const TicketAutomationComponent = () => {
  const routes = all_routes;
  const data: TicketAutomation[] = ticketAutomationData;
  const columns = [
    {
      title: "Rule ID",
      dataIndex: "Rule_ID",

      sorter: (a: TicketAutomation, b: TicketAutomation) =>
        a.Rule_ID.length - b.Rule_ID.length,
    },
    {
      title: " Rule Name",
      dataIndex: " Rule_Name",

      sorter: (a: TicketAutomation, b: TicketAutomation) =>
        a.Rule_Name.length - b.Rule_Name.length,
    },
    {
      title: "Trigger Event",
      dataIndex: "Trigger_Event",

      sorter: (a: TicketAutomation, b: TicketAutomation) =>
        a.Trigger_Event.length - b.Trigger_Event.length,
    },
    {
      title: " Condition",
      dataIndex: " Condition",

      sorter: (a: TicketAutomation, b: TicketAutomation) =>
        a.Condition.length - b.Condition.length,
    },
    {
      title: "  Action",
      dataIndex: "  Action",

      sorter: (a: TicketAutomation, b: TicketAutomation) =>
        a.Action.length - b.Action.length,
    },
    {
      title: " Assigned To",
      dataIndex: "  Assigned_To",

      sorter: (a: TicketAutomation, b: TicketAutomation) =>
        a.Assigned_To.length - b.Assigned_To.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge border   ${text === "Applied"
              ? "border-purple text-purple"
              : text === "Shortlisted"
                ? "border-pink text-pink"
                : text === "In progress"
                  ? "border-info text-info"
                  : text === "Selected"
                    ? "border-success text-success"
                    : text === "Rejected"
                      ? "border-danger text-danger"
                      : "border-warning text-warning"
            }`}
        >
          <i className="ti ti-point-filled" />
          {text}
        </span>
      ),
      sorter: (a: TicketAutomation, b: TicketAutomation) => a.Status.length - b.Status.length,
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
              <h2 className="mb-1">Ticket Automation</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Tickets</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Ticket Automation
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
                  data-bs-toggle="offcanvas"
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
                    Select Status
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Active
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
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
                      <th>Rule Name</th>
                      <th>Trigger Event</th>
                      <th>Condition</th>
                      <th>Action</th>
                      <th>Assigned To</th>
                      <th>Status</th>
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
                        <p className="text-dark fw-medium mb-0">
                          Auto Assign IT Login Issues
                        </p>
                      </td>
                      <td>Ticket Created</td>
                      <td>Category = Login Issue</td>
                      <td>Assign Ticket</td>
                      <td>Assigned Agent</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
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
                        <p className="text-dark fw-medium mb-0">
                          Critical Ticket Alert
                        </p>
                      </td>
                      <td>Ticket Created</td>
                      <td>Priority = Critical</td>
                      <td>Send Email Notification</td>
                      <td>Support Manager</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
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
                        <p className="text-dark fw-medium mb-0">
                          SLA Breach Escalation
                        </p>
                      </td>
                      <td>SLA Breached</td>
                      <td>Response Time &gt; SLA</td>
                      <td>Escalate Ticket</td>
                      <td>Team Lead</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
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
                        <p className="text-dark fw-medium mb-0">
                          Auto Close Inactive Tickets
                        </p>
                      </td>
                      <td>Time Based</td>
                      <td>No Update for 7 Days</td>
                      <td>Close Ticket</td>
                      <td>System</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
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
                        <p className="text-dark fw-medium mb-0">
                          Priority Change Notification
                        </p>
                      </td>
                      <td>Priority Updated</td>
                      <td>Priority = High</td>
                      <td>Send Email Notification</td>
                      <td>Assigned Agent</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
      {/* /Page Wrapper --
   */}
   <AddNewAutomation/>
</>

  );
};

export default TicketAutomationComponent;