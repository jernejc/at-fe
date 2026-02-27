import type { Metadata } from "next";
import { Inter, Exo_2 } from "next/font/google";
import { AuthProvider } from "@/lib/auth/provider";
import { PartnerProvider } from "@/components/providers/PartnerProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Nav } from "@/components/nav/Nav";
import { ScrollToTop } from "@/components/ScrollToTop";
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const exo2 = Exo_2({ subsets: ['latin'], weight: ['500'], variable: '--font-display' });

export const metadata: Metadata = {
  title: "LookAcross - Account Intelligence",
  description: "Real-time account intelligence and buying signals for your target companies. No more cold outreach - reach out when they're ready to buy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${exo2.variable}`}>
      <body
        className={`${inter.variable} ${exo2.variable} antialiased`}
      >
        <AuthProvider>
          <PartnerProvider>
            <ThemeProvider>
              <TooltipProvider delay={200}>
                <div className="min-h-screen flex flex-col">
                  <ScrollToTop />
                  <Nav />
                  {children}
                </div>
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </PartnerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
