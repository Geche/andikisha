import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import PipelineChart from "@/components/chart/mainMenuCharts/deals-dashboard/pipelineChart";
import DealChart from "@/components/chart/mainMenuCharts/deals-dashboard/dealsChart";
import DealsStageChart from "@/components/chart/mainMenuCharts/deals-dashboard/dealsStageChart";
import CommonFooter from "@/core/common/commonFooter/footer";
import SparkLine from "@/components/chart/mainMenuCharts/deals-dashboard/sparkLineChart";
import PredefinedDatePicker from "../../../core/common/datePicker";

const DealsDashboard = () => {
  const routes = all_routes;

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Deals Dashboard</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Dashboard</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Deals Dashboard
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
                  <PredefinedDatePicker/>
              </div>
              <div className="ms-2 head-icons">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="row">
            <div className="col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5>Pipeline Stages</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="border btn btn-white btn-md d-inline-flex align-items-center"
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
                  <div id="pipeline_chart">
   <PipelineChart />
                  </div>
               
                  <div>
                    <h6 className="mb-3">Leads Values By Stages</h6>
                    <div className="row g-2 justify-content-center">
                      <div className="col-md col-sm-4 col-6">
                        <div className="border rounded text-start p-2">
                          <p className="mb-1">
                            <i className="ti ti-point-filled text-primary" />
                            Marketing
                          </p>
                          <h6>$5,221,45</h6>
                        </div>
                      </div>
                      <div className="col-md col-sm-4 col-6">
                        <div className="border rounded text-start p-2">
                          <p className="mb-1">
                            <i className="ti ti-point-filled text-primary" />
                            Sales
                          </p>
                          <h6>$30,424</h6>
                        </div>
                      </div>
                      <div className="col-md col-sm-4 col-6">
                        <div className="border rounded text-start p-2">
                          <p className="mb-1">
                            <i className="ti ti-point-filled text-primary" />
                            Email
                          </p>
                          <h6>$21,135</h6>
                        </div>
                      </div>
                      <div className="col-md col-sm-4 col-6">
                        <div className="border rounded text-start p-2">
                          <p className="mb-1">
                            <i className="ti ti-point-filled text-primary" />
                            Chat
                          </p>
                          <h6>$15,235</h6>
                        </div>
                      </div>
                      <div className="col-md col-sm-4 col-6">
                        <div className="border rounded text-start p-2">
                          <p className="mb-1">
                            <i className="ti ti-point-filled text-primary" />
                            Operational
                          </p>
                          <h6>$10,557</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 d-flex">
              <div className="row flex-fill">
                <div className="col-sm-6">
                  <div className="card border-white border-2 overlay-bg-3 position-relative">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                        <div>
                          <p className="fw-medium mb-1">Total Deals</p>
                          <h5>$45,221,45</h5>
                        </div>
                        <div className="avatar avatar-md br-10 icon-rotate bg-primary">
                          <span className="d-flex align-items-center">
                            <i className="ti ti-delta text-white fs-16" />
                          </span>
                        </div>
                      </div>
                      <div className="progress progress-xs mb-2">
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: "40%" }}
                        />
                      </div>
                      <p className="fw-medium fs-13">
                        <span className="text-danger fs-12">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          -4.01%{" "}
                        </span>{" "}
                        from last week
                      </p>
                    </div>
                  </div>
                  <div className="card border-white border-2 overlay-bg-3 position-relative">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                        <div>
                          <p className="fw-medium mb-1">Deal Value</p>
                          <h5>$12,545,68</h5>
                        </div>
                        <div className="avatar avatar-md br-10 icon-rotate bg-secondary">
                          <span className="d-flex align-items-center">
                            <i className="ti ti-currency text-white fs-16" />
                          </span>
                        </div>
                      </div>
                      <div className="progress progress-xs mb-2">
                        <div
                          className="progress-bar bg-secondary"
                          role="progressbar"
                          style={{ width: "40%" }}
                        />
                      </div>
                      <p className="fw-medium fs-13">
                        <span className="text-success fs-12">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +20.01%{" "}
                        </span>{" "}
                        from last week
                      </p>
                    </div>
                  </div>
                  <div className="card border-white border-2 overlay-bg-3 position-relative">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                        <div>
                          <p className="fw-medium mb-1">Revenue this month </p>
                          <h5>$46,548,48</h5>
                        </div>
                        <div className="avatar avatar-md br-10 icon-rotate bg-pink">
                          <span className="d-flex align-items-center">
                            <i className="ti ti-stairs-up text-white fs-16" />
                          </span>
                        </div>
                      </div>
                      <div className="progress progress-xs mb-2">
                        <div
                          className="progress-bar bg-pink"
                          role="progressbar"
                          style={{ width: "40%" }}
                        />
                      </div>
                      <p className="fw-medium fs-13">
                        <span className="text-success fs-12">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +55%{" "}
                        </span>{" "}
                        from last week
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card border-white border-2 overlay-bg-3 position-relative">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                        <div>
                          <p className="fw-medium mb-1">Total Customers</p>
                          <h5>9895</h5>
                        </div>
                        <div className="avatar avatar-md br-10 icon-rotate bg-purple">
                          <span className="d-flex align-items-center">
                            <i className="ti ti-users-group text-white fs-16" />
                          </span>
                        </div>
                      </div>
                      <div className="progress progress-xs mb-2">
                        <div
                          className="progress-bar bg-purple"
                          role="progressbar"
                          style={{ width: "40%" }}
                        />
                      </div>
                      <p className="fw-medium fs-13">
                        <span className="text-success fs-12">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          +55%{" "}
                        </span>{" "}
                        from last week
                      </p>
                    </div>
                  </div>
                  <div className="card border-white border-2 overlay-bg-3 position-relative">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                        <div>
                          <p className="fw-medium mb-1">Conversion Rate</p>
                          <h5>51.96%</h5>
                        </div>
                        <div className="avatar avatar-md br-10 icon-rotate bg-info">
                          <span className="d-flex align-items-center">
                            <i className="ti ti-swipe text-white fs-16" />
                          </span>
                        </div>
                      </div>
                      <div className="progress progress-xs mb-2">
                        <div
                          className="progress-bar bg-info"
                          role="progressbar"
                          style={{ width: "40%" }}
                        />
                      </div>
                      <p className="fw-medium fs-13">
                        <span className="text-danger fs-12">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          -6.01%{" "}
                        </span>{" "}
                        from last week
                      </p>
                    </div>
                  </div>
                  <div className="card border-white border-2 overlay-bg-3 position-relative">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                        <div>
                          <p className="fw-medium mb-1">Active Customers </p>
                          <h5>8987</h5>
                        </div>
                        <div className="avatar avatar-md br-10 icon-rotate bg-warning">
                          <span className="d-flex align-items-center">
                            <i className="ti ti-star text-white fs-16" />
                          </span>
                        </div>
                      </div>
                      <div className="progress progress-xs mb-2">
                        <div
                          className="progress-bar bg-warning"
                          role="progressbar"
                          style={{ width: "40%" }}
                        />
                      </div>
                      <p className="fw-medium fs-13">
                        <span className="text-danger fs-12">
                          <i className="ti ti-arrow-wave-right-up me-1" />
                          -3.22%{" "}
                        </span>{" "}
                        from last week
                      </p>
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
                    <h5>Deals by Stage</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="border btn btn-white btn-md d-inline-flex align-items-center"
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
                <div className="card-body pb-0">
                  <div>
                    <div className="d-flex align-items-center">
                      <h3 className="me-2">$20,245</h3>
                      <span className="badge badge-outline-success border border-success bg-success-transparent rounded-pill me-1">
                        <i className="ti ti-arrow-up" />
                        12%
                      </span>
                      <span>vs last years</span>
                    </div>
                    <DealsStageChart />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Deals By Companies</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="border btn btn-white btn-md d-inline-flex align-items-center"
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
                            className="avatar avatar-md rounded-circle bg-gray-100 flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-24.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Pitch</h6>
                            <p className="text-truncate">
                              Closing Deal date 05 April, 2025
                            </p>
                          </div>
                        </div>
                        <div>
                          <h6>$3655</h6>
                        </div>
                      </div>
                    </div>
                    <div className="border border-dashed bg-transparent-light rounded p-2 mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md rounded-circle bg-gray-100 flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-25.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Initech</h6>
                            <p className="text-truncate">
                              Closing Deal date 05 May, 2025
                            </p>
                          </div>
                        </div>
                        <div>
                          <h6>$2185</h6>
                        </div>
                      </div>
                    </div>
                    <div className="border border-dashed bg-transparent-light rounded p-2 mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md rounded-circle bg-gray-100 flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-26.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Umbrella Corp</h6>
                            <p className="text-truncate">
                              Closing Deal date 29 April, 2025
                            </p>
                          </div>
                        </div>
                        <div>
                          <h6>$1583</h6>
                        </div>
                      </div>
                    </div>
                    <div className="border border-dashed bg-transparent-light rounded p-2 mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md rounded-circle bg-gray-100 flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-27.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Capital Partners</h6>
                            <p className="text-truncate">
                              Closing Deal date 23 Mar, 2025
                            </p>
                          </div>
                        </div>
                        <div>
                          <h6>$6584</h6>
                        </div>
                      </div>
                    </div>
                    <div className="border border-dashed bg-transparent-light rounded p-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md rounded-circle bg-gray-100 flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/company/company-28.svg"
                              className="w-auto h-auto"
                              alt="Img"
                            />
                          </Link>
                          <div>
                            <h6 className="fw-medium mb-1">Massive Dynamic</h6>
                            <p className="text-truncate">
                              Closing Deal date 23 Feb, 2025
                            </p>
                          </div>
                        </div>
                        <div>
                          <h6>$2153</h6>
                        </div>
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
                    <h5>Top Deals</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="border btn btn-white btn-md d-inline-flex align-items-center"
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
                  <div className="text-center">
                    <DealChart />
                  </div>
                  <div>
                    <h6 className="mb-3">Status</h6>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="f-13 mb-0">
                        <i className="ti ti-circle-filled text-primary me-1" />
                        Marketing
                      </p>
                      <p className="f-13 fw-medium text-gray-9">$5,69,877</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="f-13 mb-0">
                        <i className="ti ti-circle-filled text-secondary me-1" />
                        Chat
                      </p>
                      <p className="f-13 fw-medium text-gray-9">$4,84,575</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <p className="f-13 mb-0">
                        <i className="ti ti-circle-filled text-warning me-1" />
                        Email
                      </p>
                      <p className="f-13 fw-medium text-gray-9">$1,84,575</p>
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
                    <h5>Deals By Country</h5>
                    <div>
                      <Link
                        href={all_routes.countries}
                        className="btn btn-light btn-md"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body py-2">
                  <div className="table-responsive pt-1">
                    <table className="table table-nowrap table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center mb-2">
                              <Link
                                href={all_routes.countries}
                                className="avatar rounded-circle border border-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/payment-gateway/country-01.svg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium mb-1">
                                  <Link href={all_routes.countries}>USA</Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  Deals : 350
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-center mb-2">
                              <SparkLine
                                data={[10, 50, 9, 46, 31, 60]}
                                fillColor="#D2F5E1"
                                strokeColor="#1CCE6B"
                              />
                            </div>
                          </td>
                          <td className="px-0 text-end">
                            <div className="mb-2">
                              <p className="fs-13 mb-1">Total Value</p>
                              <h6 className="fw-medium">$1065.00</h6>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center mb-2">
                              <Link
                                href={all_routes.countries}
                                className="avatar rounded-circle border border-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/payment-gateway/country-02.svg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium mb-1">
                                  <Link href={all_routes.countries}>UAE</Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  Deals : 221
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-center mb-2">
                              <SparkLine
                                data={[10, 50, 9, 46, 31, 60]}
                                fillColor="#D2F5E1"
                                strokeColor="#1CCE6B"
                              />
                            </div>
                          </td>
                          <td className="px-0 text-end">
                            <div className="mb-2">
                              <p className="fs-13 mb-1">Total Value</p>
                              <h6 className="fw-medium">$966.00</h6>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center mb-2">
                              <Link
                                href={all_routes.countries}
                                className="avatar rounded-circle border border-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/payment-gateway/country-03.svg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium mb-1">
                                  <Link href={all_routes.countries}>
                                    Singapore
                                  </Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  Deals : 236
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-center mb-2">
                              <SparkLine
                                data={[10, 50, 9, 46, 31, 60]}
                                fillColor="#F6CECE"
                                strokeColor="#D00C0C"
                              />
                            </div>
                          </td>
                          <td className="px-0 text-end">
                            <div className="mb-2">
                              <p className="fs-13 mb-1">Total Value</p>
                              <h6 className="fw-medium">$959.00</h6>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center mb-2">
                              <Link
                                href={all_routes.countries}
                                className="avatar rounded-circle border border-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/payment-gateway/country-04.svg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium mb-1">
                                  <Link href={all_routes.countries}>
                                    France
                                  </Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  Deals : 589
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-center mb-2">
                              <SparkLine
                                data={[10, 50, 9, 46, 31, 60]}
                                fillColor="#D2F5E1"
                                strokeColor="#1CCE6B"
                              />
                            </div>
                          </td>
                          <td className="px-0 text-end">
                            <div className="mb-2">
                              <p className="fs-13 mb-1">Total Value</p>
                              <h6 className="fw-medium">$879.00</h6>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center">
                              <Link
                                href={all_routes.countries}
                                className="avatar rounded-circle border border-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/payment-gateway/country-05.svg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium mb-1">
                                  <Link href={all_routes.countries}>
                                    Norway
                                  </Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  Deals : 221
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-center">
                              <SparkLine
                                data={[10, 50, 9, 46, 31, 60]}
                                fillColor="#F6CECE"
                                strokeColor="#D00C0C"
                              />
                            </div>
                          </td>
                          <td className="px-0 text-end">
                            <p className="fs-13 mb-1">Total Value</p>
                            <h6 className="fw-medium">$632.00</h6>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5 className="mb-0">Won Deals Stage</h5>
                    <div className="dropdown">
                      <Link
                        href="#"
                        className="border btn btn-white btn-md d-inline-flex align-items-center"
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
                  <div className="text-center mb-4">
                    <p className="mb-1 fw-medium">Stages Won This Year</p>
                    <div className="d-flex align-items-center justify-content-center">
                      <h3 className="me-2">$45,899,79</h3>
                      <span className="badge badge-soft-danger border-danger border rounded-pill">
                        <i className="ti ti-arrow-narrow-down me-1" /> 12%
                      </span>
                    </div>
                  </div>
                  <div className="stage-chart-main">
                    <div className="deal-stage-chart">
                      <div className="text-center d-flex align-items-center justify-content-center flex-column bg-secondary rounded-circle chart-stage-1">
                        <span className="d-block text-white mb-1">
                          Conversion
                        </span>
                        <h6 className="text-white">48%</h6>
                      </div>
                      <div className="text-center d-flex align-items-center justify-content-center flex-column bg-danger rounded-circle chart-stage-2">
                        <span className="d-block text-white mb-1">Calls</span>
                        <h6 className="text-white">24%</h6>
                      </div>
                      <div className="text-center d-flex align-items-center justify-content-center flex-column bg-warning rounded-circle chart-stage-3">
                        <span className="d-block text-white mb-1">Email</span>
                        <h6 className="text-white">39%</h6>
                      </div>
                      <div className="text-center d-flex align-items-center justify-content-center flex-column bg-success rounded-circle chart-stage-4">
                        <span className="d-block text-white mb-1">Chats</span>
                        <h6 className="text-white">20%</h6>
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
                        className="btn btn-light btn-icon btn-sm d-flex justify-content-center align-items-center border-0 p-2 "
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
                        <i className="ti ti-phone fs-16" />
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
                          src="assets/img/users/user-44.jpg"
                          className="rounded-circle border border-2"
                          alt="img"
                        />
                      </Link>
                      <div className="ms-2">
                        <h6 className="fs-14 fw-medium text-truncate mb-1">
                          <Link href="#">Stephan Peralt</Link>
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
          </div>
          <div className="row">
            <div className="col-xl-8 d-flex">
              <div className="card flex-fill">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                  <h5>Recent Deals</h5>
                  <div className="d-flex align-items-center">
                    <div>
                      <Link
                        href={all_routes.dealsList}
                        className="btn btn-md btn-light"
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
                          <th>Deal Name</th>
                          <th>Stage</th>
                          <th>Deal Value</th>
                          <th>Owner</th>
                          <th>Closed Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <h6 className="fw-medium">
                              <Link href={all_routes.dealsDetails}>
                                Collins
                              </Link>
                            </h6>
                          </td>
                          <td>Quality To Buy</td>
                          <td>$4,50,000</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                href="#"
                                className="avatar avatar-rounded flex-shrink-0 me-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/users/user-32.jpg"
                                  alt="Img"
                                />
                              </Link>
                              <h6 className="fw-medium">
                                <Link href="#">Anthony Lewis</Link>
                              </h6>
                            </div>
                          </td>
                          <td>14 Jan 2024</td>
                        </tr>
                        <tr>
                          <td>
                            <h6 className="fw-medium">
                              <Link href={all_routes.dealsDetails}>
                                Konopelski
                              </Link>
                            </h6>
                          </td>
                          <td>Proposal Made</td>
                          <td>$3,15,000</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                href="#"
                                className="avatar avatar-rounded flex-shrink-0 me-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/users/user-09.jpg"
                                  alt="Img"
                                />
                              </Link>
                              <h6 className="fw-medium">
                                <Link href="#">Brian Villalobos</Link>
                              </h6>
                            </div>
                          </td>
                          <td>21 Jan 2024</td>
                        </tr>
                        <tr>
                          <td>
                            <h6 className="fw-medium">
                              <Link href={all_routes.dealsDetails}>Adams</Link>
                            </h6>
                          </td>
                          <td>Contact Made</td>
                          <td>$8,40,000</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                href="#"
                                className="avatar avatar-rounded flex-shrink-0 me-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/users/user-01.jpg"
                                  alt="Img"
                                />
                              </Link>
                              <h6 className="fw-medium">
                                <Link href="#">Harvey Smith</Link>
                              </h6>
                            </div>
                          </td>
                          <td>20 Feb 2024</td>
                        </tr>
                        <tr>
                          <td>
                            <h6 className="fw-medium">
                              <Link href={all_routes.dealsDetails}>Schumm</Link>
                            </h6>
                          </td>
                          <td>Quality To Buy</td>
                          <td>$6,10,000</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                href="#"
                                className="avatar avatar-rounded flex-shrink-0 me-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/users/user-33.jpg"
                                  alt="Img"
                                />
                              </Link>
                              <h6 className="fw-medium">
                                <Link href="#">Stephan Peralt</Link>
                              </h6>
                            </div>
                          </td>
                          <td>15 Mar 2024</td>
                        </tr>
                        <tr>
                          <td>
                            <h6 className="fw-medium">
                              <Link href={all_routes.dealsDetails}>Wisozk</Link>
                            </h6>
                          </td>
                          <td>Presentation</td>
                          <td>$4,70,000</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                href="#"
                                className="avatar avatar-rounded flex-shrink-0 me-2"
                              >
                                <ImageWithBasePath
                                  src="assets/img/users/user-34.jpg"
                                  alt="Img"
                                />
                              </Link>
                              <h6 className="fw-medium">
                                <Link href="#">Doglas Martini</Link>
                              </h6>
                            </div>
                          </td>
                          <td>12 Apr 2024</td>
                        </tr>
                      </tbody>
                    </table>
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
                        className="btn btn-md btn-light"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body schedule-timeline activity-timeline">
                  <div className="d-flex align-items-start">
                    <div className="avatar avatar-md avatar-rounded bg-success flex-shrink-0">
                      <i className="ti ti-phone-filled fs-16" />
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
                      <i className="ti ti-message-circle-2-filled fs-16" />
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
                      <i className="ti ti-phone-filled fs-16" />
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
                      <i className="ti ti-user-circle fs-16" />
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
          </div>
        </div>
        <CommonFooter />
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default DealsDashboard;
