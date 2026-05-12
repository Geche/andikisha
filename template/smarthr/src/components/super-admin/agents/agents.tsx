"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import { agentsData } from "@/core/data/json/agentsData";
import CommonFooter from "@/core/common/commonFooter/footer";
import AgentModal from "./modal/agentModal";
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
    Availability: 'Available' | 'Not Available' | string;
}
const AgentsComponent = () => {
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
                            <h2 className="mb-1">Agents</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Super Admin</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Agents
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
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
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                <i className="ti ti-file-type-pdf me-1" />
                                                Export as PDF
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
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
                                    data-bs-target="#add_agent"
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Add New Agent
                                </Link>
                            </div>

                            <div className="ms-2 head-icons">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <h5>Agents List</h5>
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
                                                Available
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Not Available
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
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Recently Added
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Ascending
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Descending
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
                                                Last Month
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="#"
                                                className="dropdown-item rounded-1"
                                            >
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
                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
            <AgentModal />
        </>
    )
}

export default AgentsComponent