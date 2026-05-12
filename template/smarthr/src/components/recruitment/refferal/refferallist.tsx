"use client";

import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Table from "../../../core/common/dataTable/index";
import { refferallistDetails } from './refferallistDetails';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import Link from 'next/link';
import { all_routes } from '@/routes/all_routes';

// Define Referral interface for type safety
interface Referral {
  Refferals_ID: string;
  Referrer_Name: string;
  Refferals_Image: string;
  Roll: string;
  Job_Reffered: string;
  Job_Image: string;
  Referee_Name: string;
  Refferee_Image: string;
  Email: string;
  Refferals_Bonus: string;
}

const RefferalListComponent = () => {

  const data: Referral[] = refferallistDetails;
  const columns = [
    {
      title: "Refferals ID",
      dataIndex: "Refferals_ID",
      sorter: (a: Referral, b: Referral) => a.Refferals_ID.length - b.Refferals_ID.length,
    },
    {
      title: "Referrer Name",
      dataIndex: "Referrer_Name",
      render: (_text: string, record: Referral) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md ">
            <ImageWithBasePath
              src={`assets/img/users/${record.Refferals_Image}`}
              className="img-fluid rounded-circle"
              alt={record.Referrer_Name}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href="#">{record.Referrer_Name}</Link>
            </h6>
            <span className="d-block mt-1">{record.Roll}</span>
          </div>
        </div>
      ),
      sorter: (a: Referral, b: Referral) => a.Referrer_Name.length - b.Referrer_Name.length,
    },
    {
      title: "Job Reffered",
      dataIndex: "Job_Reffered",
      render: (_text: string, record: Referral) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md bg-light rounded">
            <ImageWithBasePath
              src={`assets/img/icons/${record.Job_Image}`}
              className="img-fluid rounded-circle"
              alt={record.Job_Reffered}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href="#">{record.Job_Reffered}</Link>
            </h6>
          </div>
        </div>
      ),
      sorter: (a: Referral, b: Referral) => a.Job_Reffered.length - b.Job_Reffered.length,
    },
    {
      title: "Referre Name",
      dataIndex: "Referee_Name",
      render: (_text: string, record: Referral) => (
        <div className="d-flex align-items-center file-name-icon">
          <Link href="#" className="avatar avatar-md ">
            <ImageWithBasePath
              src={`assets/img/users/${record.Refferee_Image}`}
              className="img-fluid rounded-circle"
              alt={record.Referee_Name}
            />
          </Link>
          <div className="ms-2">
            <h6 className="fw-medium">
              <Link href="#">{record.Referee_Name}</Link>
            </h6>
            <span className="d-block mt-1">{record.Email}</span>
          </div>
        </div>
      ),
      sorter: (a: Referral, b: Referral) => a.Referee_Name.length - b.Referee_Name.length,
    },
    {
      title: "Refferals Bonus",
      dataIndex: "Refferals_Bonus",
      sorter: (a: Referral, b: Referral) => a.Refferals_Bonus.length - b.Refferals_Bonus.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: () => (
        <div className="action-icon d-inline-flex">
          <Link href="#" className="me-2">
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
              <h2 className="mb-1">Refferals</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Recruitment</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Refferals
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="mb-2">
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
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Refferals List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-3">
                  <Link
                    href="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Role
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Senior IOS Developer
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Junior PHP Developer
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="dropdown-item rounded-1"
                      >
                        Network Engineer
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
  );
};

export default RefferalListComponent;
