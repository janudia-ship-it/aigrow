import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-scaffold-light)] text-center">
      <h2 className="text-4xl font-extrabold text-[var(--color-primary)] mb-2">404</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        The page you are looking for does not exist.
      </p>
      <Link href="/login">
        <Button variant="default" shape="pill">
          Back to Login
        </Button>
      </Link>
    </div>
  );
}
