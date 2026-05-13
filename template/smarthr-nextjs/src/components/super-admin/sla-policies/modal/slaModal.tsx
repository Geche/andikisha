import CommonSelect from "@/core/common/commonSelect"
import { Escalates_To, Escalation_Time, First_Response_Time, Resolution_Time } from "@/core/common/selectoption/selectoption"

const SLAModal = () => {
    return (
        <>
            {/* Add Probation */}
            <div className="modal fade" id="add_modal">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Policy</h4>
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
                                            <label className="form-label">Policy</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea className="form-control" defaultValue={""} />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">First Response Time</label>
                                            <CommonSelect
                                                className='select'
                                                options={First_Response_Time}
                                                defaultValue={First_Response_Time[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">Resolution Time</label>
                                            <CommonSelect
                                                className='select'
                                                options={Resolution_Time}
                                                defaultValue={Resolution_Time[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">Escalation Time</label>
                                            <CommonSelect
                                                className='select'
                                                options={Escalation_Time}
                                                defaultValue={Escalation_Time[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">Escalates To</label>
                                            <CommonSelect
                                                className='select'
                                                options={Escalates_To}
                                                defaultValue={Escalates_To[0]}
                                            />
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
                                    Add Policy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Probation */}
        </>

    )
}

export default SLAModal