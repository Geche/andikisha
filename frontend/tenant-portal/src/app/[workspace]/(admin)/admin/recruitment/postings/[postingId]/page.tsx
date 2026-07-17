"use client";

import { useParams } from "next/navigation";
import { CandidatePipelineBoard } from "@/components/recruitment/CandidatePipelineBoard";

export default function CandidatePipelinePage() {
  const params = useParams();
  const postingId = typeof params.postingId === "string" ? params.postingId : "";
  return <CandidatePipelineBoard postingId={postingId} />;
}
