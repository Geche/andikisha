"use client";
import dynamic from 'next/dynamic';
import React from 'react'
const AssetDashboardComponent = dynamic(
  () => import("@/components/mainMenu/asset-dashboard/assetDashboard"),
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
const AssetDashboardClient = () => {
  return (
    <><AssetDashboardComponent/></>
  )
}

export default AssetDashboardClient