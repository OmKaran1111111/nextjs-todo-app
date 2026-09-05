import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Work_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/layout/topbar";
import Footer from "@/components/layout/footer";
import { SearchProvider } from "@/components/SearchContext";
import { SessionProvider } from "next-auth/react";

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  weight: ["600", "700"],
  subsets: ["latin"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "Todo App",
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col text-body bg-bg" style={{ fontFamily: "var(--font-sans)" }}>
        <SessionProvider>
          <SearchProvider>
            <TopBar />
            <div id="page-content">{children}</div>
            <Footer />
          </SearchProvider>
        </SessionProvider>
      </body>
    </html>
  );
}