import dns from "node:dns/promises";
 dns.setServers(["1.1.1.1", "8.8.8.8"]);
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TechVerse MPI - Information & Communication Management System",
  description: "Centralized Digital Information, Notice, Routine, and Communication Platform for TechVerse MPI College",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

