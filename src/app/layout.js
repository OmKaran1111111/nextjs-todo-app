import { Newsreader, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/topbar";
import Footer from "@/components/footer";
import { SearchProvider } from "@/components/SearchContext";
import { SessionProvider } from "next-auth/react";
import useIsDesktop from "@/hooks/useIsDesktop";
const newsreader = Newsreader({
  variable: "--font-display",
  style: ["italic"],
  weight: ["500", "600"],
  subsets: ["latin"],
});
const isDesktop=useIsDesktop;
const bricolage = Bricolage_Grotesque({
  variable: "--font-sans",
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
      className={`${newsreader.variable} ${bricolage.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head></head>
      <body className="min-h-full flex flex-col text-body" style={{ fontFamily: "var(--font-sans)" }}>
        <video className="site-bg-video bg-video-light" autoPlay muted loop playsInline>
          <source src="/videos/light-bg.mp4" type="video/mp4" />
        </video>
        <video className="site-bg-video bg-video-dark" autoPlay muted loop playsInline>
          <source src="/videos/dark-bg.mp4" type="video/mp4" />
        </video>
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