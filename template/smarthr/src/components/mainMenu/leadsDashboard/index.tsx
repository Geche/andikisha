"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import CommonFooter from "@/core/common/commonFooter/footer";
import PredefinedDatePicker from "@/core/common/datePicker";
import LeadsStageChart from "@/components/chart/mainMenuCharts/leads-dashboard/leadsStageChart";
import RevenueIncomeChart from "@/components/chart/mainMenuCharts/leads-dashboard/revenueIncomeChart";
import HeatMapChart from "@/components/chart/mainMenuCharts/leads-dashboard/heatMapChart";
import DonutChartTwo from "@/components/chart/mainMenuCharts/leads-dashboard/donutChartTwo";
import DonutChartThree from "@/components/chart/mainMenuCharts/leads-dashboard/donutChartThree";

const LeadsDasboardComponent = () => {
  const routes = all_routes;

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Leads Dashboard</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Dashboard</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Leads Dashboard
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
              <div className="input-icon mb-2 position-relative">
                <PredefinedDatePicker />
              </div>
              <div className="ms-2 mb-2 head-icons">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="row">
            <div className="col-xl-3 col-md-6">
              <div className="card position-relative">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-md br-10 icon-rotate bg-primary flex-shrink-0">
                      <span className="d-flex align-items-center">
                        <i className="ti ti-delta text-white fs-16" />
                      </span>
                    </div>
                    <div className="ms-3">
                      <p className="fw-medium text-truncate mb-1">
                        Total No of Leads
                      </p>
                      <h5>6000</h5>
                    </div>
                  </div>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: "40%" }}
                    />
                  </div>
                  <p className="fw-medium fs-13 mb-0">
                    <span className="text-danger fs-12">
                      <i className="ti ti-arrow-wave-right-up me-1" />
                      -4.01%{" "}
                    </span>{" "}
                    from last week
                  </p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card position-relative">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-md br-10 icon-rotate bg-secondary flex-shrink-0">
                      <span className="d-flex align-items-center">
                        <i className="ti ti-currency text-white fs-16" />
                      </span>
                    </div>
                    <div className="ms-3">
                      <p className="fw-medium text-truncate mb-1">
                        No of New Leads
                      </p>
                      <h5>120</h5>
                    </div>
                  </div>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-secondary"
                      role="progressbar"
                      style={{ width: "40%" }}
                    />
                  </div>
                  <p className="fw-medium fs-13 mb-0">
                    <span className="text-success fs-12">
                      <i className="ti ti-arrow-wave-right-up me-1" />
                      +20.01%{" "}
                    </span>{" "}
                    from last week
                  </p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card position-relative">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-md br-10 icon-rotate bg-danger flex-shrink-0">
                      <span className="d-flex align-items-center">
                        <i className="ti ti-stairs-up text-white fs-16" />
                      </span>
                    </div>
                    <div className="ms-3">
                      <p className="fw-medium text-truncate mb-1">
                        No of Lost Leads
                      </p>
                      <h5>30</h5>
                    </div>
                  </div>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-pink"
                      role="progressbar"
                      style={{ width: "40%" }}
                    />
                  </div>
                  <p className="fw-medium fs-13 mb-0">
                    <span className="text-success fs-12">
                      <i className="ti ti-arrow-wave-right-up me-1" />
                      +55%{" "}
                    </span>{" "}
                    from last week
                  </p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card position-relative">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-md br-10 icon-rotate bg-purple flex-shrink-0">
                      <span className="d-flex align-items-center">
                        <i className="ti ti-users-group text-white fs-16" />
                      </span>
                    </div>
                    <div className="ms-3">
                      <p className="fw-medium text-truncate mb-1">
                        No of Total Customers
                      </p>
                      <h5>9895</h5>
                    </div>
                  </div>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-purple"
                      role="progressbar"
                      style={{ width: "40%" }}
                    />
                  </div>
                  <p className="fw-medium fs-13 mb-0">
                    <span className="text-success fs-12">
                      <i className="ti ti-arrow-wave-right-up me-1" />
                      +55%{" "}
                    </span>{" "}
                    from last week
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-8 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Pipeline Stages</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="btn btn-white border btn-md d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1 fs-14" />
                        2023 - 2024
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            2023 - 2024
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            2022 - 2023
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            2021 - 2023
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body pb-0">
                  <div className="row g-2 justify-content-center mb-3">
                    <div className="col-md col-sm-4 col-6">
                      <div className="border rounded p-2">
                        <p className="mb-1 d-flex align-items-center gap-1">
                          <i className="ti ti-square-rounded-filled text-primary fs-13" />
                          Contacted
                        </p>
                        <h6>50000</h6>
                      </div>
                    </div>
                    <div className="col-md col-sm-4 col-6">
                      <div className="border rounded p-2">
                        <p className="mb-1 d-flex align-items-center gap-1">
                          <i className="ti ti-square-rounded-filled text-secondary fs-13" />
                          Oppurtunity
                        </p>
                        <h6>25985</h6>
                      </div>
                    </div>
                    <div className="col-md col-sm-4 col-6">
                      <div className="border rounded p-2">
                        <p className="mb-1 d-flex align-items-center gap-1">
                          <i className="ti ti-square-rounded-filled text-info fs-13" />
                          Not Contacted
                        </p>
                        <h6>12566</h6>
                      </div>
                    </div>
                  </div>
                  <div id="revenue-income">
                    <RevenueIncomeChart />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>New Leads</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="btn btn-white border btn-md d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1 fs-14" />
                        This Week
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            This Week
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            This Month
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            This Year
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body pb-0">
                  <div id="heat_chart">
                    <HeatMapChart />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Lost Leads </h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="btn btn-white border-0 dropdown-toggle dropdown-sm btn-sm d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Sales Pipeline
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                      <li>
                        <Link href="#" className="dropdown-item rounded-1">Marketing Pipeline</Link>
                      </li>
                      <li>
                        <Link href="#" className="dropdown-item rounded-1">Sales Pipeline</Link>
                      </li>
                      <li>
                        <Link href="#" className="dropdown-item rounded-1">Support Pipeline</Link>
                      </li>
                    </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div>
                    <div id="leads_stage">
                      <LeadsStageChart />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Leads By Companies</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="btn btn-white border btn-md d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1 fs-14" />
                        This Week
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            This Month
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            This Week
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            Last Week
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div>
                    <div className="border border-dashed bg-transparent-light rounded p-2 mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar rounded-circle bg-white border flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-24.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Pitch</h6>
                            <p className="text-truncate">Value : $45,985</p>
                          </div>
                        </div>
                        <span className="badge badge-purple d-inline-flex align-items-center">
                          <i className="ti ti-point-filled me-1" /> Not
                          Contacted
                        </span>
                      </div>
                    </div>
                    <div className="border border-dashed bg-transparent-light rounded p-2 mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar rounded-circle bg-white border flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-25.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Initech</h6>
                            <p className="text-truncate">Value : $21,145</p>
                          </div>
                        </div>
                        <span className="badge badge-success d-inline-flex align-items-center">
                          <i className="ti ti-point-filled me-1" />
                          Closed
                        </span>
                      </div>
                    </div>
                    <div className="border border-dashed bg-transparent-light rounded p-2 mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar rounded-circle bg-white border flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-26.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Umbrella Corp</h6>
                            <p className="text-truncate">Value : $15,685</p>
                          </div>
                        </div>
                        <span className="badge badge-secondary d-inline-flex align-items-center">
                          <i className="ti ti-point-filled me-1" />
                          Contacted
                        </span>
                      </div>
                    </div>
                    <div className="border border-dashed bg-transparent-light rounded p-2 mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar rounded-circle bg-white border flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-27.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Capital Partners</h6>
                            <p className="text-truncate">Value : $12,105</p>
                          </div>
                        </div>
                        <span className="badge badge-secondary d-inline-flex align-items-center">
                          <i className="ti ti-point-filled me-1" />
                          Contacted
                        </span>
                      </div>
                    </div>
                    <div className="border border-dashed bg-transparent-light rounded p-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar rounded-circle bg-white border flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-28.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Massive Dynamic</h6>
                            <p className="text-truncate">Value : $2,546</p>
                          </div>
                        </div>
                        <span className="badge badge-danger d-inline-flex align-items-center">
                          <i className="ti ti-point-filled me-1" />
                          Lost
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Leads by Source</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="btn btn-white border btn-md d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1 fs-14" />
                        This Week
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            This Month
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            This Week
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            Last Week
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div id="donut-chart-2">
                    <DonutChartTwo />
                  </div>
                  <div>
                    <h6 className="mb-3">Status</h6>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="f-13 mb-0">
                        <i className="ti ti-circle-filled text-secondary me-1" />
                        Google
                      </p>
                      <p className="f-13 fw-medium text-gray-9">40%</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="f-13 mb-0">
                        <i className="ti ti-circle-filled text-warning me-1" />
                        Paid
                      </p>
                      <p className="f-13 fw-medium text-gray-9">35%</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="f-13 mb-0">
                        <i className="ti ti-circle-filled text-pink me-1" />
                        Campaigns
                      </p>
                      <p className="f-13 fw-medium text-gray-9">15%</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <p className="f-13 mb-0">
                        <i className="ti ti-circle-filled text-purple me-1" />
                        Referals
                      </p>
                      <p className="f-13 fw-medium text-gray-9">10%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Recent Follow Up</h5>
                    <div>
                      <Link href="#" className="btn btn-light btn-md">
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <Link href="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/users/user-27.jpg"
                          className="rounded-circle border border-2"
                          alt="img"
                        />
                      </Link>
                      <div className="ms-2">
                        <h6 className="fs-14 fw-medium text-truncate mb-1">
                          <Link href="#">Alexander Jermai</Link>
                        </h6>
                        <p className="fs-13">UI/UX Designer</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Link
                        href="#"
                        className="btn btn-light btn-icon btn-sm d-flex justify-content-center align-items-center border-0 p-2"
                      >
                        <i className="ti ti-mail-bolt fs-16" />
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <Link href="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/users/user-42.jpg"
                          className="rounded-circle border border-2"
                          alt="img"
                        />
                      </Link>
                      <div className="ms-2">
                        <h6 className="fs-14 fw-medium text-truncate mb-1">
                          <Link href="#">Doglas Martini</Link>
                        </h6>
                        <p className="fs-13">Product Designer</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Link
                        href="#"
                        className="btn btn-light btn-icon btn-sm d-flex justify-content-center align-items-center border-0 p-2"
                      >
                        <i className="ti ti-phone-x fs-16" />
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <Link href="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/users/user-43.jpg"
                          className="rounded-circle border border-2"
                          alt="img"
                        />
                      </Link>
                      <div className="ms-2">
                        <h6 className="fs-14 fw-medium text-truncate mb-1">
                          <Link href="#">Daniel Esbella</Link>
                        </h6>
                        <p className="fs-13">Project Manager</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Link
                        href="#"
                        className="btn btn-light btn-icon btn-sm d-flex justify-content-center align-items-center border-0 p-2"
                      >
                        <i className="ti ti-mail-bolt fs-16" />
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <Link href="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/users/user-11.jpg"
                          className="rounded-circle border border-2"
                          alt="img"
                        />
                      </Link>
                      <div className="ms-2">
                        <h6 className="fs-14 fw-medium text-truncate mb-1">
                          <Link href="#">Daniel Esbella</Link>
                        </h6>
                        <p className="fs-13">Team Lead</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Link
                        href="#"
                        className="btn btn-light btn-icon btn-sm d-flex justify-content-center align-items-center border-0 p-2"
                      >
                        <i className="ti ti-brand-hipchat fs-16" />
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <Link href="#" className="avatar flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/users/user-45.jpg"
                          className="rounded-circle border border-2"
                          alt="img"
                        />
                      </Link>
                      <div className="ms-2">
                        <h6 className="fs-14 fw-medium text-truncate mb-1">
                          <Link href="#">Doglas Martini</Link>
                        </h6>
                        <p className="fs-13">Team Lead</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Link
                        href="#"
                        className="btn btn-light btn-icon btn-sm d-flex justify-content-center align-items-center border-0 p-2"
                      >
                        <i className="ti ti-brand-hipchat fs-16" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Recent Activities</h5>
                    <div>
                      <Link
                        href={all_routes.activity}
                        className="btn btn-light btn-md"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body schedule-timeline activity-timeline">
                  <div className="d-flex align-items-start">
                    <div className="avatar avatar-md avatar-rounded bg-success flex-shrink-0">
                      <i className="ti ti-phone fs-20" />
                    </div>
                    <div className="flex-fill ps-3 pb-4 timeline-flow">
                      <p className="fw-medium text-gray-9 mb-1">
                        <Link href={all_routes.activity}>
                          Drain responded to your appointment schedule question.
                        </Link>
                      </p>
                      <span>09:25 PM</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div className="avatar avatar-md avatar-rounded bg-info flex-shrink-0">
                      <i className="ti ti-message-circle-2 fs-20" />
                    </div>
                    <div className="flex-fill ps-3 pb-4 timeline-flow">
                      <p className="fw-medium text-gray-9 mb-1">
                        <Link href={all_routes.activity}>
                          You sent 1 Message to the James.
                        </Link>
                      </p>
                      <span>10:25 PM</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div className="avatar avatar-md avatar-rounded bg-success flex-shrink-0">
                      <i className="ti ti-phone fs-20" />
                    </div>
                    <div className="flex-fill ps-3 pb-4 timeline-flow">
                      <p className="fw-medium text-gray-9 mb-1">
                        <Link href={all_routes.activity}>
                          Denwar responded to your appointment on 25 Jan 2025,
                          08:15 PM
                        </Link>
                      </p>
                      <span>09:25 PM</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div className="avatar avatar-md avatar-rounded bg-purple flex-shrink-0">
                      <i className="ti ti-user-circle fs-20" />
                    </div>
                    <div className="flex-fill ps-3 timeline-flow">
                      <p className="fw-medium text-gray-9 mb-1">
                        <Link
                          href={all_routes.activity}
                          className="d-flex align-items-center"
                        >
                          Meeting With{" "}
                          <ImageWithBasePath
                            src="assets/img/users/user-58.jpg"
                            className="avatar avatar-sm rounded-circle mx-2"
                            alt="Img"
                          />
                          Abraham
                        </Link>
                      </p>
                      <span>09:25 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h5>Notifications</h5>
                    <div>
                      <Link href="#" className="btn btn-light btn-md">
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-start mb-4">
                    <Link href="#" className="avatar flex-shrink-0">
                      <ImageWithBasePath
                        src="assets/img/users/user-27.jpg"
                        className="rounded-circle border border-2"
                        alt="img"
                      />
                    </Link>
                    <div className="ms-2">
                      <h6 className="fs-14 fw-medium text-truncate mb-1">
                        Lex Murphy requested access to UNIX{" "}
                      </h6>
                      <p className="fs-13 mb-2">Today at 9:42 AM</p>
                      <div className="d-flex align-items-center">
                        <Link
                          href="#"
                          className="avatar avatar-sm border flex-shrink-0 me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/social/pdf-icon.svg"
                            className="w-auto h-auto"
                            alt="Img"
                          />
                        </Link>
                        <h6 className="fw-normal">
                          <Link href="#">EY_review.pdf</Link>
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-start mb-4">
                    <Link href="#" className="avatar flex-shrink-0">
                      <ImageWithBasePath
                        src="assets/img/users/user-28.jpg"
                        className="rounded-circle border border-2"
                        alt="img"
                      />
                    </Link>
                    <div className="ms-2">
                      <h6 className="fs-14 fw-medium text-truncate mb-1">
                        Lex Murphy requested access to UNIX{" "}
                      </h6>
                      <p className="fs-13 mb-0">Today at 10:00 AM</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start mb-4">
                    <Link href="#" className="avatar flex-shrink-0">
                      <ImageWithBasePath
                        src="assets/img/users/user-29.jpg"
                        className="rounded-circle border border-2"
                        alt="img"
                      />
                    </Link>
                    <div className="ms-2">
                      <h6 className="fs-14 fw-medium text-truncate mb-1">
                        Lex Murphy requested access to UNIX{" "}
                      </h6>
                      <p className="fs-13 mb-2">Today at 10:50 AM</p>
                      <div className="d-flex align-items-center">
                        <Link href="#" className="btn btn-primary btn-sm me-2">
                          Approve
                        </Link>
                        <Link
                          href="#"
                          className="btn btn-outline-primary btn-sm"
                        >
                          Decline
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <Link href="#" className="avatar flex-shrink-0">
                      <ImageWithBasePath
                        src="assets/img/users/user-33.jpg"
                        className="rounded-circle border border-2"
                        alt="img"
                      />
                    </Link>
                    <div className="ms-2">
                      <h6 className="fs-14 fw-medium text-truncate mb-1">
                        Lex Murphy requested access to UNIX{" "}
                      </h6>
                      <p className="fs-13 mb-0">Today at 05:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-5 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Top Countries</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="btn btn-white border-0 dropdown-toggle dropdown-sm btn-sm d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Referrals
                      </Link>
                      <ul className="dropdown-menu dropdown-menu-end p-3">
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            Referrals
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="dropdown-item rounded-1">
                            Sales Pipeline
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-xxl-5 col-sm-6">
                      <div className="pe-3 border-end">
                        <div className="d-flex align-items-center mb-4">
                          <span className="me-2">
                            <i className="ti ti-point-filled text-primary fs-16" />
                          </span>
                          <Link
                            href={all_routes.countries}
                            className="avatar rounded-circle flex-shrink-0 border border-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/payment-gateway/country-03.svg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fw-medium text-truncate mb-1">
                              <Link href={all_routes.countries}>Singapore</Link>
                            </h6>
                            <span className="fs-13 text-truncate">
                              Leads : 236
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-4">
                          <span className="me-2">
                            <i className="ti ti-point-filled text-secondary fs-16" />
                          </span>
                          <Link
                            href={all_routes.countries}
                            className="avatar rounded-circle flex-shrink-0 border border-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/payment-gateway/country-04.svg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fw-medium text-truncate mb-1">
                              <Link href={all_routes.countries}>France</Link>
                            </h6>
                            <span className="fs-13 text-truncate">
                              Leads : 589
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-4">
                          <span className="me-2">
                            <i className="ti ti-point-filled text-info fs-16" />
                          </span>
                          <Link
                            href={all_routes.countries}
                            className="avatar rounded-circle flex-shrink-0 border border-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/payment-gateway/country-05.svg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fw-medium text-truncate mb-1">
                              <Link href={all_routes.countries}>Norway</Link>
                            </h6>
                            <span className="fs-13 text-truncate">
                              Leads : 221
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-4">
                          <span className="me-2">
                            <i className="ti ti-point-filled text-danger fs-16" />
                          </span>
                          <Link
                            href={all_routes.countries}
                            className="avatar rounded-circle flex-shrink-0 border border-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/payment-gateway/country-01.svg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fw-medium text-truncate mb-1">
                              <Link href={all_routes.countries}>USA</Link>
                            </h6>
                            <span className="fs-13 text-truncate">
                              Leads : 350
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="me-2">
                            <i className="ti ti-point-filled text-warning fs-16" />
                          </span>
                          <Link
                            href={all_routes.countries}
                            className="avatar rounded-circle flex-shrink-0 border border-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/payment-gateway/country-02.svg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fw-medium text-truncate mb-1">
                              <Link href={all_routes.countries}>UAE</Link>
                            </h6>
                            <span className="fs-13 text-truncate">
                              Leads : 221
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xxl-7 col-sm-6">
                      <div id="donut-chart-3">
                        <DonutChartThree />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-7 d-flex">
              <div className="card flex-fill">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                  <h5>Recent Leads</h5>
                  <div className="d-flex align-items-center">
                    <div>
                      <Link
                        href={all_routes.leadsGrid}
                        className="btn btn-light btn-md"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-nowrap dashboard-table mb-0">
                      <thead>
                        <tr>
                          <th>Company Name</th>
                          <th>Stage</th>
                          <th>Created Date</th>
                          <th>Lead Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center file-name-icon">
                              <Link
                                href={all_routes.companiesDetails}
                                className="avatar border rounded-circle"
                              >
                                <ImageWithBasePath
                                  src="assets/img/company/company-01.svg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link href={all_routes.companiesDetails}>
                                    BrightWave
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-secondary d-inline-flex align-items-center">
                              <i className="ti ti-point-filled me-1" />
                              Contacted
                            </span>
                          </td>
                          <td>14 Jan 2024</td>
                          <td>William Parsons</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center file-name-icon">
                              <Link
                                href={all_routes.companiesDetails}
                                className="avatar border rounded-circle"
                              >
                                <ImageWithBasePath
                                  src="assets/img/company/company-02.svg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link href={all_routes.companiesDetails}>
                                    Stellar
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-success d-inline-flex align-items-center">
                              <i className="ti ti-point-filled me-1" />
                              Closed
                            </span>
                          </td>
                          <td>21 Jan 2024</td>
                          <td>Lucille Tomberlin</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center file-name-icon">
                              <Link
                                href={all_routes.companiesDetails}
                                className="avatar border rounded-circle"
                              >
                                <ImageWithBasePath
                                  src="assets/img/company/company-03.svg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link href={all_routes.companiesDetails}>
                                    Quantum
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-danger d-inline-flex align-items-center">
                              <i className="ti ti-point-filled me-1" />
                              Lost
                            </span>
                          </td>
                          <td>20 Feb 2024</td>
                          <td>Frederick Johnson</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center file-name-icon">
                              <Link
                                href={all_routes.companiesDetails}
                                className="avatar border rounded-circle"
                              >
                                <ImageWithBasePath
                                  src="assets/img/company/company-04.svg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link href={all_routes.companiesDetails}>
                                    EcoVision
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-purple d-inline-flex align-items-center">
                              <i className="ti ti-point-filled me-1" />
                              Not Contacted
                            </span>
                          </td>
                          <td>15 Mar 2024</td>
                          <td>Sarah Henry</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center file-name-icon">
                              <Link
                                href={all_routes.companiesDetails}
                                className="avatar border rounded-circle"
                              >
                                <ImageWithBasePath
                                  src="assets/img/company/company-05.svg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link href={all_routes.companiesDetails}>
                                    Aurora
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-success d-inline-flex align-items-center">
                              <i className="ti ti-point-filled me-1" />
                              Closed
                            </span>
                          </td>
                          <td>12 Apr 2024</td>
                          <td>Thomas Miller</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default LeadsDasboardComponent;
