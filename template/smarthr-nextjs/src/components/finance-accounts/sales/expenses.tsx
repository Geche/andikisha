"use client";

import Table from "../../../core/common/dataTable/index";
import PredefinedDateRanges from '../../../core/common/datePicker';
import { expenses_details } from '../../../core/data/json/expenses_details';
import { DatePicker } from 'antd';
import CommonSelect from '../../../core/common/commonSelect';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";


// Define a type for expenses data
interface ExpenseData {
    Expense_Name: string;
    Date: string;
    Payment_Method: string;
    Amount: string;
    action?: string;
}

const ExpensesComponent = () => {

    const getModalContainer = () => {
        const modalElement = document.getElementById('modal-datepicker');
        return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
    };

    const data: ExpenseData[] = expenses_details;
    const columns = [
        {
            title: "Expense Name",
            dataIndex: "Expense_Name",
            sorter: (a: ExpenseData, b: ExpenseData) => a.Expense_Name.length - b.Expense_Name.length,
        },
        {
            title: "Date",
            dataIndex: "Date",
            sorter: (a: ExpenseData, b: ExpenseData) => a.Date.length - b.Date.length,
        },
        {
            title: "Payment Method",
            dataIndex: "Payment_Method",
            sorter: (a: ExpenseData, b: ExpenseData) => a.Payment_Method.length - b.Payment_Method.length,
        },
        {
            title: "Amount",
            dataIndex: "Amount",
            sorter: (a: ExpenseData, b: ExpenseData) => a.Amount.length - b.Amount.length,
        },
        {
            title: "",
            dataIndex: "action",
            render: (_text: string, _record: ExpenseData) => (
                <div className="action-icon d-inline-flex">
                    <button
                        type="button"
                        className="me-2 btn btn-link p-0"
                        data-bs-toggle="modal"
                        data-bs-target="#edit_expenses"
                        aria-label="Edit expense"
                    >
                        <i className="ti ti-edit" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-link p-0"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                        aria-label="Delete expense"
                    >
                        <i className="ti ti-trash" />
                    </button>
                </div>
            ),
            sorter: (a: ExpenseData, b: ExpenseData) => (a.action?.length || 0) - (b.action?.length || 0),
        },
    ]

    const paymentChoose = [
        { value: "Select", label: "Select" },
        { value: "Sr Accountant", label: "Sr Accountant" },
        { value: "Sr App Developer", label: "Sr App Developer" },
        { value: "Sr SEO Analyst", label: "Sr SEO Analyst" },
    ];


    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Expenses</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Sales</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Expenses
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
                                    data-bs-target="#add_expenses"
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Add New Expenses
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
                                        $0.00 - $00
                                    </button>
                                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                $0.00 - $00
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                $3000
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item rounded-1"
                                            >
                                                $2500
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
            {/* Add Promotion */}
            <div className="modal fade" id="add_expenses">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Expenses</h4>
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
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Expenses</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Date</label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Amount</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Payment Method</label>
                                            <CommonSelect
                                                className='select'
                                                options={paymentChoose}
                                                defaultValue={paymentChoose[0]}
                                            />
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
                                    Add Expenses
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Promotion */}
            {/* Add Promotion */}
            <div className="modal fade" id="edit_expenses">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Expenses</h4>
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
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Expenses</label>
                                            <input
                                                type="text"
                                                defaultValue="Online Course"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Date</label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Amount</label>
                                            <input
                                                type="text"
                                                defaultValue="$3000"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Payment Method</label>
                                            <CommonSelect
                                                className='select'
                                                options={paymentChoose}
                                                defaultValue={paymentChoose[1]}
                                            />
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
                                    Save Chnages
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Promotion */}
        </>




    )
}

export default ExpensesComponent
