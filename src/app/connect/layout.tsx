import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css"; // Imports global styles

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Connect to Your Bank", // Changed title for better context
  description: "Search and connect to your financial institution.",
};

export default function ConnectLayout({ // Renamed for clarity, assuming this is specific to /connect
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} // Applies font variables
      >
        {children}
      </body>
    </html>
  );
}