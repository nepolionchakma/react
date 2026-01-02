import { Input } from "../ui/input";

interface SearchInputProps {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function SearchInput({
  placeholder,
  query,
  setQuery,
  setPage,
}: SearchInputProps) {
  const handleQuery = (e: string) => {
    setQuery(e);
    setPage(1);
  };

  return (
    <Input
      className="w-[24rem] px-4 py-2"
      placeholder={placeholder}
      type="text"
      value={query}
      onChange={(e) => handleQuery(e.target.value)}
    />
  );
}
