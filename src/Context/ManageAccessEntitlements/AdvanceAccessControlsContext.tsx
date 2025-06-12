import { toast } from "@/components/ui/use-toast";
import {
  IManageAccessModelLogicAttributesTypes,
  IManageAccessModelLogicExtendTypes,
  IManageAccessModelLogicsTypes,
  IManageAccessModelSearchFilterTypes,
  IManageAccessModelsTypes,
  IManageGlobalConditionLogicAttributesTypes,
  IManageGlobalConditionLogicExtendTypes,
  IManageGlobalConditionLogicTypes,
  IManageGlobalConditionTypes,
} from "@/types/interfaces/ManageAccessEntitlements.interface";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ControlsContextProvider } from "./ManageControlsContext";
import { IDataSourceTypes } from "@/types/interfaces/datasource.interface";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useGlobalContext } from "../GlobalContext/GlobalContext";
interface IAACContextProviderProps {
  children: React.ReactNode;
}
interface IAACContextTypes {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setStateChange: Dispatch<SetStateAction<number>>;
  stateChange: number;
  isEditModalOpen: boolean;
  setIsEditModalOpen: Dispatch<SetStateAction<boolean>>;
  isOpenManageGlobalConditionModal: boolean;
  setIsOpenManageGlobalConditionModal: Dispatch<SetStateAction<boolean>>;
  fetchManageGlobalConditions: () => Promise<void>;
  getlazyLoadingGlobalConditions: (
    page: number,
    limit: number
  ) => Promise<void>;
  manageGlobalConditions: IManageGlobalConditionTypes[];
  setManageGlobalConditions: Dispatch<
    SetStateAction<IManageGlobalConditionTypes[]>
  >;
  getSearchGlobalConditions: (
    page: number,
    limit: number,
    name: string
  ) => Promise<void>;
  selectedManageGlobalConditionItem: IManageGlobalConditionTypes[];
  setSelectedManageGlobalConditionItem: Dispatch<
    SetStateAction<IManageGlobalConditionTypes[]>
  >;
  createManageGlobalCondition: (
    postData: IManageGlobalConditionTypes
  ) => Promise<boolean>;
  fetchManageGlobalConditionLogics: (
    filterId: number
  ) => Promise<IManageGlobalConditionLogicExtendTypes[] | undefined>;
  manageGlobalConditionTopicData: IManageGlobalConditionLogicExtendTypes[];
  setManageGlobalConditionTopicData: Dispatch<
    SetStateAction<IManageGlobalConditionLogicExtendTypes[]>
  >;
  attrMaxId: number | undefined;
  isActionLoading: boolean;
  setIsActionLoading: Dispatch<SetStateAction<boolean>>;
  manageGlobalConditionDeleteCalculate: (
    id: number
  ) => Promise<IManageGlobalConditionLogicExtendTypes[] | undefined>;
  deleteManageGlobalCondition: (id: number) => Promise<void>;
  deleteLogicAndAttributeData: (
    logicId: number,
    attrId: number
  ) => Promise<number | undefined>;
  deleteGlobalLogicAndAttributeData: (
    logicId: number,
    attrId: number
  ) => Promise<200 | undefined>;

  fetchDefAccessModels: () => Promise<
    IManageAccessModelsTypes[] | [] | undefined
  >;
  lazyLoadingDefAccessModels: (page: number, limit: number) => Promise<void>;
  getSearchAccessModels: (
    page: number,
    limit: number,
    model_name: string
  ) => Promise<void>;
  fetchAccessModelAttributes: () => Promise<void>;
  accessModelLogicAttributes: IManageAccessModelLogicAttributesTypes[];
  manageAccessModels: IManageAccessModelsTypes[] | [];
  setManageAccessModels: Dispatch<SetStateAction<IManageAccessModelsTypes[]>>;
  selectedAccessModelItem: IManageAccessModelsTypes[];
  setSelectedAccessModelItem: Dispatch<
    SetStateAction<IManageAccessModelsTypes[]>
  >;
  createDefAccessModel: (
    postData: IManageAccessModelsTypes
  ) => Promise<boolean>;
  deleteDefAccessModel: (items: IManageAccessModelsTypes[]) => Promise<void>;
  fetchAccessModelLogics: () => Promise<void>;
  fetchDefAccessModelLogics: (
    filterId: number
  ) => Promise<IManageAccessModelLogicExtendTypes[] | undefined>;
  manageAccessModelAttrMaxId: number | undefined;
  maxLogicId: number | undefined;
  maxAccModelAttrId: number;
  manageAccessModelLogicsDeleteCalculate: (
    id: number
  ) => Promise<IManageAccessModelLogicExtendTypes[] | [] | undefined>;
  deleteManageModelLogicAndAttributeData: (
    logicId: number,
    attrId: number
  ) => Promise<number | undefined>;
  searchFilter: (data: IManageAccessModelSearchFilterTypes) => Promise<void>;
  deleteAndSaveState: number;
  setDeleteAndSaveState: Dispatch<SetStateAction<number>>;
  fetchDataSource: () => Promise<void>;
  dataSources: IDataSourceTypes[];
  page: number;
  setPage: Dispatch<React.SetStateAction<number>>;
  totalPage: number;
  setTotalPage: Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  limit: number;
  setLimit: Dispatch<React.SetStateAction<number>>;
}
export const AACContext = createContext<IAACContextTypes | null>(null);

export const useAACContext = () => {
  const consumer = useContext(AACContext);
  if (!consumer) {
    throw new Error("error");
  }
  return consumer;
};
export const AACContextProvider = ({ children }: IAACContextProviderProps) => {
  const { token } = useGlobalContext();
  const api = useAxiosPrivate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stateChange, setStateChange] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [
    isOpenManageGlobalConditionModal,
    setIsOpenManageGlobalConditionModal,
  ] = useState<boolean>(false);
  const [manageGlobalConditions, setManageGlobalConditions] = useState<
    IManageGlobalConditionTypes[]
  >([]);
  const [
    selectedManageGlobalConditionItem,
    setSelectedManageGlobalConditionItem,
  ] = useState<IManageGlobalConditionTypes[]>([]);
  const [manageGlobalConditionTopicData, setManageGlobalConditionTopicData] =
    useState<IManageGlobalConditionLogicExtendTypes[]>([]);
  const [globalConditionAttrMaxId, setGlobalConditionAttrMaxId] =
    useState<number>();
  const [manageAccessModelAttrMaxId, setManageAccessModelAttrMaxId] =
    useState<number>();
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [selectedAccessModelItem, setSelectedAccessModelItem] = useState<
    IManageAccessModelsTypes[]
  >([]);
  const [manageAccessModels, setManageAccessModels] = useState<
    IManageAccessModelsTypes[]
  >([]);
  const [deleteAndSaveState, setDeleteAndSaveState] = useState<number>(0);
  const [dataSources, setDataSources] = useState<IDataSourceTypes[]>([]);
  const [maxAccModelAttrId, setMaxAccModelAttrId] = useState<number>(0);
  const [accessModelLogicAttributes, setAccessModelLogicAttributes] = useState<
    IManageAccessModelLogicAttributesTypes[]
  >([]);
  const [maxLogicId, setMaxLogicId] = useState<number>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const maxId = async () => {
      if (token?.user_id === 0) return;
      const [resGlobalCondition, resManageAccessModel] = await Promise.all([
        api.get(`/def-global-condition-logic-attributes`),
        api.get(`/def-access-model-logic-attributes`),
      ]);
      const maxIdGlobalCondition = Math.max(
        ...resGlobalCondition.data.map(
          (data: IManageGlobalConditionLogicAttributesTypes) => data.id
        )
      );
      const maxIdManageAccessModel = Math.max(
        ...resManageAccessModel.data.map(
          (data: IManageAccessModelLogicAttributesTypes) => data.id
        )
      );
      if (resGlobalCondition.data.length > 0) {
        console.log(maxIdGlobalCondition, "maxId");
        setGlobalConditionAttrMaxId(maxIdGlobalCondition);
      } else {
        setGlobalConditionAttrMaxId(0);
      }
      if (resManageAccessModel.data.length > 0) {
        setManageAccessModelAttrMaxId(maxIdManageAccessModel);
      } else {
        setManageAccessModelAttrMaxId(0);
      }
    };
    maxId();
  }, [api, token?.user_id]);

  useEffect(() => {
    const maxLogicId = async () => {
      const result = await api.get("/def-access-model-logics");
      if (result && result.data > 0) {
        const maxAccessLogicId = Math.max(
          ...result.data.map(
            (data: IManageAccessModelLogicsTypes) =>
              data.def_access_model_logic_id
          )
        );
        setMaxLogicId(maxAccessLogicId);
      } else {
        setMaxLogicId(0);
      }
    };
    maxLogicId();
  }, []);

  useEffect(() => {
    const maxAttrId = async () => {
      const result = await api.get("/def-access-model-logic-attributes");
      if (result && result.data.length > 0) {
        const maxAccessAttrId = Math.max(
          ...result.data.map(
            (data: IManageAccessModelLogicAttributesTypes) => data.id
          )
        );
        setMaxAccModelAttrId(maxAccessAttrId);
      } else {
        setMaxAccModelAttrId(0);
      }
    };
    maxAttrId();
  }, []);

  // def Global Conditions
  const fetchManageGlobalConditions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<IManageGlobalConditionTypes[]>(
        `/def-global-conditions`
      );
      if (response) {
        return setManageGlobalConditions(response.data ?? []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getlazyLoadingGlobalConditions = async (
    page: number,
    limit: number
  ) => {
    try {
      setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/def-global-conditions/${page}/${limit}`
      );
      setManageGlobalConditions(resultLazyLoading.data.items);
      setTotalPage(resultLazyLoading.data.pages);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // search global condition
  const getSearchGlobalConditions = async (
    page: number,
    limit: number,
    name: string
  ) => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/def-global-conditions/search/${page}/${limit}?name=${name}`
      );
      setTotalPage(response.data.pages);
      setManageGlobalConditions(response.data.items);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createManageGlobalCondition = async (
    postData: IManageGlobalConditionTypes
  ) => {
    const { name, datasource, description, status } = postData;
    try {
      setIsLoading(true);
      const res = await api.post<{ message: string }>(
        `/def-global-conditions`,
        { name, datasource, description, status }
      );
      if (res.status === 201) {
        setStateChange((prev) => prev + 1);
        toast({
          description: res.data.message,
        });
        setIsOpenManageGlobalConditionModal(false);
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const fetchManageGlobalConditionLogics = async (filterId: number) => {
    try {
      setIsLoading(true);
      const [logicsRes, attributesRes] = await Promise.all([
        api.get<IManageGlobalConditionLogicTypes[]>(
          `/def-global-condition-logics`
        ),
        api.get<IManageGlobalConditionLogicAttributesTypes[]>(
          `/def-global-condition-logic-attributes`
        ),
      ]);
      const attributesMap = new Map(
        attributesRes.data.map((attr) => [
          attr.def_global_condition_logic_id,
          attr,
        ])
      );
      const mergedData = logicsRes.data.map((item) => ({
        ...item,
        ...(attributesMap.get(item.def_global_condition_logic_id) || {}),
      }));
      const filteredData = mergedData.filter(
        (item) => item.def_global_condition_id === filterId
      );
      // return (filteredData as IManageGlobalConditionLogicExtendTypes[]) ?? [];
      if (filteredData) {
        return filteredData as IManageGlobalConditionLogicExtendTypes[];
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const manageGlobalConditionDeleteCalculate = async (id: number) => {
    try {
      const result = await fetchManageGlobalConditionLogics(id);
      return result;
    } catch (error) {
      console.log(error);
    }
  };
  const deleteManageGlobalCondition = async (id: number) => {
    api
      .delete(`/def-global-conditions/${id}`)
      .then((res) => {
        if (res.status === 200) {
          toast({
            description: res.data.message,
          });
        }
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      })
      .finally(() => {
        setStateChange((prev) => prev + 1);
      });
  };
  const deleteLogicAndAttributeData = async (
    logicId: number,
    attrId: number
  ) => {
    try {
      const [isExistLogicId, isExistAttrId] = await Promise.all([
        api.delete(`/def-access-model-logics/${logicId}`),
        api.delete(`/def-access-model-logic-attributes/${attrId}`),
      ]);
      if (isExistLogicId.status === 200 && isExistAttrId.status === 200) {
        return isExistLogicId.status;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const deleteGlobalLogicAndAttributeData = async (
    logicId: number,
    attrId: number
  ) => {
    try {
      const [isExistLogicId, isExistAttrId] = await Promise.all([
        api.delete(`/def-global-condition-logics/${logicId}`),
        api.delete(`/def-global-condition-logic-attributes/${attrId}`),
      ]);
      if (isExistLogicId.status === 200 && isExistAttrId.status === 200) {
        return isExistLogicId.status;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // fetch Access Models
  const fetchDefAccessModels = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<IManageAccessModelsTypes[]>(
        `/def-access-models`
      );
      if (response) {
        const totalCount = response.data.length;
        const totalPages = Math.ceil(totalCount / limit);

        const startIndex = (page - 1) * limit;
        const paginatedData = response.data.slice(
          startIndex,
          startIndex + limit
        );
        setTotalPage(totalPages);
        setCurrentPage(page);
        const formattedData = paginatedData.map((data) => {
          const [day, month, year] = (data?.last_run_date ?? "01-01-1970")
            .split(" ")[0]
            .split("-");

          const formatteDate = `${year}-${month}-${day}`;
          return { ...data, last_run_date: formatteDate };
        });
        setManageAccessModels(formattedData);

        return response.data ?? [];
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // lazy loading Access models
  const lazyLoadingDefAccessModels = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const response = await api.get<{
        items: IManageAccessModelsTypes[];
        pages: number;
        page: number;
      }>(`/def-access-models/${page}/${limit}`);
      if (response) {
        setTotalPage(response.data.pages);
        setCurrentPage(response.data.page);
        setManageAccessModels(response.data.items);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // search access model
  const getSearchAccessModels = async (
    page: number,
    limit: number,
    model_name: string
  ) => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/def-access-models/search/${page}/${limit}?model_name=${model_name}`
      );
      setTotalPage(response.data.pages);
      setManageAccessModels(response.data.items);
      setCurrentPage(response.data.page);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create Acces Model
  const createDefAccessModel = async (postData: IManageAccessModelsTypes) => {
    try {
      setIsLoading(true);
      const res = await api.post(`/def-access-models`, postData);
      if (res.status === 201) {
        setStateChange((prev) => prev + 1);
        toast({
          description: res.data.message,
        });
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        toast({
          description: error.message,
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // delete Access Model
  const deleteDefAccessModel = async (items: IManageAccessModelsTypes[]) => {
    for (const item of items) {
      const { def_access_model_id: id } = item;
      api
        .delete(`/def-access-models/${id}`)
        .then((res) => {
          if (res.status === 200) {
            toast({
              description: res.data.message,
            });
          }
        })
        .catch((error) => {
          if (error instanceof Error) {
            toast({
              description: error.message,
              variant: "destructive",
            });
          }
        })
        .finally(() => {
          setStateChange((prev) => prev + 1);
        });
    }
  };

  // fetch access model logics
  const fetchAccessModelLogics = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<IManageAccessModelLogicsTypes[]>(
        `/def-access-model-logics`
      );
      const maxId = Math.max(
        ...response.data.map((data) => data.def_access_model_logic_id)
      );
      setMaxLogicId(maxId);
      console.log(maxId, "context");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  // Manage Access Model Logics
  const fetchDefAccessModelLogics = async (filterId: number) => {
    try {
      setIsLoading(true);
      const [logicsRes, attributesRes] = await Promise.all([
        api.get<IManageAccessModelLogicsTypes[]>(`/def-access-model-logics`),
        api.get<IManageAccessModelLogicAttributesTypes[]>(
          `/def-access-model-logic-attributes`
        ),
      ]);
      const attributesMap = new Map(
        attributesRes.data.map((attr) => [attr.def_access_model_logic_id, attr])
      );
      const mergedData = logicsRes.data.map((item) => ({
        ...item,
        ...(attributesMap.get(item.def_access_model_logic_id) || {}),
      }));
      const filteredData = mergedData.filter(
        (item) => item.def_access_model_id === filterId
      );
      // return (filteredData as IManageGlobalConditionLogicExtendTypes[]) ?? [];
      if (filteredData) {
        return filteredData as IManageAccessModelLogicExtendTypes[];
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const manageAccessModelLogicsDeleteCalculate = async (id: number) => {
    try {
      const result = await fetchDefAccessModelLogics(id);
      return result ?? [];
    } catch (error) {
      console.log(error);
    }
  };
  const deleteManageModelLogicAndAttributeData = async (
    logicId: number,
    attrId: number
  ) => {
    try {
      const [isExistLogicId, isExistAttrId] = await Promise.all([
        api.delete(`/manage-access-model-logics/${logicId}`),
        api.delete(`/manage-access-model-logic-attributes/${attrId}`),
      ]);
      if (isExistLogicId.status === 200 && isExistAttrId.status === 200) {
        return isExistLogicId.status;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // fetch access model attribute
  const fetchAccessModelAttributes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<IManageAccessModelLogicAttributesTypes[]>(
        `/def-access-model-logic-attributes`
      );
      setAccessModelLogicAttributes(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search Filter
  const searchFilter = async (data: IManageAccessModelSearchFilterTypes) => {
    const allAccessModel = await fetchDefAccessModels();

    const filterResult = allAccessModel?.filter((item) => {
      setIsLoading(true);
      // Check if each filter condition is satisfied
      const matchesModelName =
        data.model_name.length === 0 ||
        item.model_name.toLowerCase().includes(data.model_name.toLowerCase());
      const matchesCreatedBy =
        data.created_by.length === 0 ||
        item.created_by.toLowerCase().includes(data.created_by.toLowerCase());
      const matchesState =
        data.state.length === 0 ||
        item.state.toLowerCase().includes(data.state.toLowerCase());
      const matchesDate =
        data.last_run_date.length === 0 ||
        // item.last_run_date.includes(data.last_run_date);
        // console.log(matchesModelName);
        // console.log(matchesDate);
        setIsLoading(false);
      // Return true only if all conditions are met
      return (
        matchesModelName && matchesCreatedBy && matchesState && matchesDate
      );
    });

    setManageAccessModels(filterResult ?? []);
    // return filterResult ?? [];
  };

  // Data Source
  const fetchDataSource = async () => {
    await api.get<IDataSourceTypes[]>(`/def-data-sources`).then((res) => {
      if (res.status === 200) {
        setDataSources(res.data);
      }
    });
  };

  const value = {
    isLoading,
    setIsLoading,
    setStateChange,
    stateChange,
    isEditModalOpen,
    setIsEditModalOpen,
    isOpenManageGlobalConditionModal,
    setIsOpenManageGlobalConditionModal,
    fetchManageGlobalConditions,
    getlazyLoadingGlobalConditions,
    getSearchGlobalConditions,
    manageGlobalConditions,
    setManageGlobalConditions,
    selectedManageGlobalConditionItem,
    setSelectedManageGlobalConditionItem,
    createManageGlobalCondition,
    fetchManageGlobalConditionLogics,
    manageGlobalConditionTopicData,
    setManageGlobalConditionTopicData,
    attrMaxId: globalConditionAttrMaxId,
    isActionLoading,
    setIsActionLoading,
    manageGlobalConditionDeleteCalculate,
    deleteManageGlobalCondition,
    deleteLogicAndAttributeData,
    deleteGlobalLogicAndAttributeData,
    manageAccessModels,
    setManageAccessModels,
    fetchDefAccessModels,
    lazyLoadingDefAccessModels,
    getSearchAccessModels,
    selectedAccessModelItem,
    setSelectedAccessModelItem,
    createDefAccessModel,
    deleteDefAccessModel,
    fetchAccessModelLogics,
    fetchDefAccessModelLogics,
    fetchAccessModelAttributes,
    accessModelLogicAttributes,
    manageAccessModelAttrMaxId,
    maxLogicId,
    maxAccModelAttrId,
    manageAccessModelLogicsDeleteCalculate,
    deleteManageModelLogicAndAttributeData,
    searchFilter,
    deleteAndSaveState,
    setDeleteAndSaveState,
    fetchDataSource,
    dataSources,
    page,
    setPage,
    totalPage,
    setTotalPage,
    currentPage,
    limit,
    setLimit,
  };
  return (
    <AACContext.Provider value={value}>
      <ControlsContextProvider>{children}</ControlsContextProvider>
    </AACContext.Provider>
  );
};
