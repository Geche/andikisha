"use client";
import { budgetsData } from "../../core/data/json/budgetsData";
import CollapseHeader from "../../core/common/collapse-header/collapse-header";
import Table from "../../core/common/dataTable/index";
import PredefinedDateRanges from "../../core/common/datePicker";
import BudgetsModal from "../../core/modals/budgetsModal";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

// Define interfaces
interface Budget {
  BudgetTitle: string;
  BudgetType: string;
  StartDate: string;
  EndDate: string;
  TotalRevenue: string;
  TotalExpense: string;
  TaxAmount: string;
  BudgetAmount: string;
  [key: string]: any; // Remove if not needed
}

interface ColumnType<T> {
  title: string;
  dataIndex: keyof T | string;
  render?: (text: any, record?: T) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
}

const BudgetsComponent = () => {
  const routes = all_routes;
  const data: Budget[] = budgetsData;

  const columns: ColumnType<Budget>[] = [
    {
      title: "Budget Title",
      dataIndex: "BudgetTitle",
      render: (text: string) => (
        <h6 className="fw-medium">
          <Link href="#">{text}</Link>
        </h6>
      ),
      sorter: (a, b) => a.BudgetTitle.length - b.BudgetTitle.length,
    },
    {
      title: "Budget Type",
      dataIndex: "BudgetType",
      sorter: (a, b) => a.BudgetType.length - b.BudgetType.length,
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
      title: "Total Revenue",
      dataIndex: "TotalRevenue",
      sorter: (a, b) => a.TotalRevenue.length - b.TotalRevenue.length,
    },
    {
      title: "Total Expense",
      dataIndex: "TotalExpense",
      sorter: (a, b) => a.TotalExpense.length - b.TotalExpense.length,
    },
    {
      title: "Tax Amount",
      dataIndex: "TaxAmount",
      sorter: (a, b) => a.TaxAmount.length - b.TaxAmount.length,
    },
    {
      title: "Budget Amount",
      dataIndex: "BudgetAmount",
      sorter: (a, b) => a.BudgetAmount.length - b.BudgetAmount.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div>
          <div className="action-icon d-inline-flex">
            <Link
              href="#"
              className="me-2"
              data-bs-toggle="modal" data-inert={true}
              data-bs-target="#edit_budgets"
            >
              <i className="ti ti-edit" />
            </Link>
            <Link
              href="#"
              data-bs-toggle="modal" data-inert={true}
              data-bs-target="#delete_modal"
            >
              <i className="ti ti-trash" />
            </Link>
          </div>
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
              <h2 className="mb-1">Budgets</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Accounting</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Budgets
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
                  data-bs-toggle="modal" data-inert={true}
                  data-bs-target="#add_budgets"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Budget
                </Link>
              </div>
              <div className="ms-2 head-icons">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Budgets list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Budget List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon position-relative">
                    <PredefinedDateRanges />
                  </div>
                </div>
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    $0.00 - $00
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        15000 - 20000
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        20000 - 25000
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        25000 - 30000
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Budget Title
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Office Supplies
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Recruitment
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Tender
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Budget Type
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Category
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Project
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Category
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
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
                        Desending
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
          {/* /Budgets list */}
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

      <BudgetsModal />
    </>
  );
};

export default BudgetsComponent;
