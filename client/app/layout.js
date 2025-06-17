import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import { SidebarProvider } from "@/contexts/SidebarContext.js";
import AuthProvider from "@/components/auth/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "@/components/ui/sonner";
import { metadata } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased h-screen overflow-hidden">
        <ReduxProvider>
          <AuthProvider>
            <SidebarProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </SidebarProvider>
          </AuthProvider>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
