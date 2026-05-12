"use client";
import dynamic from 'next/dynamic';
import React from 'react'
const CampusHiringComponent = dynamic(
  () => import("@/components/recruitment/campus-hiring/campusHiring"),
  {
    ssr: false,
    loading: () => (
      <div>
        <div id="global-loader">
          <div className="whirly-loader"> </div>
        </div>
      </div>
    ),
  },
);
const CampusHiringClient = () => {
  return (
    <><CampusHiringComponent/></>
  )
}

export default CampusHiringClient