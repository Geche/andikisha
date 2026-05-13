"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import CommonFooter from "@/core/common/commonFooter/footer";
import { certificationTrackingData } from "@/core/data/json/certificationTrackingData";
import CertificationTrackingModal from "./modal/certificationTrackingModal";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";



interface CertificationTrackingData {
    Image1: string;
    Image: string;
    name: string;
    Training_Type: string;
    Date: string;
    Trainee_name: string;
    Status: string;
}
const CertificationTrackingComponent = () => {
    const data: CertificationTrackingData[] = certificationTrackingData;
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (_text: string, record: CertificationTrackingData) => (
                <div className="d-flex align-items-center file-name-icon">
                    <Link href="#" className="avatar avatar-md border avatar-rounded">
                        <ImageWithBasePath
                            src={`assets/img/users/${record.Image1}`}
                            className="img-fluid"
                            alt={`${record.name} logo`}
                        />
                    </Link>
                    <div className="ms-2">
                        <h6 className="fw-medium">
                            <Link href="#">{record.name}</Link>
                        </h6>
                    </div>
                </div>
            ),
            sorter: (a: CertificationTrackingData, b: CertificationTrackingData) => a.name.length - b.name.length,
        },
        {
            title: "Training Type",
            dataIndex: "Training_Type",
            render: (_text: string, record: CertificationTrackingData) => (
                <p className="mb-0 text-dark fw-semibold">
                    {record.Training_Type}
                </p>),
            sorter: (a: CertificationTrackingData, b: CertificationTrackingData) => a.Training_Type.length - b.Training_Type.length,
        },
        {
            title: "Trainee Name",
            dataIndex: "Trainee_name",
            render: (_text: string, record: CertificationTrackingData) => (
                <div className="d-flex align-items-center file-name-icon">
                    <Link href="#" className="avatar avatar-md border avatar-rounded">
                        <ImageWithBasePath
                            src={`assets/img/users/${record.Image}`}
                            className="img-fluid"
                            alt={`${record.Trainee_name} logo`}
                        />
                    </Link>
                    <div className="ms-2">
                        <h6 className="fw-medium">
                            <Link href="#">{record.Trainee_name}</Link>
                        </h6>
                    </div>
                </div>
            ),
            sorter: (a: CertificationTrackingData, b: CertificationTrackingData) => a.Trainee_name.length - b.Trainee_name.length,
        },
        {
            title: "Date",
            dataIndex: "Date",
            sorter: (a: CertificationTrackingData, b: CertificationTrackingData) => a.Date.length - b.Date.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: CertificationTrackingData['Status'], _record: CertificationTrackingData) => (
                <Link
                    href="#"
                    className={`badge ${text === 'Issued' ? 'badge-success' : 'badge-danger'} d-inline-flex align-items-center badge-xs`}
                >
                    <i className="ti ti-point-filled me-1"></i>
                    {text}
                </Link>
            ),
            sorter: (a: CertificationTrackingData, b: CertificationTrackingData) => a.Status.length - b.Status.length,
        },
        {
            title: "",
            dataIndex: "action",
            render: (_text: string, record: any) => (
                <div className="action-icon d-inline-flex">
                    <Link
                        href="#"
                        className="me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#details_modal"
                    >
                        <i className="ti ti-eye" />
                    </Link>
                    <Link href="#">
                        <i className="ti ti-download" />
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
                            <h2 className="mb-1">Certification Tracking</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Training</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Certification Tracking
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
                                    data-bs-toggle="modal"
                                    data-bs-target="#add_modal"
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Add New Certification
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
                            <h5>Certification List</h5>
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
                            <Table dataSource={data} columns={columns} Selection={true} />
                        </div>
                    </div>
                </div>
                <CommonFooter />
            </div>
            {/* /Page Wrapper */}
            <CertificationTrackingModal />
        </>
    )
}

export default CertificationTrackingComponent