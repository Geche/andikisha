"use client";

import Link from "next/link";

import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "@/routes/all_routes";

const Error404Component = () => {
  const routes = all_routes;
  return (
    <div className="container">
      <div className="vh-100 d-flex align-items-center">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <div>
              <div className="mb-5">
                <ImageWithBasePath
                  src="assets/img/logo.svg"
                  alt="SmartHR logo"
                  className="img-fluid"
                />
              </div>
              <div>
                <h1 className="mb-3">Oops, something went wrong</h1>
                <p className="fs-16">
                  Error 404 Page not found. Sorry the page you are looking for doesn’t
                  exist or has been moved.
                </p>
                <div className="d-flex">
                  <Link
                    href={routes.adminDashboard}
                    className="btn btn-primary d-flex align-items-center "
                  >
                    <i className="ti ti-arrow-left me-2" />
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8 d-flex justify-content-end align-items-center">
            <div className="error-images">
              <ImageWithBasePath
                src="assets/img/bg/error-404.svg"
                alt="404 error illustration"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404Component;
