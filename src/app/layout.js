import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/topbar";
import Footer from "@/components/footer";
import { SearchProvider } from "@/components/SearchContext";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  weight: ["600", "700"],
  subsets: ["latin"],
});

export const metadata = {
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolage.variable} h-full antialiased`}
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
