import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface IDropDownProps {
  profileType: string;
  setProfileId: React.Dispatch<React.SetStateAction<string>>;
  setProfileType: React.Dispatch<React.SetStateAction<string>>;
}

const profileTypes = ["Email", "Mobile Number", "GUID"];

export default function CustomDropDown({
  profileType,
  setProfileType,
  setProfileId,
}: IDropDownProps) {
  const [isSelect, setIsSelect] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSelect = () => {
    setIsSelect((prev) => !prev);
  };

  const handleChange = (item: string) => {
    setProfileType(item);
    setProfileId("");
    setIsSelect(false);
  };
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleSelect}
        className="flex justify-between items-center h-10 py-2 px-3 border rounded-md w-full text-left"
      >
        <span className="text-sm">
          {profileType ? profileType : "Select Profile Type"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isSelect && (
        <div className="flex flex-col items-start border rounded-md shadow-md p-1">
          {profileTypes.map((name, i) => {
            return (
              <button
                type="button"
                className={`flex items-center  py-2 px-2 w-full text-left text-sm rounded-md ${
                  name === profileType && !hovered
                    ? "bg-slate-100"
                    : "hover:bg-slate-100"
                } ${
                  name !== profileType && hovered ? "hover:bg-slate-100" : ""
                }`}
                key={i}
                onClick={() => handleChange(name)}
                onMouseEnter={() => {
                  setHovered(true);
                  console.log("dd");
                }}
                onMouseLeave={() => {
                  setHovered(false);
                }}
              >
                <span className="w-4">
                  {name == profileType && <Check size={16} />}
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
