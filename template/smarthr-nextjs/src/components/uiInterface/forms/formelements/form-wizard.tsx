"use client";

import { useState } from "react";

const FormWizardComponent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalDetails: { firstName: "", lastName: "", phone: "", email: "" },
    addressDetails: { address1: "", address2: "", landmark: "", town: "" },
    paymentDetails: { cardName: "", cardType: "", cardNumber: "", cvv: "", expiration: "" },
  });

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (
    step: keyof typeof formData,
    field: string,
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [step]: { ...prevData[step], [field]: value },
    }));
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="content-page-header">
            <h3>Form Wizard</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title mb-0">Basic Wizard</h4>
              </div>
              <div className="card-body">
                <div className="wizard">
                  <ul className="nav nav-tabs justify-content-center" role="tablist">
                    <li className={`nav-item flex-fill ${currentStep === 1 ? "active" : ""}`}>
                      <button
                        type="button"
                        className={`nav-link rounded-circle mx-auto d-flex align-items-center justify-content-center ${currentStep === 1 ? "active" : ""}`}
                        onClick={() => setCurrentStep(1)}
                        aria-current={currentStep === 1 ? "step" : undefined}
                      >
                        <i className="far fa-user" />
                      </button>
                    </li>
                    <li className={`nav-item flex-fill ${currentStep === 2 ? "active" : ""}`}>
                      <button
                        type="button"
                        className={`nav-link rounded-circle mx-auto d-flex align-items-center justify-content-center ${currentStep === 2 ? "active" : ""}`}
                        onClick={() => setCurrentStep(2)}
                        aria-current={currentStep === 2 ? "step" : undefined}
                      >
                        <i className="fas fa-map-pin" />
                      </button>
                    </li>
                    <li className={`nav-item flex-fill ${currentStep === 3 ? "active" : ""}`}>
                      <button
                        type="button"
                        className={`nav-link rounded-circle mx-auto d-flex align-items-center justify-content-center ${currentStep === 3 ? "active" : ""}`}
                        onClick={() => setCurrentStep(3)}
                        aria-current={currentStep === 3 ? "step" : undefined}
                      >
                        <i className="fas fa-credit-card" />
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content">
                    {currentStep === 1 && (
                      <div className="tab-pane fade show active">
                        <h4>Enter Your Personal Details</h4>
                        <form>
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>First Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.personalDetails.firstName}
                                  onChange={(e) =>
                                    handleInputChange("personalDetails", "firstName", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Last Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.personalDetails.lastName}
                                  onChange={(e) =>
                                    handleInputChange("personalDetails", "lastName", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Phone</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.personalDetails.phone}
                                  onChange={(e) =>
                                    handleInputChange("personalDetails", "phone", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Email</label>
                                <input
                                  type="email"
                                  className="form-control"
                                  value={formData.personalDetails.email}
                                  onChange={(e) =>
                                    handleInputChange("personalDetails", "email", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </form>
                        <div className="d-flex mt-3">
                          <button className="btn btn-primary next" onClick={handleNext}>
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="tab-pane fade show active">
                        <h4>Enter Your Address</h4>
                        <form>
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Address 1</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.addressDetails.address1}
                                  onChange={(e) =>
                                    handleInputChange("addressDetails", "address1", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Address 2</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.addressDetails.address2}
                                  onChange={(e) =>
                                    handleInputChange("addressDetails", "address2", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Landmark</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.addressDetails.landmark}
                                  onChange={(e) =>
                                    handleInputChange("addressDetails", "landmark", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Town</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.addressDetails.town}
                                  onChange={(e) =>
                                    handleInputChange("addressDetails", "town", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </form>
                        <div className="d-flex mt-3">
                          <button className="btn btn-primary previous me-2" onClick={handlePrevious}>
                            Back
                          </button>
                          <button className="btn btn-primary next" onClick={handleNext}>
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div className="tab-pane fade show active">
                        <h4>Payment Details</h4>
                        <form>
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Name on Card</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.paymentDetails.cardName}
                                  onChange={(e) =>
                                    handleInputChange("paymentDetails", "cardName", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Credit Card Type</label>
                                <select
                                  className="form-select"
                                  value={formData.paymentDetails.cardType}
                                  onChange={(e) =>
                                    handleInputChange("paymentDetails", "cardType", e.target.value)
                                  }
                                >
                                  <option>Select Card Type</option>
                                  <option value="AE">American Express</option>
                                  <option value="VI">Visa</option>
                                  <option value="MC">MasterCard</option>
                                  <option value="DI">Discover</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Credit Card Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.paymentDetails.cardNumber}
                                  onChange={(e) =>
                                    handleInputChange("paymentDetails", "cardNumber", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Card Verification Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.paymentDetails.cvv}
                                  onChange={(e) =>
                                    handleInputChange("paymentDetails", "cvv", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label>Expiration Date</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={formData.paymentDetails.expiration}
                                  onChange={(e) =>
                                    handleInputChange("paymentDetails", "expiration", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </form>
                        <div className="d-flex mt-3">
                          <button className="btn btn-primary previous me-2" onClick={handlePrevious}>
                            Previous
                          </button>
                          <button
                            className="btn btn-primary next"
                            data-bs-toggle="modal"
                            data-bs-target="#save_modal"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormWizardComponent;
