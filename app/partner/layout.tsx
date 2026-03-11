"use client";

export default function PartnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-1 overflow-y-auto">
      {children}
    </main>
  );
}
