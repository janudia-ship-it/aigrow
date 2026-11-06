import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Login - AiGrow",
  description: "Sign in to AiGrow smart agriculture platform",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--background)]">
      {/* Left side: Form */}
      <div className="w-full lg:w-[48%] xl:w-[44%] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--background)]">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
      {/* Right side: Greenhouse Hero Image */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[56%] relative min-h-screen">
        <Image
          src="/login-bg.png"
          alt="AiGrow Modern Greenhouse"
          fill
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-cover"
          priority
        />
        {/* Subtle gradient overlay to blend gently with the left side border */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 via-transparent to-transparent pointer-events-none" />
      </div>
    </main>
  );
}

