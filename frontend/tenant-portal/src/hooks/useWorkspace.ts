"use client";

import { useParams } from "next/navigation";

/** Returns the workspace slug from the current `[workspace]` dynamic segment. */
export function useWorkspace(): string {
  const params = useParams();
  return typeof params.workspace === "string" ? params.workspace : "";
}
