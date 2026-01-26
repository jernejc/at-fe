import { Header } from "@/components/ui/Header";

export default function PartnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Header />
      <main className="flex flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
