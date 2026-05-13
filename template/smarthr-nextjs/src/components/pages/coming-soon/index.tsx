"use client";
import Link from "next/link";

import React from "react";

const ComingSoon: React.FC = () => {
  return (
    <div className="coming-soon-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="coming-soon-content">
              <h1 className="display-4 mb-4">Coming Soon</h1>
              <p className="lead mb-5">
                We're working hard to bring you something amazing. Stay tuned!
              </p>
              <div className="countdown-timer mb-5">
                <div className="row">
                  <div className="col-3">
                    <div className="countdown-item">
                      <span className="countdown-number">30</span>
                      <span className="countdown-label">Days</span>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="countdown-item">
                      <span className="countdown-number">12</span>
                      <span className="countdown-label">Hours</span>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="countdown-item">
                      <span className="countdown-number">45</span>
                      <span className="countdown-label">Minutes</span>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="countdown-item">
                      <span className="countdown-number">20</span>
                      <span className="countdown-label">Seconds</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="coming-soon-actions">
                <Link href="/admin-dashboard" className="btn btn-primary me-3">
                  Back to Dashboard
                </Link>
                <button className="btn btn-outline-primary">Notify Me</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
