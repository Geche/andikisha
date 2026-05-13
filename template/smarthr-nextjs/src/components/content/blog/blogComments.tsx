"use client";

import PredefinedDateRanges from "../../../core/common/datePicker";
import { blog_comments_data } from "../../../core/data/json/blog_comments_data";
import Table from "../../../core/common/dataTable/index";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
type BlogCommentRow = {
  key: string;
  Comment: string;
  Created_Date: string;
  Review: string;
  Blog: string;
  By: string;
  action_dropdown: string;
  action: string;
};

const BlogCommentsComponent = () => {
  const data:BlogCommentRow[] = blog_comments_data;
  const routes = all_routes;
  const columns = [
    {
      title: "Comment",
      dataIndex: "Comment",
      sorter: (a: BlogCommentRow, b: BlogCommentRow) =>
        a.Comment.length - b.Comment.length,
    },
    {
      title: "Created Date",
      dataIndex: "Created_Date",
      sorter: (a: BlogCommentRow, b: BlogCommentRow) =>
        a.Created_Date.length - b.Created_Date.length,
    },
    {
      title: "Review",
      dataIndex: "Review",
      render: () => (
        <span className="text-warning">
          <i className="ti ti-star-filled " />
          <i className="ti ti-star-filled" />
          <i className="ti ti-star-filled" />
          <i className="ti ti-star-filled" />
          <i className="ti ti-star-filled" />
        </span>
      ),
      sorter: (a: BlogCommentRow, b: BlogCommentRow) =>
        a.Review.length - b.Review.length,
    },

    {
      title: "Blog",
      dataIndex: "Blog",
      sorter: (a: BlogCommentRow, b: BlogCommentRow) =>
        a.Blog.length - b.Blog.length,
    },
    {
      title: "By",
      dataIndex: "By",
      sorter: (a: BlogCommentRow, b: BlogCommentRow) =>
        a.By.length - b.By.length,
    },
    {
      title: "",
      dataIndex: "action_dropdown",
      render: () => (
        <div className="dropdown me-3">
          <Link
            href="#"
            className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            Unpublish
          </Link>
          <ul className="dropdown-menu  dropdown-menu-end p-3">
            <li>
              <Link href="#" className="dropdown-item rounded-1">
                Unpublish
              </Link>
            </li>
            <li>
              <Link href="#" className="dropdown-item rounded-1">
                Publish
              </Link>
            </li>
          </ul>
        </div>
      ),
      sorter: (a: BlogCommentRow, b: BlogCommentRow) =>
        a.action_dropdown.length - b.action_dropdown.length,
    },
    {
      title: "",
      dataIndex: "action",
      render: () => (
        <div className="action-icon d-inline-flex">
          <Link href="#" data-bs-toggle="modal" data-bs-target="#delete_modal">
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
      sorter: (a: BlogCommentRow, b: BlogCommentRow) =>
        a.action.length - b.action.length,
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
              <h2 className="mb-1">Blog Comments</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Blogs</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Blog Comments
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
              <div className="head-icons">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Blog Comments List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon position-relative">
                    <PredefinedDateRanges />
                  </div>
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
                      <Link href="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Desending
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Last Month
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item rounded-1">
                        Last 7 Days
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <Table<BlogCommentRow>
                dataSource={data}
                columns={columns}
                Selection={true}
              />
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

export default BlogCommentsComponent;
