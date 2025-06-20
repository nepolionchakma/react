import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface IDropDownProps {
  data: string[];
  option: string;
  setOption: React.Dispatch<React.SetStateAction<string>>;
}

export default function CustomDropDown({
  data,
  option,
  setOption,
}: IDropDownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = () => {
    setIsOpen((prev) => !prev);
  };

  const handleChange = (item: string) => {
    setOption(item);
    // setProfileId("");
    setIsOpen(false);
  };
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleSelect}
        className="flex justify-between items-center h-10 py-2 px-3 border rounded-md w-full text-left"
      >
        <span className="text-sm">
          {option ? option : "Select Profile Type"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div
          ref={ref}
          className="flex flex-col items-start border rounded-md shadow-md p-1"
        >
          {data.map((name, i) => {
            return (
              <button
                type="button"
                className={`flex items-center  py-2 px-2 w-full text-left text-sm rounded-md ${
                  name === option && !hovered
                    ? "bg-slate-100"
                    : "hover:bg-slate-100"
                } ${name !== option && hovered ? "hover:bg-slate-100" : ""}`}
                key={i}
                onClick={() => handleChange(name)}
                onMouseEnter={() => {
                  setHovered(true);
                }}
                onMouseLeave={() => {
                  setHovered(false);
                }}
              >
                <span className="w-4">
                  {name == option && <Check size={16} />}
                </span>
                <span className="ml-2">{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
