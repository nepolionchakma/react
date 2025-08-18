import React from "react";
import { toast } from "../ui/use-toast";

interface DaysProps {
  days: number;
  setDays: (value: React.SetStateAction<number>) => void;
}

function Days({ days, setDays }: DaysProps) {
  const handleRow = (value: number) => {
    if (value < 1) {
      toast({
        title: "The value must be greater than 0",
        variant: "destructive",
      });
      return;
    } else {
      setDays(value);
    }
  };

  const inputRef = React.useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).select();
    }
  };

  return (
    <div className="flex gap-2 items-center ml-auto">
      <h3>Days :</h3>
      <input
        type="number"
        placeholder="Rows"
        value={days}
        min={1}
        // max={20}
        ref={inputRef}
        onClick={handleClick}
        onChange={(e) => handleRow(Number(e.target.value))}
        className="w-20 border rounded p-2"
      />
    </div>
  );
}

export default Days;
