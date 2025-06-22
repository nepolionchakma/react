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
}

export default function SearchInput({
  placeholder,
  query,
  setQuery,
}: SearchInputProps) {
  const handleQuery = (e: string) => {
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
    } else {
      setQuery({ isEmpty: false, value: e });
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
