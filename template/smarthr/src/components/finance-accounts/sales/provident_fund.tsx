"use client";

import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import Table from "../../../core/common/dataTable/index";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import { provident_funds } from "../../../core/data/json/provident_funds_details";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";

// Define a type for provident fund data
interface ProvidentFundData {
    Employee_Name: string;
    Image: string;
    Roll: string;
    Provident_Fund_Type: string;
    Employee_Share: string;
    Organization_Share: string;
    Status: string;
    action?: string;
}

const ProvidentFundComponent = () => {

    const data: ProvidentFundData[] = provident_funds;
    const columns = [
        {
            title: "Employee Name",
            dataIndex: "Employee_Name",
            render: (_text: string, record: ProvidentFundData) => (
                <div className="d-flex align-items-center file-name-icon">
                    <Link href="#" className="avatar avatar-md avatar-rounded">
                        <ImageWithBasePath
                            src={`assets/img/users/${record.Image}`}
                            className="img-fluid"
                            alt={`${record.Employee_Name} Profile`}
                        />
                    </Link>
                    <div className="ms-2">
                        <h6 className="fw-medium">
                            <Link href="#">{record.Employee_Name}</Link>
                        </h6>
                        <span className="d-block mt-1">{record.Roll}</span>
                    </div>
                </div>
            ),
            sorter: (a: ProvidentFundData, b: ProvidentFundData) =>
                a.Employee_Name.length - b.Employee_Name.length,
        },
        {
            title: "Provident Fund Type",
            dataIndex: "Provident_Fund_Type",
            sorter: (a: ProvidentFundData, b: ProvidentFundData) =>
                a.Provident_Fund_Type.length - b.Provident_Fund_Type.length,
        },
        {
            title: "Employee Share",
            dataIndex: "Employee_Share",
            sorter: (a: ProvidentFundData, b: ProvidentFundData) =>
                a.Employee_Share.length - b.Employee_Share.length,
        },
        {
            title: "Organization Share",
            dataIndex: "Organization_Share",
            sorter: (a: ProvidentFundData, b: ProvidentFundData) =>
                a.Organization_Share.length - b.Organization_Share.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: string, _record: ProvidentFundData) => (
                <div className="dropdown">
                    <button
                        type="button"
                        className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                    >
                        <span className={`rounded-circle bg-transparent-${text === "Approved" ? "success" : "skyblue"} d-flex justify-content-center align-items-center me-2`}>
                            <i className={`ti ti-point-filled text-${text === "Approved" ? "success" : "skyblue"}`} />
                        </span>
                        {text}
                    </button>
                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                            <button
                                type="button"
                                className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                                <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                    <i className="ti ti-point-filled text-success" />
                                </span>
                                Approved
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                                <span className="rounded-circle bg-transparent-skyblue d-flex justify-content-center align-items-center me-2">
                                    <i className="ti ti-point-filled text-skyblue" />
                                </span>
                                Pending
                            </button>
                        </li>
                    </ul>
                </div>
            ),
            sorter: (a: ProvidentFundData, b: ProvidentFundData) => a.Status.length - b.Status.length,
        },
        {
            title: "",
            dataIndex: "action",
            render: (_text: string, _record: ProvidentFundData) => (
                <div className="action-icon d-inline-flex">
                    <button
                        type="button"
                        className="me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#edit_provident-fund"
                        aria-label="Edit provident fund"
                    >
                        <i className="ti ti-edit" />
                    </button>
                    <button
                        type="button"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                        aria-label="Delete provident fund"
                    >
                        <i className="ti ti-trash" />
                    </button>
                </div>
            ),
            sorter: (a: ProvidentFundData, b: ProvidentFundData) => (a.action?.length || 0) - (b.action?.length || 0),
        },
    ];

    const employeeName = [
        { value: "Select", label: "Select" },
        { value: "Anthony Lewis", label: "Anthony Lewis" },
        { value: "Brian Villalobos", label: "Brian Villalobos" },
        { value: "Harvey Smith", label: "Harvey Smith" },
    ];
    const fundtype = [
        { value: "Select", label: "Select" },
        { value: "Employee Provident Fund", label: "Employee Provident Fund" },
        { value: "Voluntary Provident Fund", label: "Voluntary Provident Fund" },
        { value: "Employee Provident Fund", label: "Employee Provident Fund" },
    ];

    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Provident Fund</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Sales</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Provident Fund
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
                                    data-bs-target="#add_provident-fund"
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Add Provident Fund
                                </button>
                            </div>
                            <div className="head-icons ms-2">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <h5>Expenses List</h5>
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
                                        Select status
                                    </button>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <button type="button" className="dropdown-item rounded-1">
                                                Approved
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" className="dropdown-item rounded-1">
                                                Pending
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
            {/* Add Promotion */}
            <div className="modal fade" id="add_provident-fund">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Provident Fund</h4>
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
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Employee Name</label>
                                            <CommonSelect
                                                className='select'
                                                options={employeeName}
                                                defaultValue={employeeName[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Provident Fund Type</label>
                                            <CommonSelect
                                                className='select'
                                                options={fundtype}
                                                defaultValue={fundtype[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Employee Share(%)</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Organization Share(%)
                                            </label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Employee Share(Amount)
                                            </label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Organization Share(Amount)
                                            </label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-white border me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button type="button" data-bs-dismiss="modal" className="btn btn-primary">
                                    Add Provident Fund
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Promotion */}
            {/* Edit Promotion */}
            <div className="modal fade" id="edit_provident-fund">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Provident Fund</h4>
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
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Employee Name</label>
                                            <CommonSelect
                                                className='select'
                                                options={employeeName}
                                                defaultValue={employeeName[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Provident Fund Type</label>
                                            <CommonSelect
                                                className='select'
                                                options={fundtype}
                                                defaultValue={fundtype[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Employee Share(%)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="2%"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Organization Share(%)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="2%"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Employee Share(Amount)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={2000}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Organization Share(Amount)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={2000}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-white border me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button type="button" data-bs-dismiss="modal" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Promotion */}
        </>
    );
};

export default ProvidentFundComponent;
