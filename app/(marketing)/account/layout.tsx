export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      {children}
    </main>
  );
}
