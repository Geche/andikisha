"use client";

import { useState } from 'react'
import CommonSelect from '../../../core/common/commonSelect';
import TagInput from '../../../core/common/Taginput';

const EditNewPage = () => {

    const visibilityChoose = [
        { value: "Select", label: "Select" },
        { value: "Show", label: "Show" },
        { value: "Hide", label: "Hide" },
    ];
    const status = [
        { value: "Select", label: "Select" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
    ];

    const [tags, setTags] = useState<string[]>(["Sidebar", "Header", "Footer"]);
    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);
    };

    return (
        <>
            {/* Edit Pages */}
            <div className="modal fade" id="edit_page">
                <div className="modal-dialog modal-dialog-centered modal-mg w-100">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Pages</h4>
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
                                            <label className="form-label">Title</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Slug</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                rows={3}
                                                className="form-control"
                                                defaultValue={""}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Keywords</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Location</label>
                                            <TagInput
                                                initialTags={tags}
                                                onTagsChange={handleTagsChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Visibility</label>
                                            <CommonSelect
                                                className="select"
                                                options={visibilityChoose}
                                                defaultValue={visibilityChoose[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                rows={3}
                                                className="form-control"
                                                defaultValue={""}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Status</label>
                                            <CommonSelect
                                                className="select"
                                                options={status}
                                                defaultValue={status[1]}
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
            {/* /Edit Pages */}
        </>

    )
}

export default EditNewPage
