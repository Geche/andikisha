import { redirect } from "next/navigation";

// Platform portal root redirects to login until A.5 wires the shell.
export default function RootPage() {
  redirect("/login");
}
