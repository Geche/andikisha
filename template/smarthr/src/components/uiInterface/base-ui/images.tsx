"use client";

import Link from "next/link";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";

const ImagesComponent = () => {
  return (
 <div className="page-wrapper">
  <div className="content">
    <div className="page-header">
      <div className="page-title">
        <h3>Images</h3>
      </div>
    </div>
    {/* start row */}
    <div className="row">
      <div className="col-xl-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Images Shapes</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-xl-12">
                <p className="text-muted">
                  Add classes to an <code>&lt;img&gt;</code> element to easily
                  style images in any project.
                </p>
                <div className="row">
                  <div className="col-sm-3">
                    <ImageWithBasePath
                      src="assets/img/img-01.jpg"
                      alt="image"
                      className="img-fluid rounded"
                      width={200}
                    />
                    <p className="mb-0">
                      <code>.rounded</code>
                    </p>
                  </div>
                  <div className="col-sm-3">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-03.jpg"
                      alt="image"
                      className="img-fluid rounded-circle"
                      width={133}
                    />
                    <p className="mb-0">
                      <code>.rounded-circle</code>
                    </p>
                  </div>
                  <div className="col-sm-3">
                    <ImageWithBasePath
                      src="assets/img/img-02.jpg"
                      alt="image"
                      className="img-fluid img-thumbnail"
                      width={200}
                    />
                    <p className="mb-0">
                      <code>.img-thumbnail</code>
                    </p>
                  </div>
                  <div className="col-sm-3">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-02.jpg"
                      alt="image"
                      className="img-thumbnail rounded-pill"
                      width={133}
                    />
                    <p className="mb-0">
                      <code>.rounded-pill</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
    </div>
    {/* end row */}
    <div className="row">
      <div className="col-xl-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Image Left Align</h5>
          </div>
          <div className="card-body">
            <ImageWithBasePath
              className="rounded float-start"
              src="assets/img/img-1.jpg"
              alt="..."
              width={200}
            />
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Image Center Align</h5>
          </div>
          <div className="card-body">
            <ImageWithBasePath
              className="rounded mx-auto d-block"
              src="assets/img/img-2.jpg"
              alt="..."
              width={200}
            />
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Image Right Align</h5>
          </div>
          <div className="card-body">
            <ImageWithBasePath
              className="rounded float-end"
              src="assets/img/img-3.jpg"
              alt="..."
              width={200}
            />
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Figures</h5>
          </div>
          <div className="card-body d-flex justify-content-between gap-2">
            <figure className="figure mb-0">
              <ImageWithBasePath
                className="bd-placeholder-img figure-img img-fluid rounded card-img"
                src="assets/img/img-4.jpg"
                alt="..."
              />
              <figcaption className="figure-caption">
                A caption for the above image.
              </figcaption>
            </figure>
            <figure className="figure mb-0 float-end">
              <ImageWithBasePath
                className="bd-placeholder-img figure-img img-fluid rounded card-img"
                src="assets/img/img-5.jpg"
                alt="..."
              />
              <figcaption className="figure-caption text-end">
                A caption for the above image.
              </figcaption>
            </figure>
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
  );
};

export default ImagesComponent;
