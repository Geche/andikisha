"use client";

import { estimate_details } from '../../../core/data/json/estimates-details';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Table from "../../../core/common/dataTable/index";
import CommonSelect from '../../../core/common/commonSelect';
import { DatePicker } from 'antd';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import Link from 'next/link';
import { all_routes } from '@/routes/all_routes';

interface EstimateData {
    Client_Name: string;
    Image: string;
    Roll: string;
    Company_Name: string;
    Estimate_Date: string;
    Expiry_Date: string;
    Amount: string;
    Status: string;
    action?: string;
}

const EstimatesComponent = () => {

    const getModalContainer = () => {
        const modalElement = document.getElementById('modal-datepicker');
        return modalElement ? modalElement : document.body;
    };

    const data: EstimateData[] = estimate_details;
    const columns = [
        {
            title: "Client Name",
            dataIndex: "Client_Name",
            render: (_text: string, record: EstimateData) => (
                <div className="d-flex align-items-center file-name-icon">
                    <Link href="#" className="avatar avatar-md avatar-rounded">
                        <ImageWithBasePath src={`assets/img/users/${record.Image}`} className="img-fluid" alt={`${record.Client_Name} Profile`} />
                    </Link>
                    <div className="ms-2">
                        <h6 className="fw-medium">
                            <Link href="#">{record.Client_Name}</Link>
                        </h6>
                        <span className="d-block mt-1">{record.Roll}</span>
                    </div>
                </div>
            ),
            sorter: (a: EstimateData, b: EstimateData) => a.Client_Name.length - b.Client_Name.length,
        },
        {
            title: "Company Name",
            dataIndex: "Company_Name",
            sorter: (a: EstimateData, b: EstimateData) => a.Company_Name.length - b.Company_Name.length,
        },
        {
            title: "Estimate Date",
            dataIndex: "Estimate_Date",
            sorter: (a: EstimateData, b: EstimateData) => a.Estimate_Date.length - b.Estimate_Date.length,
        },
        {
            title: "Expiry Date",
            dataIndex: "Expiry_Date",
            sorter: (a: EstimateData, b: EstimateData) => a.Expiry_Date.length - b.Expiry_Date.length,
        },
        {
            title: "Amount",
            dataIndex: "Amount",
            sorter: (a: EstimateData, b: EstimateData) => a.Amount.length - b.Amount.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: string) => (
                <span className={`badge ${text === 'Accepted' ? 'badge-success' : text === 'Sent' ? 'badge-soft-purple' : text === 'Expired' ? 'badge-soft-warning' : 'badge-soft-danger'}`}>{text}</span>
            ),
            sorter: (a: EstimateData, b: EstimateData) => a.Status.length - b.Status.length,
        },
        {
            title: "",
            dataIndex: "action",
            render: (_text: string, _record: EstimateData) => (
                <div className="action-icon d-inline-flex">
                    <button
                        type="button"
                        className="me-2 btn btn-link p-0"
                        data-bs-toggle="modal"
                        data-bs-target="#edit_estimate"
                        aria-label="Edit estimate"
                    >
                        <i className="ti ti-edit" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-link p-0"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                        aria-label="Delete estimate"
                    >
                        <i className="ti ti-trash" />
                    </button>
                </div>
            ),
            sorter: (a: EstimateData, b: EstimateData) => (a.action?.length || 0) - (b.action?.length || 0),
        },
    ]

    const clientChoose = [
        { value: "Select", label: "Select" },
        { value: "Michael Walker", label: "Michael Walker" },
        { value: "Sophie Headrick", label: "Sophie Headrick" },
        { value: "Cameron Drake", label: "Cameron Drake" },
    ];
    const projectChoose = [
        { value: "Select", label: "Select" },
        { value: "Project Management", label: "Project Management" },
        { value: "Office Management", label: "Office Management" },
    ];
    const taxChoose = [
        { value: "Select", label: "Select" },
        { value: "VAT", label: "VAT" },
        { value: "GST", label: "GST" },
        { value: "No Tax", label: "No Tax" },
    ];

    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Estimates</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Sales</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Estimates
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                            <div className="mb-2">
                                <button
                                    type="button"
                                    className="btn btn-primary d-flex align-items-center"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add_estimate"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Add Estimates
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
                            <h5>Estimates List</h5>
                            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                Accepted
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                Sent
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                Expired
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                Declined
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
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                Recently Added
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                Ascending
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                Desending
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                Last Month
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
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
            {/* Add Estimate  */}
            <div className="modal fade" id="add_estimate">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add New Estimate</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form >
                            <div className="modal-body pb-0">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Client <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={clientChoose}
                                                defaultValue={clientChoose[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Project <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={projectChoose}
                                                defaultValue={projectChoose[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Email <span className="text-danger"> *</span>
                                            </label>
                                            <input type="email" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Tax <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={taxChoose}
                                                defaultValue={taxChoose[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Client Address</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                defaultValue={""}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Biling Address</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                defaultValue={""}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Estimate Date</label>
                                            <div className="input-icon position-relative w-100 me-2">
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar" />
                                                </span>
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Expiry Date</label>
                                            <div className="input-icon position-relative w-100 me-2">
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar" />
                                                </span>
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <h4 className="mb-2">Add Items</h4>
                                    <div className="border rounded p-3 mb-3">
                                        <div className="add-estimate-info">
                                            <div className="row">
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label className="form-label">Item</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="mb-3">
                                                        <label className="form-label">Description</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label className="form-label">Unit Cost</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label className="form-label">Qty</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label className="form-label">Amount</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href="#"
                                            className="text-primary add-more-estimate fw-medium d-flex align-items-center mb-2"
                                        >
                                            <i className="ti ti-plus me-2" />
                                            Add New Item
                                        </Link>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Total </label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Tax </label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Discount(%) </label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Grand Total </label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="mb-3">
                                        <label className="form-label">Other Information</label>
                                        <textarea className="form-control" rows={3} defaultValue={""} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Estimate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Estimate */}
            {/* Edit Estimate  */}
            <div className="modal fade" id="edit_estimate">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Estimate</h4>
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
                                            <label className="form-label">
                                                Client <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={clientChoose}
                                                defaultValue={clientChoose[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Project <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={projectChoose}
                                                defaultValue={projectChoose[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Email <span className="text-danger"> *</span>
                                            </label>
                                            <input type="email" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Tax <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={taxChoose}
                                                defaultValue={taxChoose[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Client Address</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                defaultValue={""}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Biling Address</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                defaultValue={""}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Estimate Date</label>
                                            <div className="input-icon position-relative w-100 me-2">
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar" />
                                                </span>
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Expiry Date</label>
                                            <div className="input-icon position-relative w-100 me-2">
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar" />
                                                </span>
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <h4 className="mb-2">Add Items</h4>
                                    <div className="border rounded p-3 mb-3">
                                        <div className="add-estimate-info">
                                            <div className="row">
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label className="form-label">Item</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="mb-3">
                                                        <label className="form-label">Description</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label className="form-label">Unit Cost</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label className="form-label">Qty</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label className="form-label">Amount</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href="#"
                                            className="text-primary add-more-estimate fw-medium d-flex align-items-center mb-2"
                                        >
                                            <i className="ti ti-plus me-2" />
                                            Add New Item
                                        </Link>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Total </label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Tax </label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Discount(%) </label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Grand Total </label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="mb-3">
                                        <label className="form-label">Other Information</label>
                                        <textarea className="form-control" rows={3} defaultValue={""} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light me-2"
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
            {/* /Edit Estimate */}
        </>

    )
}

export default EstimatesComponent
