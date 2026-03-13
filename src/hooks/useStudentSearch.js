import { useState, useMemo, useCallback } from "react";
import { fuzzyMatch } from "../lib/utils";

export function useStudentSearch(students) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("nombre"); // "nombre" | "cedula"

  const results = useMemo(() => {
    const q = query.trim();
    if (!q || q.length < 2) return [];

    return students.filter((s) => {
      if (searchType === "cedula") {
        return String(s.cedula).includes(q);
      }
      return fuzzyMatch(s.nombreCompleto, q);
    });
  }, [students, query, searchType]);

  const handleSearch = useCallback((value) => {
    setQuery(value);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return { query, searchType, setSearchType, results, handleSearch, clearSearch };
}
