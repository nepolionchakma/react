import React from "react";
import { toast } from "../ui/use-toast";

interface RowsProps {
  limit: number;
  setLimit: (value: React.SetStateAction<number>) => void;
}

function Rows({ limit, setLimit }: RowsProps) {
  const handleRow = (value: number) => {
    if (value < 1) {
      toast({
        title: "The value must be greater than 0",
        variant: "destructive",
      });
      return;
    } else {
      setLimit(value);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };
  return (
    <div className="flex gap-2 items-center ml-auto">
      <h3>Rows :</h3>
      <input
        type="number"
        placeholder="Rows"
        value={limit}
        min={1}
        onChange={(e) => handleRow(Number(e.target.value))}
        onFocus={handleFocus}
        className="w-14 border rounded-md p-2"
      />
    </div>
  );
}

export default Rows;
