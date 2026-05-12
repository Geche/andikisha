"use client";

import { useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { InputOtp } from "primereact/inputotp";
import { all_routes } from "@/routes/all_routes";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TwoStepVerification3Component = () => {
  const routes = all_routes;
  const navigation = useRouter();

  const [token, setTokens] = useState<string | undefined>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigation.push(routes.login3);
  };

  return (
    <div className="container-fuild">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
          <div className="col-md-4 mx-auto vh-100">
            <form className="digit-group vh-100" onSubmit={handleSubmit}>
              <div className="vh-100 d-flex flex-column justify-content-between p-4 pb-0">
                <div className="mx-auto mb-5 text-center">
                  <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Smarthr logo" />
                </div>
                <div>
                  <div className="text-center mb-3">
                    <h2 className="mb-2">2 Step Verification</h2>
                    <p className="mb-0">
                      Please enter the OTP received to confirm your account
                      ownership. A code has been send to ******doe@example.com
                    </p>
                  </div>
                  <div className="text-center otp-input">
                    <div className="d-flex align-items-center mb-3">
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
  );
};

export default TwoStepVerification3Component;
