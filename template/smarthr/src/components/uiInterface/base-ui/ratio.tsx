import Link from "next/link"



const RatioComponent = () => {
  return (
<div className="page-wrapper">
  <div className="content">
    <div className="page-header">
      <div className="page-title">
        <h3>Ratio Video</h3>
      </div>
    </div>
    {/* start row */}
    <div className="row">
      <div className="col-xl-6">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Responsive Ratio video 21:9</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">
              Use class <code>.ratio-21x9</code>
              {/* 21:9 aspect ratio */}
            </p>
            <div className="ratio ratio-21x9">
              <iframe src="https://www.youtube.com/embed/6bzTrChjEdc?autohide=0&showinfo=0&controls=0" />
            </div>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Responsive Ratio video 1:1</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">
              Use class <code>.ratio-1x1</code>
            </p>
            {/* 1:1 aspect ratio */}
            <div className="ratio ratio-1x1">
              <iframe src="https://www.youtube.com/embed/6bzTrChjEdc?autohide=0&showinfo=0&controls=0" />
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
            <h5 className="card-title">Responsive Ratio video 16:9</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">
              Use class <code>.ratio-16x9</code>
            </p>
            {/* 16:9 aspect ratio */}
            <div className="ratio ratio-16x9">
              <iframe src="https://www.youtube.com/embed/6bzTrChjEdc?autohide=0&showinfo=0&controls=0" />
            </div>
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Responsive Ratio video 4:3</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">
              Use class <code>.ratio-4x3</code>
            </p>
            {/* 4:3 aspect ratio */}
            <div className="ratio ratio-4x3">
              <iframe src="https://www.youtube.com/embed/6bzTrChjEdc?autohide=0&showinfo=0&controls=0" />
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

export default RatioComponent