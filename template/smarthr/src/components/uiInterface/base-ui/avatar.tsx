
"use client";

import Link from 'next/link'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'

const AvatarComponent = () => {
    return (
       <div className="page-wrapper">
  <div className="content">
    <div className="page-header">
      <div className="page-title">
        <h3>Avatars</h3>
      </div>
    </div>
    {/* start row */}
    <div className="row">
      <div className="col-xl-6">
        <div className="card card-h-100">
          <div className="card-header">
            <h5 className="card-title">Avatars</h5>
          </div>
          <div className="card-body">
            <div className="d-flex align flex-wrap gap-2">
              <span className="avatar avatar-xl me-2 avatar-rounded">
                <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="img" />
              </span>
              <span className="avatar avatar-xl me-2 avatar-radius-0">
                <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="img" />
              </span>
              <span className="avatar avatar-xl me-2">
                <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="img" />
              </span>
              <span className="avatar avatar-xl bg-primary avatar-rounded">
                <span className="avatar-title">SR</span>
              </span>
              <span className="avatar avatar-xl bg-success avatar-radius-0">
                <span className="avatar-title">SR</span>
              </span>
              <span className="avatar avatar-xl bg-danger">
                <span className="avatar-title">SR</span>
              </span>
            </div>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Avatar Sizes</h5>
          </div>
          <div className="card-body d-flex align-items-center">
            <span className="avatar avatar-xss me-2">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-xs me-2">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-sm me-2">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-md me-2">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-lg me-2">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-xl me-2">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-xxl me-2">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
    </div>
    {/* end row */}
    {/* start row */}
    <div className="row">
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Avatar with Status</h5>
          </div>
          <div className="card-body d-flex align-items-center">
            <span className="avatar avatar-xs me-2 online avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-sm online me-2 avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-md me-2 online avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-lg me-2 away avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-xl me-2 online avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
            <span className="avatar avatar-xxl me-2 offline avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-02.jpg" alt="avatar" />
            </span>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Avatar with Badge</h5>
          </div>
          <div className="card-body d-flex align-items-center">
            <span className="avatar avatar-xs me-2 avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-03.jpg" alt="avatar" />
              <span className="badge rounded-pill bg-primary avatar-notification">
                2
              </span>
            </span>
            <span className="avatar avatar-sm me-2 avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-03.jpg" alt="avatar" />
              <span className="badge rounded-pill bg-secondary avatar-notification">
                5
              </span>
            </span>
            <span className="avatar avatar-md me-2 avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-03.jpg" alt="avatar" />
              <span className="badge rounded-pill bg-warning avatar-notification">
                1
              </span>
            </span>
            <span className="avatar avatar-lg me-2 avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-03.jpg" alt="avatar" />
              <span className="badge rounded-pill bg-info avatar-notification">
                7
              </span>
            </span>
            <span className="avatar avatar-xl me-2 avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-03.jpg" alt="avatar" />
              <span className="badge rounded-pill bg-success avatar-notification">
                3
              </span>
            </span>
            <span className="avatar avatar-xxl me-2 avatar-rounded">
              <ImageWithBasePath src="assets/img/profiles/avatar-03.jpg" alt="avatar" />
              <span className="badge rounded-pill bg-danger avatar-notification">
                9
              </span>
            </span>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Solid Background Color</h5>
          </div>
          <div className="card-body">
            <span className="avatar bg-primary avatar-rounded">
              <span className="avatar-title">JD</span>
            </span>
            <span className="avatar bg-secondary avatar-rounded">
              <span className="avatar-title">SR</span>
            </span>
            <span className="avatar bg-success avatar-rounded">
              <span className="avatar-title">BJ</span>
            </span>
            <span className="avatar bg-info avatar-rounded">
              <span className="avatar-title">AD</span>
            </span>
            <span className="avatar bg-warning avatar-rounded">
              <span className="avatar-title">CB</span>
            </span>
            <span className="avatar bg-danger avatar-rounded">
              <span className="avatar-title">KL</span>
            </span>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Soft Background Color</h5>
          </div>
          <div className="card-body">
            <span className="avatar bg-primary-subtle rounded">
              <span className="avatar-title text-primary">JD</span>
            </span>
            <span className="avatar bg-secondary-subtle rounded">
              <span className="avatar-title text-secondary">SR</span>
            </span>
            <span className="avatar bg-success-subtle rounded">
              <span className="avatar-title text-success">BJ</span>
            </span>
            <span className="avatar bg-info-subtle rounded">
              <span className="avatar-title text-info">AD</span>
            </span>
            <span className="avatar bg-warning-subtle rounded">
              <span className="avatar-title text-warning">CB</span>
            </span>
            <span className="avatar bg-danger-subtle rounded">
              <span className="avatar-title text-danger">KL</span>
            </span>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Avatar Group - Square</h5>
          </div>
          <div className="card-body">
            <div className="avatar-list-stacked avatar-group-lg mb-3">
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <Link className="avatar bg-primary" href="javascript:void(0);">
                +8
              </Link>
            </div>
            <div className="avatar-list-stacked mb-3">
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <Link className="avatar bg-primary" href="javascript:void(0);">
                +8
              </Link>
            </div>
            <div className="avatar-list-stacked avatar-group-sm">
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-04.jpg"
                  alt="avatar"
                />
              </span>
              <Link className="avatar bg-primary" href="javascript:void(0);">
                +8
              </Link>
            </div>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Avatar Group - Rounded</h5>
          </div>
          <div className="card-body">
            <div className="avatar-list-stacked avatar-group-lg mb-3">
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <Link
                className="avatar bg-primary avatar-rounded"
                href="javascript:void(0);"
              >
                +8
              </Link>
            </div>
            <div className="avatar-list-stacked mb-3">
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <Link
                className="avatar bg-primary avatar-rounded"
                href="javascript:void(0);"
              >
                +8
              </Link>
            </div>
            <div className="avatar-list-stacked avatar-group-sm">
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <span className="avatar avatar-rounded">
                <ImageWithBasePath
                  className="border border-white"
                  src="assets/img/profiles/avatar-05.jpg"
                  alt="avatar"
                />
              </span>
              <Link
                className="avatar bg-primary avatar-rounded"
                href="javascript:void(0);"
              >
                +8
              </Link>
            </div>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
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

export default AvatarComponent
