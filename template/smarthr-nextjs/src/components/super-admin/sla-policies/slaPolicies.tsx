"use client";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import { agentsData } from "@/core/data/json/agentsData";
import CommonFooter from "@/core/common/commonFooter/footer";
import SLAModal from "./modal/slaModal";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";


interface AgentsData {
    AgentId: string;
    AgentName: string;
    Image: string;
    Email: string;
    Role: string;
    TicketAssigned: string;
    TicketResolved: string;
    Availability: 'Paid' | 'Unpaid' | string;
}
const SlaPolicies = () => {
    const data: AgentsData[] = agentsData;
    const columns = [
        {
            title: "Agent ID",
            dataIndex: "AgentId",
            render: (text: string, _record: AgentsData) => (
                <Link href="#" className="link-default">{text}</Link>
            ),
            sorter: (a: AgentsData, b: AgentsData) => a.AgentId.length - b.AgentId.length,
        },
        {
            title: "Agent Name",
            dataIndex: "AgentName",
            render: (_text: string, record: AgentsData) => (
                <div className="d-flex align-items-center file-name-icon">
                    <Link href="#" className="avatar avatar-md border avatar-rounded">
                        <ImageWithBasePath
                            src={`assets/img/agents/${record.Image}`}
                            className="img-fluid"
                            alt={`${record.AgentName} logo`}
                        />
                    </Link>
                    <div className="ms-2">
                        <h6 className="fw-medium">
                            <Link href="#">{record.AgentName}</Link>
                        </h6>
                    </div>
                </div>
            ),
            sorter: (a: AgentsData, b: AgentsData) => a.AgentName.length - b.AgentName.length,
        },
        {
            title: "Email",
            dataIndex: "Email",
            sorter: (a: AgentsData, b: AgentsData) => a.Email.length - b.Email.length,
        },
        {
            title: "Role",
            dataIndex: "Role",
            sorter: (a: AgentsData, b: AgentsData) => a.Role.length - b.Role.length,
        },
        {
            title: "Ticket Assigned",
            dataIndex: "TicketAssigned",
            sorter: (a: AgentsData, b: AgentsData) => a.TicketAssigned.length - b.TicketAssigned.length,
        },
        {
            title: "Ticket Resolved",
            dataIndex: "TicketResolved",
            sorter: (a: AgentsData, b: AgentsData) => a.TicketResolved.length - b.TicketResolved.length,
        },
        {
            title: "Availability",
            dataIndex: "Availability",
            render: (text: AgentsData['Availability'], _record: AgentsData) => (
                <Link
                    href="#"
                    className={`badge ${text === 'Available' ? 'badge-success' : 'badge-danger'} d-inline-flex align-items-center badge-xs`}
                >
                    <i className="ti ti-point-filled me-1"></i>
                    {text}
                </Link>
            ),
            sorter: (a: AgentsData, b: AgentsData) => a.Availability.length - b.Availability.length,
        },
        {
            title: "",
            dataIndex: "action",
            render: (_text: string) => (
                <div className="action-icon d-inline-flex">
                    <Link
                        href="#"
                        className="me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#edit_agent"
                    >
                        <i className="ti ti-edit" />
                    </Link>
                    <Link href="#" data-bs-toggle="modal" data-bs-target="#delete_modal">
                        <i className="ti ti-trash" />
                    </Link>
                </div>
            ),
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
                            <h2 className="mb-1">SLA Policies</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Super Admin</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        SLA Policies
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
                                    Add New Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <h5>SLA Policies List</h5>
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
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Critical
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                High
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
                                                Medium
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="dropdown-item rounded-1">
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
                                <table className="table datatable">
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
                                            <th>Priority</th>
                                            <th>Description</th>
                                            <th>First Response Time</th>
                                            <th>Resolution Time</th>
                                            <th>Escalation Time</th>
                                            <th>Escalates To</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div className="form-check form-check-md">
                                                    <input className="form-check-input" type="checkbox" />
                                                </div>
                                            </td>
                                            <td>
                                                <p className="text-dark fw-medium mb-0">Critical</p>
                                            </td>
                                            <td>System wide outage affecting all tenants</td>
                                            <td>1 Hour</td>
                                            <td>2 – 4 Hours</td>
                                            <td>1 hour</td>
                                            <td>Support Lead</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="form-check form-check-md">
                                                    <input className="form-check-input" type="checkbox" />
                                                </div>
                                            </td>
                                            <td>
                                                <p className="text-dark fw-medium mb-0">High</p>
                                            </td>
                                            <td>Core module failure affecting primary workflow</td>
                                            <td>4 Hours</td>
                                            <td>8 Hours</td>
                                            <td>2 hours</td>
                                            <td>Support Lead</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="form-check form-check-md">
                                                    <input className="form-check-input" type="checkbox" />
                                                </div>
                                            </td>
                                            <td>
                                                <p className="text-dark fw-medium mb-0">Medium</p>
                                            </td>
                                            <td>Minor issue affecting a limited user group</td>
                                            <td>8 Hours</td>
                                            <td>24 Hours</td>
                                            <td>4 hours</td>
                                            <td>Support Team</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="form-check form-check-md">
                                                    <input className="form-check-input" type="checkbox" />
                                                </div>
                                            </td>
                                            <td>
                                                <p className="text-dark fw-medium mb-0">Low</p>
                                            </td>
                                            <td>Low impact problem affecting few users</td>
                                            <td>24 Hours</td>
                                            <td>1 - 2 Days</td>
                                            <td>6 hours</td>
                                            <td>Support Team</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
            <SLAModal />
        </>
    )
}

export default SlaPolicies