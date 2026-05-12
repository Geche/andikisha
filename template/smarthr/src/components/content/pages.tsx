"use client";
import PredefinedDateRanges from "../../core/common/datePicker";
import CommonSelect from "../../core/common/commonSelect";
import { page } from "../../core/common/selectoption/selectoption";
import { pages_data } from "../../core/data/json/pages_data";
import Table from "../../core/common/dataTable/index";
import TooltipOption from "../../core/common/tooltipOption";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";

type PagesRow = { key: string; page: string; slug: string; status: boolean };

const PagesComponent = () => {
  const data = pages_data;
  const routes = all_routes;
  const columns = [
    {
      title: "Page",
      dataIndex: "page",
      key: "page",
      sorter: (a: PagesRow, b: PagesRow) => a.page.length - b.page.length,
    },
    {
      title: "Page Slug",
      dataIndex: "slug",
      key: "slug",
      sorter: (a: PagesRow, b: PagesRow) => a.slug.length - b.slug.length,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a: PagesRow, b: PagesRow) =>
        a.status.toString().length - b.status.toString().length,
      render: (_: PagesRow["status"], record: PagesRow) => (
        <div className="status-toggle modal-status">
          <input type="checkbox" id={`user-${record.key}`} className="check" />
          <label htmlFor={`user-${record.key}`} className="checktoggle">
            {" "}
          </label>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, _record: PagesRow) => (
        <div className="d-flex align-items-center">
          <div className="dropdown">
            <Link
              href="#"
              className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="ti ti-dots-vertical fs-14" />
            </Link>
            <ul className="dropdown-menu dropdown-menu-right p-3">
              <li>
                <Link className="dropdown-item rounded-1" href="#">
                  <i className="ti ti-edit-circle me-2" />
                  Edit
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item rounded-1"
                  href="#"
                  data-bs-toggle="modal"
                  data-inert={true}
                  data-bs-target="#delete-modal"
                >
                  <i className="ti ti-trash-x me-2" />
                  Delete
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
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
      <h2 className="mb-1">Pages</h2>
      <nav>
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <a href="index.html">
              <i className="ti ti-smart-home" />
            </a>
          </li>
          <li className="breadcrumb-item">Content</li>
          <li className="breadcrumb-item active" aria-current="page">
            Pages
          </li>
        </ol>
      </nav>
    </div>
    <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
      <div className="mb-2">
        <a
          href="#"
          data-bs-toggle="modal"
          data-bs-target="#add_page"
          className="btn btn-primary d-flex align-items-center"
        >
          <i className="ti ti-circle-plus me-2" />
          Add Page
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

          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Pages List</h4>
              <div className="d-flex align-items-center flex-wrap">
                <div className="input-icon-start mb-3 me-2 position-relative">
                  <PredefinedDateRanges />
                </div>
                <div className="dropdown mb-3 me-2">
                  <Link
                    href="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                  >
                    <i className="ti ti-filter me-2" />
                    Filter
                  </Link>
                  <div className="dropdown-menu drop-width">
                    <form>
                      <div className="d-flex align-items-center border-bottom p-3">
                        <h4>Filter</h4>
                      </div>
                      <div className="p-3 border-bottom">
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Page</label>
                              <CommonSelect
                                className="select"
                                options={page}
                                defaultValue={page[0]}
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="mb-0">
                              <label className="form-label">Page Slug</label>
                              <CommonSelect
                                className="select"
                                options={page}
                                defaultValue={page[0]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 d-flex align-items-center justify-content-end">
                        <button type="button" className="btn btn-light me-3">
                          Reset
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Apply
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="dropdown mb-3">
                  <Link
                    href="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-sort-ascending-2 me-2" />
                    Sort by A-Z
                  </Link>
                  <ul className="dropdown-menu p-3">
                    <li>
                      <Link href="#" className="dropdown-item rounded-1 active">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Recently Viewed
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0 py-3">
              {/* Pages List */}
              <Table<PagesRow>
                dataSource={data}
                columns={columns}
                Selection={true}
              />
              {/* /Pages List */}
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form>
              <div className="modal-body text-center">
                <span className="delete-icon">
                  <i className="ti ti-trash-x" />
                </span>
                <h4>Confirm Deletion</h4>
                <p>
                  You want to delete all the marked items, this cant be undone
                  once you delete.
                </p>
                <div className="d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light me-3"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Yes, Delete
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Delete Modal */}
    </>
  );
};

export default PagesComponent;
