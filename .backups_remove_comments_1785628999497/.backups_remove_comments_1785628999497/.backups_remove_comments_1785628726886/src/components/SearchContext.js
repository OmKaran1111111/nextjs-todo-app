"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const SearchContext = createContext(null);

/**
 * Holds the current search term typed into the topbar so any page can
 * read it and filter its own content live — no navigation to a
 * dedicated search page/route involved.
 */
export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();

  // Clear the term whenever the route changes so a search typed on one
  // page doesn't silently keep filtering an unrelated page.
  useEffect(() => {
    setSearchTerm("");
  }, [pathname]);

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return ctx;
}
