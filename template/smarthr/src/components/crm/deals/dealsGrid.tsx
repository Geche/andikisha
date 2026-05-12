"use client";

import { useEffect, useRef, useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import type { Drake } from "dragula";
import "dragula/dist/dragula.css";
import CrmsModal from "../../../core/modals/crms_modal";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import dragula with SSR disabled
const loadDragula = () => import('dragula').then(mod => mod.default);

const DealsGridComponent = () => {
  const routes = all_routes;
  const container1Ref = useRef<HTMLDivElement>(null);
  const container2Ref = useRef<HTMLDivElement>(null);
  const container3Ref = useRef<HTMLDivElement>(null);
  const container4Ref = useRef<HTMLDivElement>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      loadDragula().then((dragula) => {
        const containers = [
          container1Ref.current,
          container2Ref.current,
          container3Ref.current,
          container4Ref.current,
        ].filter((container): container is HTMLDivElement => container !== null);

        if (containers.length > 0) {
          const drake = dragula(containers);
          return () => drake.destroy();
        }
      });
    }
  }, []);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Deals</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">CRM</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Deals Grid
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    href={routes.dealsList}
                    className="btn btn-icon btn-sm me-1"
                  >
                    <i className="ti ti-list-tree" />
                  </Link>
                  <Link
                    href={routes.dealsGrid}
                    className="btn btn-icon btn-sm active bg-primary text-white"
                  >
                    <i className="ti ti-layout-grid" />
                  </Link>
                </div>
              </div>
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
                  data-bs-target="#add_deals"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Deal
                </button>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Deals Grid */}
          <div className="card">
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between">
                <h5>Deals Grid</h5>
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
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
          </div>
          <div className="d-flex overflow-x-auto align-items-start mb-4">
            <div className="kanban-list-items bg-white">
              <div className="card mb-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="fw-medium d-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-8 text-purple me-2" />
                        New
                      </h4>
                      <span className="fw-normal text-default">
                        03 Deals - $16,90,000
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="action-icon d-inline-flex">
                        <Link href="#">
                          <i className="ti ti-circle-plus" />
                        </Link>
                        <Link
                          href="#"
                          className=""
                          data-bs-toggle="modal"
                          data-bs-target="#edit_deals"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kanban-drag-wrap pt-4" ref={container1Ref}>
                <div>
                  <div className="card kanban-card">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-purple border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">WR</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>
                              Website Redesign
                            </Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $4,50,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          darleeo@gmail.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (163) 2459 315
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          Newyork, United States
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-20.jpg"
                              alt="Sharon Roy Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Sharon Roy
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          85%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 10
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card kanban-card">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-purple border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">CB</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>Cloud Backup</Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $5,00,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          sheron@example.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (146) 1249 296
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          Exeter, United States
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-20.jpg"
                              alt="Darlee Robertson Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Darlee Robertson
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          15%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 12
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card kanban-card mb-0">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-purple border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">EM</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>
                              Email Marketing
                            </Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $7,40,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          vaughan@gmail.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (135) 3489 516
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          Phoenix, United States
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-21.jpg"
                              alt="Vaughan Lewis Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Vaughan Lewis
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          95%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 10
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="kanban-list-items bg-white">
              <div className="card mb-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="fw-medium d-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-8 text-skyblue me-2" />
                        Prospect
                      </h4>
                      <span className="fw-normal text-default">
                        30 Leads - $19,94,938
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="action-icon d-inline-flex">
                        <Link href="#">
                          <i className="ti ti-circle-plus" />
                        </Link>
                        <Link
                          href="#"
                          className=""
                          data-bs-toggle="modal"
                          data-bs-target="#edit_deals"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kanban-drag-wrap pt-4" ref={container2Ref}>
                <div>
                  <div className="card kanban-card">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-skyblue border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">AP</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>
                              App Development
                            </Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $3,15,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          jessica@gmail.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (158) 3459 596
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          Chester, United Kingdom
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-01.jpg"
                              alt="Jessica Louise Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Jessica Louise
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          95%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 10
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card kanban-card">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-skyblue border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">SL</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>SaaS Licensing</Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $6,20,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          rachel@gmail.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (154) 6481 075
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          Bristol, United Kingdom
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-23.jpg"
                              alt="Rachel Hampton Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Rachel Hampton
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          15%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 12
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card kanban-card mb-0">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-skyblue border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">MA</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>
                              Mobile App Design
                            </Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $5,50,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          dawn@gmail.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (163) 6498 256
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          Charlotte, United States
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-22.jpg"
                              alt="Dawn Mercha Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Dawn Mercha
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          65%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 10
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="kanban-list-items bg-white">
              <div className="card mb-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="fw-medium d-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-8 text-warning me-2" />
                        Proposal
                      </h4>
                      <span className="fw-normal text-default">
                        30 Leads - $19,94,938
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="action-icon d-inline-flex">
                        <Link href="#">
                          <i className="ti ti-circle-plus" />
                        </Link>
                        <Link
                          href="#"
                          className=""
                          data-bs-toggle="modal"
                          data-bs-target="#edit_deals"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kanban-drag-wrap pt-4" ref={container3Ref}>
                <div>
                  <div className="card kanban-card">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-warning border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">SS</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>SEO Services</Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $8,40,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          jonelle@gmail.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (184) 6348 195
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          Coventry, United Kingdom
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-24.jpg"
                              alt="Jonelle Curtiss Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Jonelle Curtiss
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          60%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 10
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card kanban-card">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-warning border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">UI</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>UX/UI Design</Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $4,50,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          carol@gmail.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (196) 4862 196
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          Manchester, United Kingdom
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-16.jpg"
                              alt="Carol Thomas Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Carol Thomas
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          15%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 12
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="kanban-list-items bg-white me-0">
              <div className="card mb-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="fw-medium d-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-8 text-success me-2" />
                        Won
                      </h4>
                      <span className="fw-normal text-default">
                        30 Leads - $19,94,938
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="action-icon d-inline-flex">
                        <Link href="#">
                          <i className="ti ti-circle-plus" />
                        </Link>
                        <Link
                          href="#"
                          className=""
                          data-bs-toggle="modal"
                          data-bs-target="#edit_deals"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kanban-drag-wrap pt-4" ref={container4Ref}>
                <div>
                  <div className="card kanban-card">
                    <div className="card-body">
                      <div className="d-block">
                        <div className="border-success border border-2 mb-3" />
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            href={routes.dealsDetails}
                            className="avatar avatar-lg bg-gray flex-shrink-0 me-2"
                          >
                            <span className="avatar-title text-dark">CM</span>
                          </Link>
                          <h6 className="fw-medium">
                            <Link href={routes.dealsDetails}>
                              Cloud Migration
                            </Link>
                          </h6>
                        </div>
                      </div>
                      <div className="mb-3 d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-currency-dollar text-dark me-2" />
                          $2,45,000
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-mail text-dark me-2" />
                          jonathan@gmail.com
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2">
                          <i className="ti ti-phone text-dark me-2" />
                          (163) 2459 315
                        </p>
                        <p className="text-default d-inline-flex align-items-center">
                          <i className="ti ti-map-pin-2 text-dark me-2" />
                          London, United Kingdom
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href="#"
                            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-10.jpg"
                              alt="Jonathan Smith Profile"
                            />
                          </Link>
                          <Link href="#" className="text-dark">
                            Jonathan Smith
                          </Link>
                        </div>
                        <span className="badge badge-sm badge-info-transparent">
                          <i className="ti ti-progress me-1" />
                          85%
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                        <span className="text-dark">
                          <i className="ti ti-calendar-due text-gray-5" /> 10
                          Jan 2024
                        </span>
                        <div className="d-flex  align-items-center">
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-phone-check" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center me-2"
                          >
                            <i className="ti ti-message-circle-2" />
                          </Link>
                          <Link
                            href="#"
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="ti ti-color-swatch" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Deals Grid */}
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
      <CrmsModal />
    </>
  );
};

export default DealsGridComponent;
