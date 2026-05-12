"use client";

import { useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "@/routes/all_routes";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PasswordField = "password" | "confirmPassword";

interface PasswordVisibility {
  password: boolean;
  confirmPassword: boolean;
}

const Register3Component = () => {
  const routes = all_routes;
  const navigation = useRouter();

  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigation.push(routes.login3);
  };

  return (
    <div className="container-fuild">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
          <div className="col-md-4 mx-auto vh-100">
            <form className="vh-100" onSubmit={handleSubmit}>
              <div className="vh-100 d-flex flex-column justify-content-between p-4 pb-0">
                <div className="mx-auto mb-5 text-center">
                  <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Smarthr logo" />
                </div>
                <div className="">
                  <div className="text-center mb-3">
                    <h2 className="mb-2">Sign Up</h2>
                    <p className="mb-0">Please enter your details to sign up</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <div className="input-group">
                      <input
                        type="text"
                        defaultValue=""
                        className="form-control border-end-0"
                        required
                      />
                      <span className="input-group-text border-start-0">
                        <i className="ti ti-user" />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <div className="input-group">
                      <input
                        type="email"
                        defaultValue=""
                        className="form-control border-end-0"
                        required
                        autoComplete="email"
                      />
                      <span className="input-group-text border-start-0">
                        <i className="ti ti-mail" />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="pass-group">
                      <input
                        type={passwordVisibility.password ? "text" : "password"}
                        className="pass-input form-control"
                        required
                        autoComplete="new-password"
                      />
                      <span
                        className={`ti toggle-passwords ${passwordVisibility.password ? "ti-eye" : "ti-eye-off"}`}
                        onClick={() => togglePasswordVisibility("password")}
                        role="button"
                        tabIndex={0}
                        aria-label="Toggle password visibility"
                      ></span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <div className="pass-group">
                      <input
                        type={passwordVisibility.confirmPassword ? "text" : "password"}
                        className="pass-input form-control"
                        required
                        autoComplete="new-password"
                      />
                      <span
                        className={`ti toggle-passwords ${passwordVisibility.confirmPassword ? "ti-eye" : "ti-eye-off"}`}
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                        role="button"
                        tabIndex={0}
                        aria-label="Toggle confirm password visibility"
                      ></span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div className="form-check form-check-md mb-0">
                        <input
                          className="form-check-input"
                          id="remember_me"
                          type="checkbox"
                          required
                        />
                        <label
                          htmlFor="remember_me"
                          className="form-check-label mt-0"
                        >
                          Agree to{" "}
                          <span className="text-primary"> Terms &amp; Privacy</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <button type="submit" className="btn btn-primary w-100">
                      Sign Up
                    </button>
                  </div>
                  <div className="text-center">
                    <h6 className="fw-normal text-dark mb-0">
                      Already have an account?
                      <Link href={all_routes.login3} className="hover-a">
                        {" "}
                        Sign In{" "}
                      </Link>
                    </h6>
                  </div>
                  <div className="login-or">
                    <span className="span-or">Or</span>
                  </div>
                  <div className="mt-2">
                    <div className="d-flex align-items-center justify-content-center flex-wrap">
                      <div className="text-center me-2 flex-fill">
                        <Link
                          href="#"
                          className="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center"
                        >
                          <ImageWithBasePath
                            className="img-fluid m-1"
                            src="assets/img/icons/facebook-logo.svg"
                            alt="Facebook"
                          />
                        </Link>
                      </div>
                      <div className="text-center me-2 flex-fill bg-white">
                        <Link
                          href="#"
                          className="br-10 p-2 btn btn-outline-light border d-flex align-items-center justify-content-center"
                        >
                          <ImageWithBasePath
                            className="img-fluid m-1"
                            src="assets/img/icons/google-logo.svg"
                            alt="Google"
                          />
                        </Link>
                      </div>
                      <div className="text-center flex-fill">
                        <Link
                          href="#"
                          className="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center"
                        >
                          <ImageWithBasePath
                            className="img-fluid m-1"
                            src="assets/img/icons/apple-logo.svg"
                            alt="Apple"
                          />
                        </Link>
                      </div>
                    </div>
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

export default Register3Component;
