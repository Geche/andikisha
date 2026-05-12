"use client";
import Link from "next/link";

import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { all_routes } from "@/routes/all_routes";

const UnderMaintenanceComponent = () => {
  return (
    <div className="container">
      <div>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="row justify-content-center align-items-center">
            <div className="col-md-8 d-flex justify-content-center align-items-center mx-auto">
              <div>
                <div className="p-4 text-center">
                  <ImageWithBasePath src="assets/img/logo.svg" alt="logo" className="img-fluid" />
                </div>
                <div className="error-images">
                  <ImageWithBasePath
                    src="assets/img/bg/under-maintenance.svg"
                    alt="image"
                    className="img-fluid"
                  />
                </div>
                <div className="text-center">
                  <div>
                    <h1 className="mb-3">Under Maintenance</h1>
                    <p className="fs-16 text-center">
                      The server is in a maintenance mode, please come back later or{" "}
                      <br />
                      <Link href="#" className="text-primary">
                        click here
                      </Link>{" "}
                      to create ticket if it’s urgent{" "}
                    </p>
                    <div className="d-flex justify-content-center pb-4">
                      <Link
                        href={all_routes.adminDashboard}
                        className="btn btn-primary d-flex align-items-center "
                      >
                        <i className="ti ti-arrow-left me-2" />
                        Back to Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Page Wrapper */}
      </div>
    </div>
  );
};

export default UnderMaintenanceComponent;
