// Landing route — send users straight to login. (Auth-aware routing can be added
// later; for now the dashboard handles the unauthenticated case via the API.)

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");
}
