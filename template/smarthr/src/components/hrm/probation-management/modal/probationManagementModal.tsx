import CommonSelect from "@/core/common/commonSelect"
import ImageWithBasePath from "@/core/common/imageWithBasePath"
import { Designation_Role, Reviewer } from "@/core/common/selectoption/selectoption"
import { DatePicker } from "antd"
import Link from "next/link"


const ProbationManagementModal = () => {
    const getModalContainer = () => {
        const modalElement = document.getElementById('modal-datepicker');
        return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
    };
    return (
        <>
            {/* Add Probation */}
            <div className="modal fade" id="add_modal">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Employee</h4>
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
                                        <div className="d-flex align-items-center flex-wrap row-gap-3 w-100 rounded p-3 mb-4">
                                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                                                <i className="ti ti-photo" />
                                            </div>
                                            <div className="profile-upload">
                                                <div className="mb-2">
                                                    <h6 className="mb-1">Upload Profile Image</h6>
                                                    <p className="fs-12">Image should be below 4 mb</p>
                                                </div>
                                                <div className="profile-uploader d-flex align-items-center">
                                                    <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                                                        Upload
                                                        <input
                                                            type="file"
                                                            className="form-control image-sign"
                                                            multiple
                                                        />
                                                    </div>
                                                    <Link
                                                        href="#"
                                                        className="btn btn-light btn-sm"
                                                    >
                                                        Cancel
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Employee Name <span className="text-danger"> *</span>
                                            </label>
                                            <input type="text" className="form-control" />
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
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Joining Date <span className="text-danger"> *</span>{" "}
                                            </label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD MMM YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
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
                                                Probation End Date <span className="text-danger"> *</span>{" "}
                                            </label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD MMM YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">
                                                Reviewer <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={Reviewer}
                                                defaultValue={Reviewer[0]}
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
                                    Add Empolee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Probation */}
            {/* Edit Probation */}
            <div className="modal fade" id="edit_modal">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Employee</h4>
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
                                        <div className="d-flex align-items-center flex-wrap row-gap-3 w-100 rounded p-3 mb-4">
                                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                                                <i className="ti ti-photo" />
                                            </div>
                                            <div className="profile-upload">
                                                <div className="mb-2">
                                                    <h6 className="mb-1">Upload Profile Image</h6>
                                                    <p className="fs-12">Image should be below 4 mb</p>
                                                </div>
                                                <div className="profile-uploader d-flex align-items-center">
                                                    <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                                                        Upload
                                                        <input
                                                            type="file"
                                                            className="form-control image-sign"
                                                            multiple
                                                        />
                                                    </div>
                                                    <Link
                                                        href="#"
                                                        className="btn btn-light btn-sm"
                                                    >
                                                        Cancel
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Employee Name <span className="text-danger"> *</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="Anthony Lewis"
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
                                                defaultValue={Designation_Role[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Joining Date <span className="text-danger"> *</span>{" "}
                                            </label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD MMM YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="14 Jun 2025"
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
                                                Probation End Date <span className="text-danger"> *</span>{" "}
                                            </label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD MMM YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="12 Sep 2025"
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3 ">
                                            <label className="form-label">
                                                Reviewer <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={Reviewer}
                                                defaultValue={Reviewer[1]}
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Probation */}
            {/* Details */}
            <div
                className="offcanvas offcanvas-end offcanvas-medium"
                tabIndex={-1}
                id="probation_details"
            >
                <div className="offcanvas-header border-bottom">
                    <h4 className="d-flex align-items-center">Employee Details</h4>
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
                    <div className="card bg-light">
                        <div className="card-body">
                            <div className="d-flex align-items-center flex-wrap flex-md-nowrap row-gap-3">
                                <span className="avatar avatar-ld avatar-rounded flex-shrink-0 me-3">
                                    <ImageWithBasePath src="assets/img/users/user-03.jpg" alt="Img" />
                                </span>
                                <div>
                                    <p className="mb-0">
                                        <Link href="#" className="text-dark fw-semibold">
                                            Anthony Lewis
                                        </Link>
                                    </p>
                                    <span className="badge badge-soft-dark text-dark d-inline-flex align-items-center badge-xs">
                                        <i className="ti ti-point-filled me-1" />
                                        Accountant
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 pb-4 border-bottom">
                        <div className="fs-14 fw-semibold text-dark mb-3">
                            Basic Information
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span>
                                <i className="ti ti-id me-1" />
                                Employee ID
                            </span>
                            <p className="fs-13 text-dark mb-0">EMP0001</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span>
                                <i className="ti ti-star me-1" />
                                Team
                            </span>
                            <p className="fs-13 text-dark mb-0">Finance</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-0">
                            <span>
                                <i className="ti ti-calendar-check me-1" />
                                Date of Join
                            </span>
                            <p className="fs-13 text-dark mb-0">14 Jan 2025</p>
                        </div>
                    </div>
                    <div>
                        <div className="fs-14 fw-semibold text-dark mb-3">Probation Period</div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span>
                                <i className="ti ti-calendar me-1" />
                                Probation Start Date
                            </span>
                            <p className="fs-13 text-dark mb-0">02 Jan 2026</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span>
                                <i className="ti ti-calendar me-1" />
                                Probation End Date
                            </span>
                            <p className="fs-13 text-dark mb-0">02 Jul 2026</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span>
                                <i className="ti ti-calendar-stats me-1" />
                                Probation Duration
                            </span>
                            <p className="fs-13 text-dark mb-0">6 months</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-0">
                            <span>
                                <i className="ti ti-user-edit me-1" />
                                Probation Status
                            </span>
                            <span className="badge badge-soft-info">Pending</span>
                        </div>
                    </div>
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

export default ProbationManagementModal