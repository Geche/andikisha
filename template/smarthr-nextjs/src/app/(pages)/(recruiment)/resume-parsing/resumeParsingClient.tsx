"use client";

import dynamic from "next/dynamic";

const ResumeParsingComponent = dynamic(
  () => import("@/components/recruitment/resume-parsing/resumeParsing"),
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
const ResumeParsingClient = () => {
  return (
    <><ResumeParsingComponent/></>
  )
}

export default ResumeParsingClient