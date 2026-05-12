"use client";

import { useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { InputOtp } from 'primereact/inputotp';
import { all_routes } from "@/routes/all_routes";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TwoStepVerificationComponent = () => {
  const routes = all_routes;
  const navigation = useRouter();

  const [token, setTokens] = useState<string | undefined>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigation.push(routes.login);
  };

  return (
    <div className="container-fuild">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row">
          <div className="col-lg-5">
            <div className="login-background position-relative d-lg-flex align-items-center justify-content-center d-none flex-wrap vh-100">
              <div className="bg-overlay-img">
                <ImageWithBasePath src="assets/img/bg/bg-01.png" className="bg-1" alt="Background pattern 1" />
                <ImageWithBasePath src="assets/img/bg/bg-02.png" className="bg-2" alt="Background pattern 2" />
                <ImageWithBasePath src="assets/img/bg/bg-03.png" className="bg-3" alt="Background pattern 3" />
              </div>
              <div className="authentication-card w-100">
                <div className="authen-overlay-item border w-100">
                  <h1 className="text-white">
                    Empowering people <br /> through seamless HR <br /> management.
                  </h1>
                  <div className="my-4 mx-auto authen-overlay-img">
                    <ImageWithBasePath src="assets/img/bg/authentication-bg-01.png" alt="Authentication illustration" />
                  </div>
                  <div>
                    <p className="text-white fs-20 fw-semibold text-center">
                      Efficiently manage your workforce, streamline <br /> operations effortlessly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7 col-md-12 col-sm-12">
            <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
              <div className="col-md-7 mx-auto vh-100">
                <form className="vh-100" onSubmit={handleSubmit}>
                  <div className="vh-100 d-flex flex-column justify-content-between p-4 pb-0">
                    <div className="mx-auto mb-5 text-center">
                      <ImageWithBasePath
                        src="assets/img/logo.svg"
                        className="img-fluid"
                        alt="Smarthr logo"
                      />
                    </div>
                    <div className="">
                      <div className="text-center mb-3">
                        <h2 className="mb-2">2 Step Verification</h2>
                        <p className="mb-0">
                          Please enter the OTP received to confirm your account
                          ownership. A code has been send to ******doe@example.com
                        </p>
                      </div>
                      <div className="text-center otp-input">
                        <div className="d-flex justify-content-center align-items-center mb-3">
                          <InputOtp value={token} onChange={(e) => setTokens((typeof e.value === "string" ? e.value : e.value === null ? undefined : String(e.value)))} integerOnly />
                        </div>
                        <div>
                          <div className="badge bg-danger-transparent mb-3">
                            <p className="d-flex align-items-center ">
                              <i className="ti ti-clock me-1" />
                              09:59
                            </p>
                          </div>
                          <div className="mb-3 d-flex justify-content-center">
                            <p className="text-gray-9">
                              Didn't get the OTP?{" "}
                              <Link href="#" className="text-primary">
                                Resend OTP
                              </Link>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <button type="submit" className="btn btn-primary w-100">
                          Verify &amp; Proceed
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 pb-4 text-center">
                      <p className="mb-0 text-gray-9">Copyright © 2026 - Smarthr</p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoStepVerificationComponent;
