import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lovedu",
  description: "An online dating platform aimed at students with features to help improve performance without predatory tactics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full w-full bg-back p-5">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
