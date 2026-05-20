import { redirect } from "next/navigation";

// Bare "/" → ask-when-missing workspace screen.
export default function Home() {
  redirect("/login");
}
