"use client";
import { all_routes } from "@/routes/all_routes";

import CollapseHeader from "../../core/common/collapse-header/collapse-header";
import Table from "../../core/common/dataTable/index";
import { HolidaysData } from "../../core/data/json/holidaysData";
import HolidaysModal from "../../core/modals/holidaysModal";
import Link from "next/link";

// Define an interface for holiday data
interface Holiday {
  Title: string;
  Date: string;
  Description: string;
  Status: string;
}

const HolidaysComponent = () => {
    const routes = all_routes;
    const data: Holiday[] = HolidaysData;
    const columns = [
        {
          title: "Title",
          dataIndex: "Title",
          render: (text: string) => (
            <h6 className="fw-medium">
                <Link href="#">{text}</Link>
            </h6>
          ),
          sorter: (a: Holiday, b: Holiday) => a.Title.length - b.Title.length,
        },
        {
            title: "Date",
            dataIndex: "Date",
            sorter: (a: Holiday, b: Holiday) => a.Date.length - b.Date.length,
        },
        {
            title: "Description",
            dataIndex: "Description",
            sorter: (a: Holiday, b: Holiday) => a.Description.length - b.Description.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: string) => (
                <span className="badge badge-success d-inline-flex align-items-center badge-sm">
                    <i className="ti ti-point-filled me-1" />
                    {text}
                </span>
              ),
            sorter: (a: Holiday, b: Holiday) => a.Status.length - b.Status.length,
        },
        {
            title: "",
            dataIndex: "actions",
            render: () => (
                <div className="action-icon d-inline-flex">
                    <Link
                        href="#"
                        className="me-2"
                        data-bs-toggle="modal" data-inert={true}
                        data-bs-target="#edit_holiday"
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
              <h2 className="mb-1">Holidays</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">HRM</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Holidays
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="mb-2">
                <Link
                  href="#"
                  data-bs-toggle="modal" data-inert={true}
                  data-bs-target="#add_holiday"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Holiday
                </Link>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Holidays List</h5>
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

      <HolidaysModal />
    </>
  );
};

export default HolidaysComponent;
