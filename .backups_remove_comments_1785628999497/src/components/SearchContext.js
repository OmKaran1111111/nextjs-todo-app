"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();



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
