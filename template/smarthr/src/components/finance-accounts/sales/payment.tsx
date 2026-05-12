
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Table from "../../../core/common/dataTable/index";
import PredefinedDateRanges from '../../../core/common/datePicker';
import { payment_details } from '../../../core/data/json/payments_details';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import Link from 'next/link';
import { all_routes } from '@/routes/all_routes';

// Define a type for payment data
interface PaymentData {
    Invoice_ID: string;
    Client_Name: string;
    Image: string;
    Roll: string;
    Company_Name: string;
    Payment_Type: string;
    Paid_Date: string;
    Paid_Amount: string;
}

const PaymentsComponent = () => {

    const data: PaymentData[] = payment_details;
    const columns = [
        {
            title: "Invoice ID",
            dataIndex: "Invoice_ID",
            render: (text: string, _record: PaymentData) => (
                <Link href={all_routes.invoicesdetails} className="link-info">{text}</Link>
            ),
            sorter: (a: PaymentData, b: PaymentData) => a.Invoice_ID.length - b.Invoice_ID.length,
        },
        {
            title: "Client Name",
            dataIndex: "Client_Name",
            render: (_text: string, record: PaymentData) => (
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
            sorter: (a: PaymentData, b: PaymentData) => a.Client_Name.length - b.Client_Name.length,
        },
        {
            title: "Company Name",
            dataIndex: "Company_Name",
            sorter: (a: PaymentData, b: PaymentData) => a.Company_Name.length - b.Company_Name.length,
        },
        {
            title: "Payment Type",
            dataIndex: "Payment_Type",
            sorter: (a: PaymentData, b: PaymentData) => a.Payment_Type.length - b.Payment_Type.length,
        },
        {
            title: "Paid Date",
            dataIndex: "Paid_Date",
            sorter: (a: PaymentData, b: PaymentData) => a.Paid_Date.length - b.Paid_Date.length,
        },
        {
            title: "Paid Amount",
            dataIndex: "Paid_Amount",
            sorter: (a: PaymentData, b: PaymentData) => a.Paid_Amount.length - b.Paid_Amount.length,
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
                            <h2 className="mb-1">Payments</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Sales</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Payments
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                            <div className="mb-2">
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
                            <div className="head-icons ms-2">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <h5>Payment List</h5>
                            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                                <div className="me-3">
                                    <div className="input-icon position-relative">
                                        <PredefinedDateRanges />
                                    
                                    </div>
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
                            <Table dataSource={data} columns={columns} Selection={false} />
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
        </>
    )
}

export default PaymentsComponent
