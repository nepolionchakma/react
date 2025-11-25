import { IControlsTypes } from "@/types/interfaces/manageControls.interface";
import { createContext, useContext, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useGlobalContext } from "../GlobalContext/GlobalContext";
import { loadData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
interface IControlsProviderProps {
  children: React.ReactNode;
}
interface IControlsContextTypes {
  selectedControl: IControlsTypes[];
  setSelectedControl: React.Dispatch<React.SetStateAction<IControlsTypes[]>>;
  fetchControls: () => Promise<IControlsTypes[] | undefined>;
  getControls: (
    page: number,
    limit: number,
    control_name: string
  ) => Promise<IControlsTypes[] | undefined>;
  getSearchControls: (
    page: number,
    limit: number,
    query: string
  ) => Promise<IControlsTypes[] | undefined>;
  controlsData: IControlsTypes[];
  searchFilter: (data: ISearchTypes) => void;
  createControl: (data: IControlsTypes) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  stateChange: number;
  setStateChange: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}
interface ISearchTypes {
  match: string;
  control_name: string;
  control_type: string;
  priority: string;
  datasources: string;
}
const ControlsContext = createContext<IControlsContextTypes | null>(null);
export const useControlsContext = () => {
  const consumer = useContext(ControlsContext);
  if (!consumer) {
    throw new Error("error");
  }
  return consumer;
};
export const ControlsContextProvider = ({
  children,
}: IControlsProviderProps) => {
  const { token } = useGlobalContext();
  // const { setIsLoading } = useAACContext();
  const FLASK_ENDPOINT_URL = import.meta.env.VITE_FLASK_ENDPOINT_URL;
  const [controlsData, setControlsData] = useState<IControlsTypes[]>([]);
  const [selectedControl, setSelectedControl] = useState<IControlsTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stateChange, setStateChange] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Controls
  const fetchControls = async () => {
    try {
      const response = await loadData({
        baseURL: FLASK_URL,
        url: flaskApi.DefControls,
        accessToken: token.access_token,
      });
      if (response) {
        setControlsData(response ?? []);
        return response ?? [];
      }
    } catch (error) {
      console.log(error);
    }
  };
  // Controls
  const getControls = async (
    page: number,
    limit: number,
    control_name: string
  ) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${FLASK_ENDPOINT_URL}/def_controls?control_name=${control_name}&page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      setTotalPages(res.data.pages);
      return res.data.result ?? [];
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const getSearchControls = async (
    page: number,
    limit: number,
    query: string
  ) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${FLASK_ENDPOINT_URL}/def_controls/search/${page}/${limit}?control_name=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      setTotalPages(res.data.pages);
      return res.data.items ?? [];
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const createControl = async (data: IControlsTypes) => {
    try {
      const res = await axios.post(`${FLASK_ENDPOINT_URL}/def_controls`, data, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      if (res.status === 201) {
        toast({
          description: `${res.data.message}`,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    }
  };

  const searchFilter = async (data: ISearchTypes) => {
    const allControls = await fetchControls();

    const filterResult = allControls?.filter((item: IControlsTypes) => {
      setIsLoading(true);
      // Check if each filter condition is satisfied
      const matchesControlName =
        data.control_name.length === 0 ||
        item.control_name
          .toLowerCase()
          .includes(data.control_name.toLowerCase());
      const matchesControlType =
        data.control_type.length === 0 ||
        item.control_type
          .toLowerCase()
          .includes(data.control_type.toLowerCase());
      const matchesPriority =
        data.priority.length === 0 ||
        String(item.priority).includes(data.priority);
      const matchesDatasources =
        data.datasources.length === 0 ||
        item.datasources.toLowerCase().includes(data.datasources.toLowerCase());

      setIsLoading(false);
      // Return true only if all conditions are met
      return (
        matchesControlName &&
        matchesControlType &&
        matchesPriority &&
        matchesDatasources
      );
    });
    setControlsData(filterResult ?? []);
    // return filterResult ?? [];
  };

  const value = {
    selectedControl,
    setSelectedControl,
    fetchControls,
    getControls,
    getSearchControls,
    controlsData,
    searchFilter,
    createControl,
    isLoading,
    setIsLoading,
    stateChange,
    setStateChange,
    totalPages,
  };
  return (
    <ControlsContext.Provider value={value}>
      {children}
    </ControlsContext.Provider>
  );
};
