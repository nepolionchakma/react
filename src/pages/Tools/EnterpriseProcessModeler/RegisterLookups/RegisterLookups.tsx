import { useState } from "react";
import LookupTable from "./LookupTable/LookupTable";
import LookupValueTable from "./LookupValueTable/LookupValueTable";
import { ILookup } from "@/types/interfaces/orchestration.interface";

const RegisterLookups = () => {
  const [lookupLimit, setLookupLimit] = useState<number>(4);
  const [selectedLookup, setSelectedLookup] = useState<ILookup | undefined>(
    undefined,
  );
  return (
    <div>
      <LookupTable
        lookupLimit={lookupLimit}
        setLookupLimit={setLookupLimit}
        selectedLookup={selectedLookup}
        setSelectedLookup={setSelectedLookup}
      />
      <LookupValueTable selectedLookup={selectedLookup} />
    </div>
  );
};

export default RegisterLookups;
