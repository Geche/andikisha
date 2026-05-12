"use client";

import CollapseHeader from "../../core/common/collapse-header/collapse-header";
import { trainersData } from "../../core/data/json/trainersData";
import Table from "../../core/common/dataTable/index";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import TrainersModal from "../../core/modals/trainersModal";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";

// Define a type-safe interface for trainers
interface Trainer {
  Name: string;
  Image: string;
  Phone: string;
  Email: string;
  Description: string;
  Status: string;
}

const TrainersComponent = () => {
  const routes = all_routes;
  const data: Trainer[] = trainersData;
  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      render: (text: string, record: Trainer) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md border avatar-rounded">
            <ImageWithBasePath
              src={`assets/img/users/${record.Image}`}
              className="img-fluid"
              alt={`${record.Name} avatar`}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href="#">{text}</Link>
            </h6>
          </div>
        </div>
      ),
      sorter: (a: Trainer, b: Trainer) => a.Name.length - b.Name.length,
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      sorter: (a: Trainer, b: Trainer) => a.Phone.length - b.Phone.length,
    },
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a: Trainer, b: Trainer) => a.Email.length - b.Email.length,
    },
    {
      title: "Description",
      dataIndex: "Description",
      sorter: (a: Trainer, b: Trainer) => a.Description.length - b.Description.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: Trainer["Status"]) => (
        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
          <i className="ti ti-point-filled me-1" />
          {text}
        </span>
      ),
      sorter: (a: Trainer, b: Trainer) => a.Status.length - b.Status.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div className="action-icon d-inline-flex">
          <Link href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_trainer">
            <i className="ti ti-edit" />
          </Link>
          <Link href="#" data-bs-toggle="modal" data-bs-target="#delete_modal">
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
              <h2 className="mb-1">Trainers</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Training</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Trainers
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="mb-2">
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#add_trainer"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Trainer
                </Link>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Performance Indicator list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Trainers List</h5>
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
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
                <Table dataSource={data} columns={columns} Selection={true} />
            </div>
          </div>
          {/* /Performance Indicator list */}
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

      <TrainersModal />
    </>
  );
};

export default TrainersComponent;
