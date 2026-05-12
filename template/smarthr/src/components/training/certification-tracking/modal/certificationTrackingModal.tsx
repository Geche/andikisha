import CommonSelect from "@/core/common/commonSelect"
import ImageWithBasePath from "@/core/common/imageWithBasePath"
import { Designation_Role, Employee_Name, Trainer_Name, Training_Type } from "@/core/common/selectoption/selectoption"
import { DatePicker } from "antd"

const CertificationTrackingModal = () => {
    return (
        <>
            {/* Add Probation */}
            <div className="modal fade" id="add_modal">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Certification</h4>
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
                                            <label className="form-label">
                                                Employee Name <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={Employee_Name}
                                                defaultValue={Employee_Name[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">
                                                Designation <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={Designation_Role}
                                                defaultValue={Designation_Role[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">
                                                Training Type <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={Training_Type}
                                                defaultValue={Training_Type[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">
                                                Trainer Name <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={Trainer_Name}
                                                defaultValue={Trainer_Name[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Start Date <span className="text-danger"> *</span>{" "}
                                            </label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    placeholder="dd-mm-yyyy"
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Completion Date <span className="text-danger"> *</span>{" "}
                                            </label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    placeholder="dd-mm-yyyy"
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Certificate Issue Date{" "}
                                                <span className="text-danger"> *</span>{" "}
                                            </label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    placeholder="dd-mm-yyyy"
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
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
                                    Add Certification
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Probation */}
            {/*Certificate details */}
            <div className="modal fade" id="details_modal">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">View Certificate</h4>
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
                                <div>
                                    <ImageWithBasePath
                                        src="assets/img/reports/certificate.png"
                                        alt="certificate"
                                        className="img-fluid"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer mt-3 border-top">
                                <button type="submit" className="btn btn-primary">
                                    Download
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Certificate details */}
        </>
    )
}

export default CertificationTrackingModal