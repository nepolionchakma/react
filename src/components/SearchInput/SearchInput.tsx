import { Input } from "../ui/input";

interface SearchInputProps {
  query: {
    isEmpty: boolean;
    value: string;
  };
  setQuery: React.Dispatch<
    React.SetStateAction<{
      isEmpty: boolean;
      value: string;
    }>
  >;
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
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
      setPage(1);
    } else {
      setQuery({ isEmpty: false, value: e });
      setPage(1);
    }
  };

  return (
    <Input
      className="w-[24rem] px-4 py-2"
      placeholder={placeholder}
      type="text"
      value={query.value}
      onChange={(e) => handleQuery(e.target.value)}
    />
  );
}
