"use client";

import Link from "next/link";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const TooltipOption = () => {
  return (
    <>
      <div className="pe-1 mb-2">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip-top">Refresh</Tooltip>}
        >
          <Link href="#" className="btn btn-outline-light bg-white btn-icon me-1">
            <i className="ti ti-refresh" />
          </Link>
        </OverlayTrigger>
      </div>
      <div className="pe-1 mb-2">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip-top">Print</Tooltip>}
        >
          <button
            type="button"
            className="btn btn-outline-light bg-white btn-icon me-1"
          >
            <i className="ti ti-printer" />
          </button>
        </OverlayTrigger>
      </div>
      <div className="dropdown me-2 mb-2">
        <Link
          href="#"
          className="dropdown-toggle btn btn-light fw-medium d-inline-flex align-items-center"
          data-bs-toggle="dropdown"
        >
          <i className="ti ti-file-export me-2" />
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
    </>
  );
};

export default TooltipOption;
