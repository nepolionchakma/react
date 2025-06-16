import { useEffect } from "react";
import { Input } from "../ui/input";

interface SearchInputProps {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: (q: string) => Promise<void>;
}

export default function SearchInput({
  placeholder,
  page,
  query,
  setQuery,
  setIsLoading,
  setPage,
  handleSearch,
}: SearchInputProps) {
  useEffect(() => {
    if (query.trim() !== "") {
      setPage(1);
    }
  }, [query]);

  console.log(query);

  useEffect(() => {
    const debounceDelay = setTimeout(async () => {
      try {
        setIsLoading(true);
        await handleSearch(query);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(debounceDelay);
  }, [query, page]);

  return (
    <Input
      placeholder={placeholder}
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
