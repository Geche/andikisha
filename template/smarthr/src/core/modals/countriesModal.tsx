

"use client";

const CountriesModal = () => {
  return (
    <div>
      {/* Add country */}
      <div className="modal custom-modal fade" id="add_country" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Country</h5>
              <div className="d-flex align-items-center mod-toggle">
                <button className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                  <i className="ti ti-x" />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <form >
                <div className="form-wrap">
                  <label className="form-label">Country Code <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" />
                </div>
                <div className="form-wrap">
                  <label className="form-label">Country ID <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" />
                </div>
                <div className="form-wrap">
                  <label className="form-label">Country Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" />
                </div>
                <div className="modal-btn">
                  <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                  <button type="button" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Add country  */}
      {/* Edit country  */}
      <div className="modal custom-modal fade" id="edit_country" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Country</h5>
              <div className="d-flex align-items-center mod-toggle">
                <button className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                  <i className="ti ti-x" />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <form >
                <div className="form-wrap">
                  <label className="form-label">Country Code <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" defaultValue="AS" />
                </div>
                <div className="form-wrap">
                  <label className="form-label">Country ID <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" defaultValue={684} />
                </div>
                <div className="form-wrap">
                  <label className="form-label">Country Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" defaultValue="American Samoa(+684)" />
                </div>
                <div className="modal-btn">
                  <button type="submit" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit country  */}
      {/* Delete Countries */}
      <div className="modal custom-modal fade" id="delete_country" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 m-0 justify-content-end">
              <button className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="success-message text-center">
                <div className="success-popup-icon">
                  <i className="ti ti-trash-x" />
                </div>
                <h3>Remove Country?</h3>
                <p className="del-info">Are you sure you want to remove it.</p>
                <div className="col-lg-12 text-center modal-btn">
                  <button type="submit" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-danger" data-bs-dismiss="modal">Yes, Delete it</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Countries */}
    </div>

  )
}

export default CountriesModal