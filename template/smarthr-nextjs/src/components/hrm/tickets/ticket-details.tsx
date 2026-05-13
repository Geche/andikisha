"use client";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import CommonSelect from "@/core/common/commonSelect";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import TicketListModal from "@/core/modals/ticketListModal";

import { all_routes } from "@/routes/all_routes";
import Link from "next/link";



const TicketDetailsComponent = () => {
    const routes = all_routes;
    const changePriority = [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
    ];
    const assignTo = [
        { value: "Edgar Hansel", label: "Edgar Hansel" },
        { value: "Juan Hermann", label: "Juan Hermann" },
    ];
    const ticketStatus = [
        { value: "Open", label: "Open" },
        { value: "On Hold", label: "On Hold" },
        { value: "Reopened", label: "Reopened" },
    ];
  return (
    <>
    {/* Page Wrapper */}
    <div className="page-wrapper">
        <div className="content">
<>
    {/* Breadcrumb */}
    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
    <div className="my-auto mb-2">
      <h2 className="mb-1">Tickets</h2>
      <nav>
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <a href="index.html">
              <i className="ti ti-smart-home" />
            </a>
          </li>
          <li className="breadcrumb-item">Tickets</li>
          <li className="breadcrumb-item active" aria-current="page">
            Ticket details
          </li>
        </ol>
      </nav>
    </div>
    <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
      <div className="me-2 mb-2">
        <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
          <a
            href="tickets.html"
            className="btn btn-icon btn-sm active bg-primary text-white me-1"
          >
            <i className="ti ti-list-tree" />
          </a>
          <a href="tickets-grid.html" className="btn btn-icon btn-sm">
            <i className="ti ti-layout-grid" />
          </a>
        </div>
      </div>
      <div className="me-2 mb-2">
        <div className="dropdown">
          <a
            href="javascript:void(0);"
            className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            <i className="ti ti-file-export me-1" />
            Export
          </a>
          <ul className="dropdown-menu  dropdown-menu-end p-3">
            <li>
              <a href="javascript:void(0);" className="dropdown-item rounded-1">
                <i className="ti ti-file-type-pdf me-1" />
                Export as PDF
              </a>
            </li>
            <li>
              <a href="javascript:void(0);" className="dropdown-item rounded-1">
                <i className="ti ti-file-type-xls me-1" />
                Export as Excel{" "}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mb-2">
        <a
          href="#"
          data-bs-toggle="modal"
          data-bs-target="#add_ticket"
          className="btn btn-primary d-flex align-items-center"
        >
          <i className="ti ti-circle-plus me-2" />
          Add Ticket
        </a>
      </div>
      <div className="head-icons ms-2">
        <a
          href="javascript:void(0);"
          className=""
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          data-bs-original-title="Collapse"
          id="collapse-header"
        >
          <i className="ti ti-chevrons-up" />
        </a>
      </div>
    </div>
    </div>
    {/* /Breadcrumb */}
    </>

        <div className="row">
            <div className="col-xl-9 col-md-8">
            <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <h5 className="text-info fw-medium">IT Support</h5>
                <div className="d-flex align-items-center">
                    <span className="badge bg-danger me-3">
                    <i className="ti ti-circle-filled fs-5 me-1" />
                    High
                    </span>
                    <div className="dropdown">
                    <Link
                        href="#"
                        className="dropdown-toggle px-2 py-1 btn btn-white d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                    >
                        Mark as Private
                    </Link>
                    <ul className="dropdown-menu  dropdown-menu-end p-2">
                        <li>
                        <Link
                            href="#"
                            className="dropdown-item rounded-1"
                        >
                            Mark as Private
                        </Link>
                        </li>
                        <li>
                        <Link
                            href="#"
                            className="dropdown-item rounded-1"
                        >
                            Mark as Public{" "}
                        </Link>
                        </li>
                    </ul>
                    </div>
                </div>
                </div>
                <div className="card-body">
                <div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap border-bottom mb-3">
                    <div className="d-flex align-items-center flex-wrap">
                        <div className="mb-3">
                        <span className="badge badge-info rounded-pill mb-2">
                            Tic - 001
                        </span>
                        <div className="d-flex align-items-center mb-2">
                            <h5 className="fw-semibold me-2">Laptop Issue</h5>
                            <span className="badge bg-outline-pink d-flex align-items-center ms-1">
                            <i className="ti ti-circle-filled fs-5 me-1" />
                            Open
                            </span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                            <p className="d-flex align-items-center mb-0 me-2">
                            <ImageWithBasePath
                                src="assets/img/profiles/avatar-06.jpg"
                                className="avatar avatar-xs rounded-circle me-2"
                                alt="Juan Hermann avatar"
                            />{" "}
                            Assigned to{" "}
                            <span className="text-dark ms-1">
                                Juan Hermann
                            </span>
                            </p>
                            <p className="d-flex align-items-center mb-0 me-2">
                            <i className="ti ti-calendar-bolt me-1" />
                            Updated 20 hours ago
                            </p>
                            <p className="d-flex align-items-center mb-0">
                            <i className="ti ti-message-circle-share me-1" />
                            9 Comments
                            </p>
                        </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <Link href="#" className="btn btn-primary">
                        <i className="ti ti-arrow-forward-up me-1" />
                        Post a Reply
                        </Link>
                    </div>
                    </div>
                    <div className="border-bottom mb-3 pb-3">
                    <div>
                        <p className="mb-3">
                        For the past week, my laptop has been experiencing
                        intermittent freezing issues. The freezes occur
                        randomly, approximately 3-4 times a day, and last
                        about 30-60 seconds each time. During these freezes,
                        the cursor becomes unresponsive, and I am unable to
                        click on anything or use keyboard shortcuts. The
                        issue usually resolves itself, but it significantly
                        disrupts my work.
                        </p>
                        <ul className="list-styled-dotted border-bottom pb-3">
                        <li className="ms-4 mb-3">
                            I first noticed the problem on February 1, 2024,
                            while using Google Meet for a video conference.
                            Since then, the issue has occurred during various
                            tasks, including browsing with Chrome, using
                            Microsoft Office applications, and even when the
                            laptop is idle.
                        </li>
                        <li className="ms-4">
                            Error messages: No specific error messages have
                            appeared, but the Task Manager (when accessible)
                            shows a spike in CPU usage to 100% during these
                            freezes.
                        </li>
                        </ul>
                    </div>
                    <div className="mt-4">
                        <div className="d-flex align-items-center mb-3">
                        <span className="avatar avatar-lg avatar-rounded me-2 flex-shrink-0">
                            <ImageWithBasePath
                            src="assets/img/users/user-09.jpg"
                            alt="Img"
                            />
                        </span>
                        <div>
                            <h6 className="fw-medium mb-1">
                            James Hendriques
                            </h6>
                            <p>
                            <i className="ti ti-calendar-bolt me-1" />
                            Updated 5 hours ago
                            </p>
                        </div>
                        </div>
                        <div>
                        <div className="mb-3">
                            <p>
                            This issue disrupts meetings, delays task
                            completion, and affects my overall productivity.
                            </p>
                        </div>
                        <span className="badge bg-light fw-normal">
                            Screenshot.png
                            <i className="ti ti-download ms-1" />
                        </span>
                        <div className="d-flex align-items-center mt-3">
                            <Link
                            href="#"
                            className="d-inline-flex align-items-center text-primary fw-medium me-3"
                            >
                            <i className="ti ti-arrow-forward-up me-1" />
                            Reply
                            </Link>
                            <p>
                            <Link
                                href="#"
                                className="d-flex align-items-center"
                            >
                                <i className="ti ti-message-circle-share me-1" />
                                1 Comments
                            </Link>
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="border-bottom mb-3 pb-3">
                    <div>
                        <div className="d-flex align-items-center mb-3">
                        <span className="avatar avatar-ld avatar-rounded me-2 flex-shrink-0">
                            <ImageWithBasePath
                            src="assets/img/users/user-02.jpg"
                            alt="Img"
                            />
                        </span>
                        <div>
                            <h6 className="mb-1">Marilyn Siegle</h6>
                            <p>
                            <i className="ti ti-calendar-bolt me-1" />
                            Updated 6 hours ago
                            </p>
                        </div>
                        </div>
                        <div>
                        <div className="mb-3">
                            <p>
                            Check the System and Application logs in the
                            Event Viewer for warnings or errors that
                            coincide with the times the freezes occur.
                            </p>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="badge bg-light fw-normal me-2">
                            Screenshot.png
                            <i className="ti ti-download ms-1" />
                            </span>
                            <span className="badge bg-light fw-normal me-2">
                            Screenshot.png
                            <i className="ti ti-download ms-1" />
                            </span>
                            <span className="badge bg-light fw-normal me-2">
                            Screenshot.png
                            <i className="ti ti-download ms-1" />
                            </span>
                            <span className="badge bg-light fw-normal">
                            Screenshot.png
                            <i className="ti ti-download ms-1" />
                            </span>
                        </div>
                        <div className="d-flex align-items-center mt-3">
                            <Link
                            href="#"
                            className="d-inline-flex align-items-center text-primary fw-medium me-3"
                            >
                            <i className="ti ti-arrow-forward-up me-1" />
                            Reply
                            </Link>
                            <p>
                            <Link
                                href="#"
                                className="d-flex align-items-center"
                            >
                                <i className="ti ti-message-circle-share me-1" />
                                1 Comments
                            </Link>
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div>
                    <div>
                        <div className="d-flex align-items-center mb-3">
                        <span className="avatar avatar-lg avatar-rounded me-2 flex-shrink-0">
                            <ImageWithBasePath
                            src="assets/img/profiles/avatar-22.jpg"
                            alt="Img"
                            />
                        </span>
                        <div>
                            <h6 className="mb-1">Marilyn Siegle</h6>
                            <p>
                            <i className="ti ti-calendar-bolt me-1" />
                            Updated 8 hours ago
                            </p>
                        </div>
                        </div>
                        <div>
                        <div className="mb-3">
                            <p>
                            Check for any pending updates and installing
                            them to see if it resolves the issue
                            </p>
                        </div>
                        <div className="d-flex align-items-center mt-3">
                            <Link
                            href="#"
                            className="d-inline-flex align-items-center text-primary fw-medium me-3"
                            >
                            <i className="ti ti-arrow-forward-up me-1" />
                            Reply
                            </Link>
                            <p>
                            <Link
                                href="#"
                                className="d-flex align-items-center"
                            >
                                <i className="ti ti-message-circle-share me-1" />
                                1 Comments
                            </Link>
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
            <div className="col-xl-3 col-md-4">
            <div className="card">
                <div className="card-header p-3">
                <h4>Ticket Details</h4>
                </div>
                <div className="card-body p-0">
                <div className="border-bottom p-3">
                    <div className="mb-3">
                    <label className="form-label">Change Priority</label>
                    <CommonSelect
                        className="select"
                        options={changePriority}
                        defaultValue={changePriority[0]}
                    />
                    </div>
                    <div className="mb-3">
                    <label className="form-label">Assign To</label>
                    <CommonSelect
                        className="select"
                        options={assignTo}
                        defaultValue={assignTo[0]}
                    />
                    </div>
                    <div>
                    <label className="form-label">Ticket Status</label>
                    <CommonSelect
                        className="select"
                        options={ticketStatus}
                        defaultValue={ticketStatus[0]}
                    />
                    </div>
                </div>
                <div className="d-flex align-items-center border-bottom p-3">
                    <span className="avatar avatar-md me-2 flex-shrink-0">
                    <ImageWithBasePath
                        src="assets/img/users/user-01.jpg"
                        className="rounded-circle"
                        alt="Img"
                    />
                    </span>
                    <div>
                    <span className="fs-12">User</span>
                    <p className="text-dark">Anthony Lewis</p>
                    </div>
                </div>
                <div className="d-flex align-items-center border-bottom p-3">
                    <span className="avatar avatar-md me-2 flex-shrink-0">
                    <ImageWithBasePath
                        src="assets/img/users/user-05.jpg"
                        className="rounded-circle"
                        alt="Img"
                    />
                    </span>
                    <div>
                    <span className="fs-12">Support Agent</span>
                    <p className="text-dark">Edgar Hansel</p>
                    </div>
                </div>
                <div className="border-bottom p-3">
                    <span className="fs-12">Category</span>
                    <p className="text-dark">Repair &amp; Service</p>
                </div>
                <div className="border-bottom p-3">
                    <span className="fs-12">Email</span>
                    <p className="text-dark">Hellana@example.com</p>
                </div>
                <div className="p-3">
                    <span className="fs-12">Last Updated / Closed On</span>
                    <p className="text-dark">25 May 2024</p>
                </div>
                </div>
            </div>
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

    <TicketListModal />
    </>
  );
};

export default TicketDetailsComponent;
