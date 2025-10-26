import { toast } from "@/components/ui/use-toast";
import {
  IManageAccessModelLogicAttributesTypes,
  IManageAccessModelLogicExtendTypes,
  IManageAccessModelLogicsTypes,
  IManageAccessModelPostType,
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
import { deleteData, loadData, postData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
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
  deleteManageGlobalCondition: (
    items: IManageGlobalConditionTypes[]
  ) => Promise<void>;
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
    postData: IManageAccessModelPostType
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
  setIdStateChange: Dispatch<SetStateAction<number>>;
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
  const [idStateChange, setIdStateChange] = useState(1);

  useEffect(() => {
    const maxId = async () => {
      try {
        if (token?.user_id === 0) return;
        const [resGlobalCondition, resManageAccessModel] = await Promise.all([
          loadData({
            baseURL: FLASK_URL,
            url: flaskApi.DefGlobalConditionLogicAttributes,
            accessToken: token.access_token,
          }),
          loadData({
            baseURL: FLASK_URL,
            url: flaskApi.DefAccessModelLogicAttributes,
            accessToken: token.access_token,
          }),
        ]);
        const maxIdGlobalCondition = Math.max(
          ...resGlobalCondition.map(
            (data: IManageGlobalConditionLogicAttributesTypes) => data.id
          )
        );
        const maxIdManageAccessModel = Math.max(
          ...resManageAccessModel.map(
            (data: IManageAccessModelLogicAttributesTypes) => data.id
          )
        );
        if (resGlobalCondition.length > 0) {
          setGlobalConditionAttrMaxId(maxIdGlobalCondition);
        } else {
          setGlobalConditionAttrMaxId(0);
        }
        if (resManageAccessModel.length > 0) {
          setManageAccessModelAttrMaxId(maxIdManageAccessModel);
        } else {
          setManageAccessModelAttrMaxId(0);
        }
      } catch (error) {
        console.log(error, "error");
      }
    };
    maxId();
  }, [api, token?.user_id, idStateChange]);

  useEffect(() => {
    if (token.user_id === 0) return;
    const maxLogicId = async () => {
      const result = await loadData({
        baseURL: FLASK_URL,
        url: flaskApi.DefAccessModelLogics,
        accessToken: token.access_token,
      });
      if (result && result.length > 0) {
        const maxAccessLogicId = Math.max(
          ...result.map(
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
    if (token.user_id === 0) return;
    const maxAttrId = async () => {
      const result = await loadData({
        baseURL: FLASK_URL,
        url: flaskApi.DefAccessModelLogicAttributes,
        accessToken: token.access_token,
      });
      if (result && result.length > 0) {
        const maxAccessAttrId = Math.max(
          ...result.map(
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

  const getlazyLoadingGlobalConditions = async (
    page: number,
    limit: number
  ) => {
    const resultLazyLoading = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefGlobalConditions}/${page}/${limit}`,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });

    if (resultLazyLoading.items.length) {
      setManageGlobalConditions(resultLazyLoading.items);
      setTotalPage(resultLazyLoading.pages);
    } else {
      setTotalPage(1);
      setManageGlobalConditions([]);
    }
  };

  // search global condition
  const getSearchGlobalConditions = async (
    page: number,
    limit: number,
    name: string
  ) => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefGlobalConditions}/search/${page}/${limit}?name=${name}`,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    if (response.items.length) {
      setManageGlobalConditions(response.items);
      setTotalPage(response.pages);
    } else {
      setTotalPage(1);
      setManageGlobalConditions([]);
    }
  };

  const createManageGlobalCondition = async (
    data: IManageGlobalConditionTypes
  ) => {
    const { name, datasource, description, status } = data;
    const res = await postData({
      baseURL: FLASK_URL,
      url: flaskApi.DefGlobalConditions,
      accessToken: token.access_token,
      payload: { name, datasource, description, status },
      setLoading: setIsLoading,
    });
    if (res.status === 201) {
      setStateChange((prev) => prev + 1);
      toast({
        description: res.data.message,
      });
      setIsOpenManageGlobalConditionModal(false);
      return true;
    }
    return false;
  };
  const fetchManageGlobalConditionLogics = async (filterId: number) => {
    const [logicsRes, attributesRes] = await Promise.all([
      loadData({
        baseURL: FLASK_URL,
        url: flaskApi.DefGlobalConditionLogics,
        accessToken: token.access_token,
        setLoading: setIsLoading,
      }),
      loadData({
        baseURL: FLASK_URL,
        url: flaskApi.DefGlobalConditionLogicAttributes,
        accessToken: token.access_token,
        setLoading: setIsLoading,
      }),
    ]);
    const attributesMap = new Map(
      attributesRes.map((attr: IManageGlobalConditionLogicAttributesTypes) => [
        attr.def_global_condition_logic_id,
        attr,
      ])
    );
    const mergedData = logicsRes.map(
      (item: IManageGlobalConditionLogicTypes) => ({
        ...item,
        ...(attributesMap.get(item.def_global_condition_logic_id) || {}),
      })
    );
    const filteredData = mergedData.filter(
      (item: IManageGlobalConditionLogicExtendTypes) =>
        item.def_global_condition_id === filterId
    );
    // return (filteredData as IManageGlobalConditionLogicExtendTypes[]) ?? [];
    if (filteredData) {
      return filteredData as IManageGlobalConditionLogicExtendTypes[];
    }
  };

  const manageGlobalConditionDeleteCalculate = async (id: number) => {
    const result = await fetchManageGlobalConditionLogics(id);
    if (result?.length) {
      return result;
    }
    return [];
  };

  const deleteManageGlobalCondition = async (
    items: IManageGlobalConditionTypes[]
  ) => {
    for (const item of items) {
      const { def_global_condition_id: id } = item;
      const deleteRes = await deleteData({
        baseURL: FLASK_URL,
        url: `${flaskApi.DefGlobalConditions}/${id}`,
        accessToken: token.access_token,
      });
      if (deleteRes.status === 200) {
        toast({
          description: deleteRes.data.message,
        });
      }
    }
    setStateChange((prev) => prev + 1);
  };
  const deleteGlobalLogicAndAttributeData = async (
    logicId: number,
    attrId: number
  ) => {
    const [isExistLogicId, isExistAttrId] = await Promise.all([
      deleteData({
        baseURL: FLASK_URL,
        url: `${flaskApi.DefGlobalConditionLogics}/${logicId}`,
        accessToken: token.access_token,
      }),
      deleteData({
        baseURL: FLASK_URL,
        url: `${flaskApi.DefGlobalConditionLogicAttributes}/${attrId}`,
        accessToken: token.access_token,
      }),
    ]);
    if (isExistLogicId.status === 200 && isExistAttrId.status === 200) {
      return isExistLogicId.status;
    }
    return;
  };

  // fetch Access Models
  const fetchDefAccessModels = async () => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessModels,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });

    if (response) {
      const totalCount = response.length;
      const totalPages = Math.ceil(totalCount / limit);

      const startIndex = (page - 1) * limit;
      const paginatedData = response.slice(startIndex, startIndex + limit);
      setTotalPage(totalPages);
      setCurrentPage(page);
      const formattedData = paginatedData.map(
        (data: IManageAccessModelsTypes) => {
          const [day, month, year] = (data?.last_run_date ?? "01-01-1970")
            .split(" ")[0]
            .split("-");

          const formatteDate = `${year}-${month}-${day}`;
          return { ...data, last_run_date: formatteDate };
        }
      );
      setManageAccessModels(formattedData);

      return response ?? [];
    }
  };

  // lazy loading Access models
  const lazyLoadingDefAccessModels = async (page: number, limit: number) => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessModels}/${page}/${limit}`,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    if (response) {
      setTotalPage(response.pages);
      setCurrentPage(response.page);
      setManageAccessModels(response.items);
    }
  };

  // search access model
  const getSearchAccessModels = async (
    page: number,
    limit: number,
    model_name: string
  ) => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessModels}/search/${page}/${limit}?model_name=${model_name}`,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    setTotalPage(response.pages);
    setManageAccessModels(response.items);
    setCurrentPage(response.page);
  };

  // Create Acces Model
  const createDefAccessModel = async (data: IManageAccessModelPostType) => {
    const res = await postData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessModels,
      setLoading: setIsLoading,
      payload: data,
      isConsole: true,
      isToast: true,
      accessToken: token.access_token,
    });
    if (res.status === 201) {
      setStateChange((prev) => prev + 1);
      toast({
        description: res.data.message,
      });
      return true;
    }
    return false;
  };

  // delete Access Model
  const deleteDefAccessModel = async (items: IManageAccessModelsTypes[]) => {
    for (const item of items) {
      const { def_access_model_id: id } = item;
      const deleteRes = await deleteData({
        baseURL: FLASK_URL,
        url: `${flaskApi.DefAccessModels}/${id}`,
        accessToken: token.access_token,
      });
      if (deleteRes.status === 200) {
        toast({
          description: deleteRes.data.message,
        });
      }
      setStateChange((prev) => prev + 1);
    }
  };

  // fetch access model logics
  const fetchAccessModelLogics = async () => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessModelLogics,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    const maxId = Math.max(
      ...response.map(
        (data: IManageAccessModelLogicsTypes) => data.def_access_model_logic_id
      )
    );
    setMaxLogicId(maxId);
  };
  // Manage Access Model Logics
  const fetchDefAccessModelLogics = async (filterId: number) => {
    const [logicsRes, attributesRes] = await Promise.all([
      loadData({
        baseURL: FLASK_URL,
        url: flaskApi.DefAccessModelLogics,
        accessToken: token.access_token,
        setLoading: setIsLoading,
      }),
      loadData({
        baseURL: FLASK_URL,
        url: flaskApi.DefAccessModelLogicAttributes,
        accessToken: token.access_token,
        setLoading: setIsLoading,
      }),
    ]);
    const attributesMap = new Map(
      attributesRes.map((attr: IManageAccessModelLogicAttributesTypes) => [
        attr.def_access_model_logic_id,
        attr,
      ])
    );
    const mergedData = logicsRes.map((item: IManageAccessModelLogicsTypes) => ({
      ...item,
      ...(attributesMap.get(item.def_access_model_logic_id) || {}),
    }));
    const filteredData = mergedData.filter(
      (item: IManageAccessModelLogicExtendTypes) =>
        item.def_access_model_id === filterId
    );
    // return (filteredData as IManageGlobalConditionLogicExtendTypes[]) ?? [];
    if (filteredData) {
      return filteredData as IManageAccessModelLogicExtendTypes[];
    }
  };
  const manageAccessModelLogicsDeleteCalculate = async (id: number) => {
    const result = await fetchDefAccessModelLogics(id);
    if (result?.length) {
      return result;
    }
    return [];
  };

  const deleteManageModelLogicAndAttributeData = async (
    logicId: number,
    attrId: number
  ) => {
    const [isExistLogicId, isExistAttrId] = await Promise.all([
      deleteData({
        baseURL: FLASK_URL,
        url: `${flaskApi.DefAccessModelLogics}/${logicId}`,
        accessToken: token.access_token,
      }),
      deleteData({
        baseURL: FLASK_URL,
        url: `${flaskApi.DefAccessModelLogicAttributes}/${attrId}`,
        accessToken: token.access_token,
      }),
    ]);
    if (isExistLogicId.status === 200 && isExistAttrId.status === 200) {
      return isExistLogicId.status;
    }
    return;
  };

  // fetch access model attribute
  const fetchAccessModelAttributes = async () => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessModelLogicAttributes,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    if (response) {
      setAccessModelLogicAttributes(response.data);
    }
  };

  // Search Filter
  const searchFilter = async (data: IManageAccessModelSearchFilterTypes) => {
    const allAccessModel = await fetchDefAccessModels();

    const filterResult = allAccessModel?.filter(
      (item: IManageAccessModelsTypes) => {
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
        const matchesDate = data.last_run_date.length === 0;
        // item.last_run_date.includes(data.last_run_date);

        // Return true only if all conditions are met
        return (
          matchesModelName && matchesCreatedBy && matchesState && matchesDate
        );
      }
    );

    setManageAccessModels(filterResult ?? []);
    // return filterResult ?? [];
  };

  // Data Source
  const fetchDataSource = async () => {
    const res = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.DefDataSources,
      accessToken: token.access_token,
    });
    if (res) {
      setDataSources(res);
    }
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
    setIdStateChange,
  };
  return (
    <AACContext.Provider value={value}>
      <ControlsContextProvider>{children}</ControlsContextProvider>
    </AACContext.Provider>
  );
};
