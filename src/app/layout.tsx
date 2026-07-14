import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { GlobalAnnouncementHost } from "@/components/layout/global-announcement-host";
import { AddLeadProvider } from "@/components/leads/add-lead-context";
import { LeadDetailProvider } from "@/components/leads/lead-detail-context";
import { ProspectDetailProvider } from "@/components/prospecting/prospect-detail-context";
import { AccountSheetProvider } from "@/components/layout/account-sheet-context";
import { AppProvider } from "@/lib/store";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-auth-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-auth-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TIVONIX Partners — CRM для партнёров",
  description: "Панель TIVONIX Partners для работы с клиентами партнёров",
  icons: {
    icon: "/images/favikon.png",
    shortcut: "/images/favikon.png",
    apple: "/images/favikon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${interTight.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <AppProvider>
          <AddLeadProvider>
            <LeadDetailProvider>
              <ProspectDetailProvider>
                <AccountSheetProvider>{children}</AccountSheetProvider>
              </ProspectDetailProvider>
            </LeadDetailProvider>
          </AddLeadProvider>
          <GlobalAnnouncementHost />
        </AppProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
