import Image from "next/image";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata = {
  title: "Create Account - AiGrow",
  description: "Create your AiGrow smart agriculture account",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--background)]">
      {/* Left side: Greenhouse Hero Image */}
      <div className="hidden lg:block lg:w-[48%] xl:w-[50%] relative min-h-screen">
        <Image
          src="/login-bg.png"
          alt="AiGrow Modern Smart Greenhouse"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
        {/* Subtle gradient overlay to blend gently with the right side */}
        <div className="absolute inset-0 bg-gradient-to-l from-[var(--color-primary)]/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Right side: Signup Form */}
      <div className="w-full lg:w-[52%] xl:w-[50%] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--background)] overflow-y-auto">
        <SignupForm />
      </div>
    </main>
  );
}

