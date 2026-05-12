import CommonSelect from '@/core/common/commonSelect'
import { Action_Type,  Assigned_To, Condition_Field, Operator, Trigger_Event, Trigger_Time } from '@/core/common/selectoption/selectoption'
import Link from 'next/link'
import React from 'react'


const AddNewAutomation = () => {
  return (
    <>
  {/* Details */}
  <div
    className="offcanvas offcanvas-end offcanvas-medium"
    tabIndex={-1}
    id="add_modal"
  >
    <div className="offcanvas-header border-bottom">
      <h4 className="d-flex align-items-center">Add New Rule</h4>
      <button
        type="button"
        className="btn-close custom-btn-close"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      >
        <i className="ti ti-x" />
      </button>
    </div>
    <div className="offcanvas-body">
      <div className="mb-3 border-bottom">
        <div className="mb-3">
          <label className="form-label">Rule Name</label>
          <input type="text" className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Assign To</label>
          <CommonSelect
                                                            className='select'
                                                            options={Assigned_To}
                                                            defaultValue={Assigned_To[0]}
                                                        />
        </div>
      </div>
      <div className="mb-3 border-bottom">
        <div className="text-dark fw-semibold fs-16 mb-3">Trigger Event</div>
        <div className="mb-3">
         <CommonSelect
                                                            className='select'
                                                            options={Trigger_Event}
                                                            defaultValue={Trigger_Event[0]}
                                                        />
        </div>
        <div className="mb-3">
          <label className="form-label text-muted">Trigger Time</label>
        <CommonSelect
                                                            className='select'
                                                            options={Trigger_Time}
                                                            defaultValue={Trigger_Time[0]}
                                                        />
          <span className="text-muted fs-12">
            If Trigger = Time Based / SLA Breached
          </span>
        </div>
      </div>
      <div className="mb-3 border-bottom">
        <div className="text-dark fw-semibold fs-16 mb-3">Condition</div>
        <div className="mb-3">
          <label className="form-label">Condition Field</label>
            <CommonSelect
                                                            className='select'
                                                            options={Condition_Field}
                                                            defaultValue={Condition_Field[0]}
                                                        />
        </div>
        <div className="mb-3">
          <label className="form-label">Operator</label>
            <CommonSelect
                                                            className='select'
                                                            options={Operator}
                                                            defaultValue={Operator[0]}
                                                        />
        </div>
        <div className="mb-3">
          <label className="form-label">Value</label>
          <input type="text" className="form-control" />
        </div>
      </div>
      <div>
        <div className="text-dark fw-semibold fs-16 mb-3">Action</div>
        <div className="mb-3">
          <label className="form-label">Action Type</label>
         <CommonSelect
                                                            className='select'
                                                            options={Action_Type}
                                                            defaultValue={Action_Type[0]}
                                                        />
        </div>
        <div className="mb-3">
          <label className="form-label text-muted">Assign To</label>
         <CommonSelect
                                                            className='select'
                                                            options={Assigned_To}
                                                            defaultValue={Assigned_To[0]}
                                                        />
        </div>
      </div>
    </div>
    <div className="offcanvas-footer p-3 d-flex align-items-center justify-content-end border-top">
      <button
        type="button"
        className="btn btn-light me-2"
        data-bs-dismiss="offcanvas"
      >
        Cancel
      </button>
      <button type="submit" className="btn btn-primary">
        Add Rule
      </button>
    </div>
  </div>
  {/* Details */}
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
            You want to delete all the marked items, this cant be undone once
            you delete.
          </p>
          <div className="d-flex justify-content-center">
            <Link href="#" className="btn btn-light me-3" data-bs-dismiss="modal">
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
  )
}

export default AddNewAutomation