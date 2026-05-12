"use client";
import dynamic from 'next/dynamic';
import React from 'react'
const TenantUsageMetricsComponent = dynamic(
  () => import("@/components/super-admin/tenant-usage-metrics/tenantUsageMetrics"),
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
const TenantUsageMetricsClient = () => {
  return (
    <><TenantUsageMetricsComponent/></>
  )
}

export default TenantUsageMetricsClient