import CommonSelect from "@/core/common/commonSelect";
import {
  Escalate_To,
  Escalation_Level,
  Notify_By,
  Time_Threshold,
  Trigger_Type,
} from "@/core/common/selectoption/selectoption";
import Link from "next/link";
import React from "react";

const Modal = () => {
  return (
    <>
      {/* Add Probation */}
      <div className="modal fade" id="add_modal">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Rule</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Trigger Type</label>
                      <CommonSelect
                        className="select"
                        options={Trigger_Type}
                        defaultValue={Trigger_Type[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3 ">
                      <label className="form-label">Escalation Level</label>
                      <CommonSelect
                        className="select"
                        options={Escalation_Level}
                        defaultValue={Escalation_Level[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3 ">
                      <label className="form-label">Time Threshold</label>
                      <CommonSelect
                        className="select"
                        options={Time_Threshold}
                        defaultValue={Time_Threshold[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3 ">
                      <label className="form-label">Escalate To</label>
                      <CommonSelect
                        className="select"
                        options={Escalate_To}
                        defaultValue={Escalate_To[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3 ">
                      <label className="form-label">Notify By</label>
                      <CommonSelect
                        className="select"
                        options={Notify_By}
                        defaultValue={Notify_By[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Notes</label>
                      <textarea className="form-control" defaultValue={""} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Probation */}
      {/* Delete Modal */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                <i className="ti ti-trash-x fs-36" />
              </span>
              <h4 className="mb-1">Confirm Delete</h4>
              <p className="mb-3">
                You want to delete all the marked items, this cant be undone
                once you delete.
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  href="#"
                  className="btn btn-light me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link href="#" className="btn btn-danger">
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Modal */}
    </>
  );
};

export default Modal;
