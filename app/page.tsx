import { redirect } from "next/navigation";

// Auth is intentionally disabled for initial testing.
// We'll add the shared PIN gate back once the flow/UI is fully functional.
export default async function HomePage() {
  redirect("/dashboard");
}
