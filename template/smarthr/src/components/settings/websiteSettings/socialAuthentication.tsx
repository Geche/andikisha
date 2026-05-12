"use client";

import Link from "next/link";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { all_routes } from "@/routes/all_routes";

const Socialauthentication = () => {
  const routes = all_routes;
  return (
    <div>
      <div className="page-wrapper">
        <div className="content bg-white">
          <div className="d-md-flex d-block align-items-center justify-content-between border-bottom pb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Website Settings</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href="index">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link href="#">Settings</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Website Settings
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="pe-1 mb-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-top">Refresh</Tooltip>}
                >
                  <Link
                    href="#"
                    className="btn btn-outline-light bg-white btn-icon me-1"
                  >
                    <i className="ti ti-refresh" />
                  </Link>
                </OverlayTrigger>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xxl-2 col-xl-3">
              <div className="pt-3 d-flex flex-column list-group mb-4">
                <Link
                  href={routes.companySettings}
                  className="d-block rounded p-2"
                >
                  Company Settings
                </Link>
                <Link href={routes.localization} className="d-block rounded p-2">
                  Localization
                </Link>
                <Link href={routes.prefixes} className="d-block rounded p-2">
                  Prefixes
                </Link>
                <Link href={routes.preference} className="d-block rounded p-2">
                  Preferences
                </Link>
                <Link
                  href={routes.socialAuthentication}
                  className="d-block rounded p-2 active"
                >
                  Social Authentication
                </Link>
                <Link href={routes.language} className="d-block rounded p-2">
                  Language
                </Link>
              </div>
            </div>
            <div className="col-xxl-10 col-xl-9">
              <div className="border-start ps-3">
                <form>
                  <div className="d-flex align-items-center justify-content-between flex-wrap border-bottom pt-3 mb-3">
                    <div className="mb-3">
                      <h5 className="mb-1">Social Authentication</h5>
                      <p>Personalize your path and settings of your website</p>
                    </div>
                    <div className="mb-3">
                      <button className="btn btn-light me-2" type="button">
                        Cancel
                      </button>
                      <button className="btn btn-primary" type="submit">
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="d-md-flex d-block">
                    <div className="flex-fill">
                      <div className="row">
                        <div className="col-xxl-4 col-xl-6">
                          <div className="card">
                            <div className="card-header d-flex align-items-center justify-content-between border-0 mb-3 pb-0">
                              <div className="d-flex align-items-center">
                                <span className="avatar avatar-lg p-2 rounded bg-gray flex-shrink-0 me-2">
                                  <ImageWithBasePath
                                    src="assets/img/icons/fb-icon.svg"
                                    alt="Icons Image"
                                  />
                                </span>
                                <h6>Facebook</h6>
                              </div>
                              <span className="badge bg-transparent-success text-success">
                                Connected
                              </span>
                            </div>
                            <div className="card-body pt-0">
                              <p>
                                Connect with friends, family and other people
                                you know.
                              </p>
                            </div>
                            <div className="card-footer d-flex justify-content-between align-items-center">
                              <div>
                                <Link href="#" className="btn btn-outline-light">
                                  <i className="ti ti-tool me-2" />
                                  View Integration
                                </Link>
                              </div>
                              <div className="status-toggle modal-status">
                                <input
                                  type="checkbox"
                                  id="user1"
                                  className="check"
                                />
                                <label htmlFor="user1" className="checktoggle">
                                  {" "}
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-xl-6">
                          <div className="card">
                            <div className="card-header d-flex align-items-center justify-content-between border-0 mb-3 pb-0">
                              <div className="d-flex align-items-center">
                                <span className="avatar avatar-lg p-2 rounded bg-gray flex-shrink-0 me-2">
                                  <ImageWithBasePath
                                    src="assets/img/icons/twitter-icon.svg"
                                    alt="Icons Image"
                                  />
                                </span>
                                <h6>Twitter</h6>
                              </div>
                              <span className="badge bg-transparent-dark text-dark">
                                Not Connected
                              </span>
                            </div>
                            <div className="card-body pt-0">
                              <p>
                                Communicate and stay connected through the
                                exchange of quick, frequent messages
                              </p>
                            </div>
                            <div className="card-footer d-flex justify-content-between align-items-center">
                              <div>
                                <Link href="#" className="btn btn-outline-light">
                                  <i className="ti ti-tool me-2" />
                                  View Integration
                                </Link>
                              </div>
                              <div className="status-toggle modal-status">
                                <input
                                  type="checkbox"
                                  id="user2"
                                  className="check"
                                />
                                <label htmlFor="user2" className="checktoggle">
                                  {" "}
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl-4 col-xl-6">
                          <div className="card">
                            <div className="card-header d-flex align-items-center justify-content-between border-0 mb-3 pb-0">
                              <div className="d-flex align-items-center">
                                <span className="avatar avatar-lg p-2 rounded bg-gray flex-shrink-0 me-2">
                                  <ImageWithBasePath
                                    src="assets/img/icons/google-icon.svg"
                                    alt="Icons Image"
                                  />
                                </span>
                                <h6>Google</h6>
                              </div>
                              <span className="badge bg-transparent-dark text-dark">
                                Not Connected
                              </span>
                            </div>
                            <div className="card-body pt-0">
                              <p>
                                Google has many special features to help you
                                find exactly what you're looking for.
                              </p>
                            </div>
                            <div className="card-footer d-flex justify-content-between align-items-center">
                              <div>
                                <Link href="#" className="btn btn-outline-light">
                                  <i className="ti ti-tool me-2" />
                                  View Integration
                                </Link>
                              </div>
                              <div className="status-toggle modal-status">
                                <input
                                  type="checkbox"
                                  id="user3"
                                  className="check"
                                />
                                <label htmlFor="user3" className="checktoggle">
                                  {" "}
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Socialauthentication;
