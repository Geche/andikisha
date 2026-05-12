import CommonSelect from "@/core/common/commonSelect"
import { Event_Category, priority, Status_Reopened } from "@/core/common/selectoption/selectoption"
import TagInput from "@/core/common/Taginput";
import Link from "next/link";
import { useState } from "react";


const AddSupportTicketModa = () => {
    const [tags, setTags] = useState<string[]>([
        "Vaughan Lewis",
    ]);
    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);
    };
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
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Title"
                                            />
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
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Subject"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Assign To</label>
                                            <TagInput
                                                initialTags={tags}
                                                onTagsChange={handleTagsChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Ticket Description</label>
                                            <textarea
                                                className="form-control"
                                                placeholder="Add Question"
                                                defaultValue={""}
                                            />
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
        </>
    )
}

export default AddSupportTicketModa