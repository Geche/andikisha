
"use client";

import Link from 'next/link';
import ImageWithBasePath from '../common/imageWithBasePath';
import { all_routes } from '@/routes/all_routes';

const SuccesContacts = () => {
 
  return (
    <>
      {/* Success Contact */}
      <div className="modal fade" id="success_compay">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-body pb-0">
              <div className="p-4">
                <div className="row">
                  <div className="col-md-12">
                    <div className="d-flex flex-column align-items-center justify-content-center mb-3">
                      <ImageWithBasePath
                        src="assets/img/reports-img/check-icon.svg"
                        alt="icon"
                        className="mb-3"
                      />
                      <h5>Company Added Successfully</h5>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <Link
                        href={all_routes.companiesList}
                        className="btn btn-dark d-flex justify-content-center "
                      >
                        Back to List
                      </Link>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <Link
                        href={all_routes.companiesDetails}
                        className="btn btn-primary bg-primary-gradient d-flex justify-content-center "
                      >
                        Detail Page
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Success Contact */}
    </>

  )
}

export default SuccesContacts
