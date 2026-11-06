import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";

export default async function HomePage() {
  const { user } = await getAuthSession();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}

