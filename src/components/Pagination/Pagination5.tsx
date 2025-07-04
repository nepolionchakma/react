import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "../ui/use-toast";

interface Pagination4Props {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPageNumbers: number;
}

const Pagination5 = ({
  currentPage,
  setCurrentPage,
  totalPageNumbers,
}: Pagination4Props) => {
  const [goToPage, setGoToPage] = useState<number>(currentPage);
  const handleNext = () => {
    if (totalPageNumbers > currentPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleLast = () => {
    setCurrentPage(totalPageNumbers);
  };

  const handleFirst = () => {
    setCurrentPage(1);
  };
  const handleSetCurrentPage = (value: number) => {
    if (value > totalPageNumbers) {
      toast({
        title: `${value} is not a valid page number.`,
        variant: "destructive",
        description: "Please enter a valid page number.",
      });
      return;
    } else {
      setCurrentPage(value);
    }
  };
  const handleChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setGoToPage(parseInt(e.target.value));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSetCurrentPage(goToPage);
  };
  useEffect(() => {
    setGoToPage(currentPage);
  }, [currentPage]);

  const inputRef = React.useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).select();
    }
  };
  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={handleFirst}
        className={
          currentPage === 1
            ? "p-1 rounded-md bg-winter-100/30"
            : "p-1 rounded-md bg-winter-100"
        }
        disabled={currentPage === 1}
      >
        <ChevronFirst
          strokeWidth={1.5}
          size={15}
          className={currentPage === 1 ? "text-slate-300" : "text-black"}
        />
      </button>
      <button
        onClick={handlePrevious}
        className={
          currentPage === 1
            ? "p-1 rounded-md bg-winter-100/30"
            : "p-1 rounded-md bg-winter-100"
        }
        disabled={currentPage === 1}
      >
        <ChevronLeft
          strokeWidth={1.5}
          size={15}
          className={currentPage === 1 ? "text-slate-300" : "text-black"}
        />
      </button>
      <div className="flex gap-2 items-center">
        <span>Page</span>
        {/* <input
          className="border rounded-md px-2"
          type="number"
          value={currentPage}
          min={1}
          max={Math.max(totalPageNumbers > 0 ? totalPageNumbers : 0)}
          onChange={(e) => handleSetCurrentPage(e.target.value)}
        /> */}
        <form onSubmit={handleSubmit}>
          <input
            value={goToPage}
            type="number"
            min={1}
            max={Math.max(totalPageNumbers > 0 ? totalPageNumbers : 0)}
            ref={inputRef}
            onClick={handleClick}
            className="border rounded-md px-2"
            onChange={handleChangeNumber}
          />
        </form>
        <div className="flex gap-2 items-center">
          of <span className="block">{totalPageNumbers}</span>
        </div>
      </div>

      {/* <select
        value={currentPage}
        className=" px-1 bg-winter-100 rounded-md"
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setCurrentPage(parseInt(e.target.value))
        }
        disabled={paginationArray.length === 1}
      >
        {paginationArray.map((page) => (
          <option className="bg-white" key={page} value={page}>
            {page}
          </option>
        ))}
      </select> */}
      <button
        onClick={handleNext}
        className={
          currentPage === totalPageNumbers
            ? "p-1 rounded-md bg-winter-100/30"
            : "p-1 rounded-md bg-winter-100"
        }
        disabled={currentPage === totalPageNumbers}
      >
        <ChevronRight
          strokeWidth={1.5}
          size={15}
          className={
            currentPage === totalPageNumbers ? "text-slate-300" : "text-black"
          }
        />
      </button>
      <button
        onClick={handleLast}
        className={
          currentPage === totalPageNumbers
            ? "p-1 rounded-md bg-winter-100/30"
            : "p-1 rounded-md bg-winter-100"
        }
        disabled={currentPage === totalPageNumbers}
      >
        <ChevronLast
          strokeWidth={1.5}
          size={15}
          className={
            currentPage === totalPageNumbers ? "text-slate-300" : "text-black"
          }
        />
      </button>
    </div>
  );
};

export default Pagination5;
