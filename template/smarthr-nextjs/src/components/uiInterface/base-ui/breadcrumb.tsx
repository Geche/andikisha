"use client";

import Link from "next/link"

const BreadcrumbComponent = () => {
    return (
         <div className="page-wrapper">
  <div className="content">
    <div className="page-header">
      <div className="page-title">
        <h3>Breadcrumb</h3>
      </div>
    </div>
    {/* start row */}
    <div className="row">
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Default Breadcrumb</h5>
          </div>
          <div className="card-body  py-2">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 py-2">
                <li className="breadcrumb-item active" aria-current="page">
                  Home
                </li>
              </ol>
            </nav>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 py-2">
                <li className="breadcrumb-item">
                  <Link href="#">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Library
                </li>
              </ol>
            </nav>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 py-2">
                <li className="breadcrumb-item">
                  <Link href="#">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="#">Library</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Data
                </li>
              </ol>
            </nav>
          </div>{" "}
          {/* end card-body */}
        </div>{" "}
        {/* end card*/}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Breadcrumb with Icons</h5>
          </div>
          <div className="card-body  py-2">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb py-2 mb-0">
                <li className="breadcrumb-item active" aria-current="page">
                  <i className="ti ti-smart-home fs-16 me-1" />
                  Home
                </li>
              </ol>
            </nav>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb py-2 mb-0">
                <li className="breadcrumb-item">
                  <Link href="#">
                    <i className="ti ti-smart-home fs-16 me-1" />
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Library
                </li>
              </ol>
            </nav>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb py-2 mb-0">
                <li className="breadcrumb-item">
                  <Link href="#">
                    <i className="ti ti-smart-home fs-16 me-1" />
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="#">Library</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Data
                </li>
              </ol>
            </nav>
          </div>{" "}
          {/* end card-body */}
        </div>{" "}
        {/* end card*/}
      </div>{" "}
      {/* end col */}
    </div>
    {/* end row */}
    {/* start row */}
    <div className="row">
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Arrow Style</h5>
          </div>
          <div className="card-body py-2">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-arrow mb-0 py-2">
                <li className="breadcrumb-item active" aria-current="page">
                  Home
                </li>
              </ol>
            </nav>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-arrow mb-0 py-2">
                <li className="breadcrumb-item">
                  <Link href="#">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Library
                </li>
              </ol>
            </nav>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-arrow mb-0 py-2">
                <li className="breadcrumb-item">
                  <Link href="#">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="#">Library</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Data
                </li>
              </ol>
            </nav>
          </div>{" "}
          {/* end card-body */}
        </div>{" "}
        {/* end card*/}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Pipe Style</h5>
          </div>
          <div className="card-body py-2">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-pipe py-2 mb-0">
                <li className="breadcrumb-item active" aria-current="page">
                  Home
                </li>
              </ol>
            </nav>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-pipe py-2 mb-0">
                <li className="breadcrumb-item">
                  <Link href="#">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Library
                </li>
              </ol>
            </nav>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-pipe py-2 mb-0">
                <li className="breadcrumb-item">
                  <Link href="#">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="#">Library</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Data
                </li>
              </ol>
            </nav>
          </div>{" "}
          {/* end card-body */}
        </div>{" "}
        {/* end card*/}
      </div>{" "}
      {/* end col */}
    </div>
    {/* end row */}
  </div>
  <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
    <p className="mb-0">2014 - 2026 © SmartHR.</p>
    <p>
      Designed &amp; Developed By{" "}
      <Link href="javascript:void(0);" className="text-primary">
        Dreams
      </Link>
    </p>
  </div>
</div>
    )
}

export default BreadcrumbComponent
