"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { usePathname } from "next/navigation";

interface SearchContextValue {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  addTaskSignal: number;
  requestAddTask: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [addTaskSignal, setAddTaskSignal] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setSearchTerm("");
  }, [pathname]);

  const requestAddTask = () => setAddTaskSignal((n) => n + 1);

  return (
    <SearchContext.Provider
      value={{ searchTerm, setSearchTerm, addTaskSignal, requestAddTask }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return ctx;
}