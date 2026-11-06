export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      {children}
    </div>
  );
}

