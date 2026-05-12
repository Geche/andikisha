"use client";

import { all_routes } from "@/routes/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { useRouter } from "next/navigation";

const ResetPasswordSuccess3 = () => {
  const routes = all_routes;
  const navigation = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigation.push(routes.login);
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
                    <ImageWithBasePath
                      src="assets/img/icons/success-tick.svg"
                      alt="Success tick"
                      className="img-fluid mb-3"
                    />
                    <h2 className="mb-2">Success</h2>
                    <p className="mb-0">
                      Your new password has been successfully saved
                    </p>
                  </div>
                  <div className="mb-3">
                    <button type="submit" className="btn btn-primary w-100">
                      Back to Sign In
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

export default ResetPasswordSuccess3;
