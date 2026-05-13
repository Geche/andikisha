import CommonSelect from "@/core/common/commonSelect"
import { Event_Category, priority, Status_Reopened } from "@/core/common/selectoption/selectoption"
import Link from "next/link"

const TenentTicketDetailsModal = () => {
    return (
        <>
            {/* Add Ticket */}
            <div className="modal fade" id="add_ticket">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Ticket</h4>
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
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Title</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Event Category</label>
                                            <CommonSelect
                                                className='select'
                                                options={Event_Category}
                                                defaultValue={Event_Category[0]}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Subject</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Assign To</label>
                                            <input
                                                className="input-tags form-control"
                                                type="text"
                                                data-role="tagsinput"
                                                name="Label"
                                                defaultValue="Vaughan Lewis"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Ticket Description</label>
                                            <textarea className="form-control" defaultValue={""} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Priority</label>
                                            <CommonSelect
                                                className='select'
                                                options={priority}
                                                defaultValue={priority[0]}
                                            />
                                        </div>
                                        <div className="mb-0">
                                            <label className="form-label">Status</label>
                                            <CommonSelect
                                                className='select'
                                                options={Status_Reopened}
                                                defaultValue={Status_Reopened[0]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Link href="#" className="btn btn-light me-2" data-bs-dismiss="modal">
                                    Cancel
                                </Link>
                                <button type="submit" className="btn btn-primary">
                                    Add Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Ticket */}
            {/* Edit Ticket */}
            <div className="modal fade" id="edit_ticket">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Ticket</h4>
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
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Title</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Event Category</label>
                                            <CommonSelect
                                                className='select'
                                                options={Event_Category}
                                                defaultValue={Event_Category[1]}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Subject</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Assign To</label>
                                            <input
                                                className="input-tags form-control"
                                                type="text"
                                                data-role="tagsinput"
                                                name="Label"
                                                defaultValue="Vaughan Lewis"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Ticket Description</label>
                                            <textarea className="form-control" defaultValue={""} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Priority</label>
                                            <CommonSelect
                                                className='select'
                                                options={priority}
                                                defaultValue={priority[1]}
                                            />
                                        </div>
                                        <div className="mb-0">
                                            <label className="form-label">Status</label>
                                            <CommonSelect
                                                className='select'
                                                options={Status_Reopened}
                                                defaultValue={Status_Reopened[1]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Link href="#" className="btn btn-light me-2" data-bs-dismiss="modal">
                                    Cancel
                                </Link>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Ticket */}

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
                                You want to delete this item, this cant be undone once you delete.
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
    )
}

export default TenentTicketDetailsModal