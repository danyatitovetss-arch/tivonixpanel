import { redirect } from "next/navigation";

/** Fallback if middleware did not run; guests → login, session handled in middleware. */
export default function Home() {
  redirect("/login");
}
