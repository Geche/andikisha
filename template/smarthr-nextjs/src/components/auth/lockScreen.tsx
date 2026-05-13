"use client";

import { useState } from "react";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { all_routes } from "@/routes/all_routes";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PasswordField = "password" | "confirmPassword";

interface PasswordVisibility {
  password: boolean;
  confirmPassword: boolean;
}

const LockScreenComponent = () => {
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
    navigation.push(routes.login);
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <form onSubmit={handleSubmit}>
            <div className="d-flex flex-column justify-content-between vh-100">
              <div className="mx-auto p-4 text-center">
                <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Smarthr logo" />
              </div>
              <div className="card border-primary">
                <div className="card-body bg-primary bg-opacity-10 rounded p-4">
                  <div className="mb-4 text-center">
                    <h2 className="mb-2">Welcome back! </h2>
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-12.jpg"
                      alt="User avatar"
                      className="img-fluid avatar avatar-xxl rounded-pill my-3"
                    />
                    <h6 className="text-dark">Adrian Davies</h6>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="pass-group">
                      <input
                        type={passwordVisibility.password ? "text" : "password"}
                        className="pass-input form-control"
                        required
                        autoComplete="current-password"
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
                  <button type="submit" className="btn btn-primary w-100">
                    Sign In
                  </button>
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="d-flex justify-content-center">
                  <Link href="#" className="me-3 text-gray-9">
                    Terms &amp; Condition
                  </Link>
                  <Link href="#" className="me-3 text-gray-9">
                    Privacy
                  </Link>
                  <Link href="#" className="me-3 text-gray-9">
                    Help
                  </Link>
                </div>
                <div className="p-2 text-center">
                  <p className="mb-0 text-gray-9">Copyright © 2026 - Smarthr</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LockScreenComponent;
