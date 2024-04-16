import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Roboto({weight: "500", subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Lovedu",
  description: "An online dating platform aimed at students with features to help improve performance without predatory tactics",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <html lang="en" className="h-full w-full bg-back p-5">
            <body className={inter.className}>
                <Toaster/>
                <div className="flex flex-col w-full h-full items-center ">
                    <div className="w-full max-w-[400px] h-full">
                        {children}
                        <div className="h-5"/>
                    </div>
                </div>
            </body>
        </html>
    );
}
