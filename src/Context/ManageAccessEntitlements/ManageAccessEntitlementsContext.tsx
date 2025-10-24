import { toast } from "@/components/ui/use-toast";
import {
  ICreateAccessPointsElementTypes,
  IFetchAccessPointsElementTypes,
  IFetchAccessEntitlementElementsTypes,
  IManageAccessEntitlementsTypes,
  IManageAccessEntitlementsPerPageTypes,
  IFetchCombinedAccessPointsElementAndDatasourceTypes,
} from "@/types/interfaces/ManageAccessEntitlements.interface";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";
import { useGlobalContext } from "../GlobalContext/GlobalContext";
import { Table } from "@tanstack/react-table";
import { AxiosResponse } from "axios";
import { deleteData, loadData, postData, putData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
interface IManageAccessEntitlementsProviderProps {
  children: React.ReactNode;
}
interface IContextTypes {
  selectedAccessEntitlements: IManageAccessEntitlementsTypes;
  setSelectedAccessEntitlements: Dispatch<
    SetStateAction<IManageAccessEntitlementsTypes>
  >;
  fetchManageAccessEntitlements: (
    page: number,
    limit: number
  ) => Promise<IManageAccessEntitlementsPerPageTypes | undefined>;
  fetchAccessPointsEntitlement: (
    fetchData: IManageAccessEntitlementsTypes
  ) => Promise<void>;
  getSearchAccessPointElementsLazyLoading: (
    page: number,
    limit: number,
    element_name: string
  ) => Promise<IFetchAccessPointsElementTypes[] | undefined>;
  fetchAccessPointsEntitlementForDelete: (
    fetchData: IManageAccessEntitlementsTypes
  ) => Promise<IFetchAccessPointsElementTypes[]>;
  filteredData: IFetchCombinedAccessPointsElementAndDatasourceTypes[];
  setFilteredData: Dispatch<
    SetStateAction<IFetchCombinedAccessPointsElementAndDatasourceTypes[] | []>
  >;
  isLoading: boolean;
  isLoadingAccessPoints: boolean;
  selectedAccessPoints: ICreateAccessPointsElementTypes[];
  setSelectedAccessPoints: Dispatch<
    SetStateAction<ICreateAccessPointsElementTypes[]>
  >;
  selectedManageAccessEntitlements: IManageAccessEntitlementsTypes | undefined;
  setSelectedManageAccessEntitlements: Dispatch<
    SetStateAction<IManageAccessEntitlementsTypes | undefined>
  >;
  createAccessPointsEntitlement: (
    postData: ICreateAccessPointsElementTypes
  ) => Promise<number | undefined>;
  editManageAccessEntitlement: boolean;
  setEditManageAccessEntitlement: Dispatch<SetStateAction<boolean>>;
  mangeAccessEntitlementAction: string;
  setMangeAccessEntitlementAction: Dispatch<SetStateAction<string>>;
  createManageAccessEntitlements: (
    postData: IManageAccessEntitlementsTypes
  ) => Promise<void>;
  updateManageAccessEntitlements: (
    id: number,
    putData: IManageAccessEntitlementsTypes
  ) => Promise<void>;
  deleteManageAccessEntitlement: (id: number) => Promise<void>;
  save: number;
  setSave: Dispatch<SetStateAction<number>>;
  save2: number;
  setSave2: Dispatch<SetStateAction<number>>;
  table: Table<IManageAccessEntitlementsTypes> | undefined;
  setTable: Dispatch<
    SetStateAction<Table<IManageAccessEntitlementsTypes> | undefined>
  >;
  deleteAccessPointsElement: (id: number) => Promise<number | undefined>;
  createAccessEntitlementElements: (
    def_entitlement_id: number,
    accessPointsMaxId: (number | undefined)[]
  ) => Promise<void>;
  deleteAccessEntitlementElement: (
    entitlementId: number,
    accessPointId: number
  ) => Promise<void>;
  editAccessPoint: boolean;
  setEditAccessPoint: Dispatch<SetStateAction<boolean>>;
  accessPointStatus: string;
  setAccessPointStatus: Dispatch<SetStateAction<string>>;
  fetchAccessPointsData: () => Promise<
    IFetchAccessPointsElementTypes[] | undefined
  >;
  fetchAccessEtitlementElenents: () => Promise<
    IFetchAccessEntitlementElementsTypes[] | [] | undefined
  >;
  accessPoints: ICreateAccessPointsElementTypes[] | undefined;
  selectedAccessEntitlementElements: number[];
  setSelectedAccessEntitlementElements: Dispatch<SetStateAction<number[] | []>>;
  //lazy loading
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPage: number;
  setTotalPage: Dispatch<SetStateAction<number>>;
  currentPage: number;
  limit: number;
  setLimit: Dispatch<SetStateAction<number>>;
}
export const ManageAccessEntitlements = createContext<IContextTypes | null>(
  null
);
export const useManageAccessEntitlementsContext = () => {
  const consumer = useContext(ManageAccessEntitlements);
  if (!consumer) {
    throw new Error("error");
  }
  return consumer;
};
export const ManageAccessEntitlementsProvider = ({
  children,
}: IManageAccessEntitlementsProviderProps) => {
  const { combinedUser, token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAccessPoints, setIsLoadingAccessPoints] =
    useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedAccessEntitlements, setSelectedAccessEntitlements] =
    useState<IManageAccessEntitlementsTypes>({
      def_entitlement_id: 0,
      entitlement_name: "",
      description: "",
      comments: "",
      status: "",
      effective_date: "",
      revison: 0,
      revision_date: "",
      created_on: "",
      last_updated_on: "",
      last_updated_by: 0,
      created_by: 0,
    });
  const [filteredData, setFilteredData] = useState<
    IFetchCombinedAccessPointsElementAndDatasourceTypes[]
  >([]);
  const [selectedAccessPoints, setSelectedAccessPoints] = useState<
    ICreateAccessPointsElementTypes[]
  >([]);
  const [
    selectedManageAccessEntitlements,
    setSelectedManageAccessEntitlements,
  ] = useState<IManageAccessEntitlementsTypes>();
  const [editManageAccessEntitlement, setEditManageAccessEntitlement] =
    useState(false);
  const [mangeAccessEntitlementAction, setMangeAccessEntitlementAction] =
    useState<string>("");
  const [save, setSave] = useState<number>(0);
  const [save2, setSave2] = useState<number>(0);
  const [table, setTable] = useState<
    Table<IManageAccessEntitlementsTypes> | undefined
  >();
  const [editAccessPoint, setEditAccessPoint] = useState<boolean>(false);
  const [accessPointStatus, setAccessPointStatus] = useState<string>("");
  const [accessPoints, setAccessPoints] = useState<
    ICreateAccessPointsElementTypes[] | undefined
  >([]);
  const [
    selectedAccessEntitlementElements,
    setSelectedAccessEntitlementElements,
  ] = useState<number[]>([]);

  // Access points element
  const fetchAccessPointsData = async () => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessPointElements,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    setAccessPoints(response);
    return response;
  };

  // Search Access Points Elements
  const getSearchAccessPointElementsLazyLoading = async (
    page: number,
    limit: number,
    element_name: string
  ) => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessPointElements}/search/${page}/${limit}?element_name=${element_name}`,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    setTotalPage(response.pages);

    return response.items;
  };

  const fetchAccessPointsEntitlement = useCallback(
    async (fetchData: IManageAccessEntitlementsTypes) => {
      if (fetchData.def_entitlement_id) {
        const response = await loadData({
          baseURL: FLASK_URL,
          url: `/access-entitlement-elements/${fetchData.def_entitlement_id}`,
          accessToken: token.access_token,
          setLoading: setIsLoading,
        });

        const accessPointsId = response.data.map(
          (data: IFetchAccessEntitlementElementsTypes) => data.access_point_id
        );

        if (accessPointsId.length === 0) {
          setFilteredData([]);
        } else {
          const filterAccessPointsById = await loadData({
            baseURL: FLASK_URL,
            url: `/def-access-point-elements/accesspoints?accessPointsId=${accessPointsId}`,
            accessToken: token.access_token,
            setLoading: setIsLoading,
          });

          const totalCount = response.length;
          const totalPages = Math.ceil(totalCount / limit);

          setTotalPage(totalPages);
          setCurrentPage(currentPage);
          setFilteredData(
            filterAccessPointsById as IFetchCombinedAccessPointsElementAndDatasourceTypes[]
          );
        }

        // fetch access points data by IDS array
      } else {
        setFilteredData([]);
      }
    },
    [currentPage, limit]
  );
  const fetchAccessPointsEntitlementForDelete = useCallback(
    async (fetchData: IManageAccessEntitlementsTypes) => {
      if (fetchData) {
        const response = await loadData({
          baseURL: FLASK_URL,
          url: `/access-entitlement-elements/${fetchData.def_entitlement_id}`,
          accessToken: token.access_token,
          setLoading: setIsLoading,
        });

        const accessPointsId = response.data.map(
          (data: IFetchAccessEntitlementElementsTypes) => data.access_point_id
        );

        // fetch access points data by IDS array
        if (accessPointsId.length > 0) {
          const filterAccessPointsById = await loadData({
            baseURL: FLASK_URL,
            url: `/def-access-point-elements/access-points/id-delete?accessPoint=${accessPointsId}`,
            accessToken: token.access_token,
            setLoading: setIsLoading,
          });
          console.log(
            `/def-access-point-elements/access-points/id-delete?accessPoint=${accessPointsId}`
          );
          return filterAccessPointsById.data;
        } else {
          return [];
        }
      }
    },
    [token.access_token]
  );
  const createAccessPointsEntitlement = async (
    data: ICreateAccessPointsElementTypes
  ) => {
    const {
      def_data_source_id,
      element_name,
      description,
      platform,
      element_type,
      access_control,
      change_control,
      audit,
      created_by,
      last_updated_by,
    } = data;
    const res = await postData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessPointElements,
      payload: {
        def_data_source_id,
        element_name,
        description,
        platform,
        element_type,
        access_control,
        change_control,
        audit,
        created_by,
        last_updated_by,
      },
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    // setSave((prevSave) => prevSave + 1);
    if (res.status === 201) {
      toast({
        description: `Added successfully.`,
      });
      setSave2((prevSave) => prevSave + 1);
    }
    return res.status;
  };

  const deleteAccessPointsElement = async (id: number) => {
    const res = await deleteData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessPointElements}/${id}`,
      accessToken: token.access_token,
    });
    if (res.status === 200) {
      toast({
        description: `Deleted successfully.`,
      });
    }
    return res.status;
  };

  const fetchAccessEtitlementElenents = async () => {
    const res = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessPointElements,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    return res.data;
  };

  // Access entitlement elements
  const createAccessEntitlementElements = async (
    def_entitlement_id: number,
    accessPointsMaxId: (number | undefined)[]
  ) => {
    for (const id of accessPointsMaxId) {
      const response: AxiosResponse<IFetchAccessEntitlementElementsTypes> =
        await postData({
          baseURL: FLASK_URL,
          url: flaskApi.DefAccessEntitlementElements,
          payload: {
            entitlement_id: def_entitlement_id,
            access_point_id: id,
            created_by: combinedUser?.user_name,
            last_updated_by: combinedUser?.user_name,
          },
          accessToken: token.access_token,
          setLoading: setIsLoadingAccessPoints,
        });

      if (response.status === 201) {
        toast({
          description: `${
            selectedManageAccessEntitlements?.def_entitlement_id
              ? `Data added successfully to ${selectedManageAccessEntitlements?.entitlement_name}`
              : "Data added successfully"
          } `,
        });
      }
    }

    fetchAccessPointsEntitlement(selectedAccessEntitlements);
  };
  const deleteAccessEntitlementElement = async (
    entitlementId: number,
    accessPointId: number
  ) => {
    const res = await deleteData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlementElements}/${entitlementId}/${accessPointId}`,
      accessToken: token.access_token,
    });
    if (res.status === 200) {
      toast({
        description: `Deleted successfully.`,
      });
    }
    fetchAccessPointsEntitlement(selectedAccessEntitlements);
  };

  // Manage Access Entitlements && Access points element
  const fetchManageAccessEntitlements = async (page: number, limit: number) => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlementElements}/${page}/${limit}`,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    return response;
  };
  const createManageAccessEntitlements = async (
    data: IManageAccessEntitlementsTypes
  ) => {
    const {
      entitlement_name,
      description,
      comments,
      status,
      created_by,
      last_updated_by,
    } = data;
    const res = await postData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessEntitlementElements,
      payload: {
        entitlement_name,
        description,
        comments,
        status,
        last_updated_by,
        created_by,
      },
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });

    if (res.status === 200) {
      toast({
        description: `${res.data.message}`,
      });
    }
    if (res.status === 201) {
      toast({
        description: `${res.data.message}`,
      });
      setEditManageAccessEntitlement(false);
    }
    setSave((prevSave) => prevSave + 1);
  };
  const updateManageAccessEntitlements = async (
    id: number,
    data: IManageAccessEntitlementsTypes
  ) => {
    const {
      def_entitlement_id,
      entitlement_name,
      description,
      comments,
      status,
      created_by,
      last_updated_by,
    } = data;
    const res = await putData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlementElements}/${id}`,
      payload: {
        def_entitlement_id,
        entitlement_name,
        description,
        comments,
        status,
        last_updated_by,
        created_by,
      },
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });

    if (res.status === 200) {
      toast({
        description: `${res.data.message}`,
      });
    }
    if (res.status === 201) {
      toast({
        description: `${res.data.message}`,
      });

      setEditManageAccessEntitlement(false);
    }
    setSave((prevSave) => prevSave + 1);
  };
  const deleteManageAccessEntitlement = async (id: number) => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlementElements}/${id}`,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });

    if (response.data.length > 0) {
      for (const element of response.data) {
        await deleteAccessEntitlementElement(
          element.entitlement_id,
          element.access_point_id
        );
      }
    }
    const res = await deleteData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlementElements}/${id}`,
      accessToken: token.access_token,
    });
    if (res.status === 200) {
      toast({
        description: `Deleted successfully.`,
      });
    }
    setSave((prevSave) => prevSave + 1);
  };

  const value = {
    fetchManageAccessEntitlements,
    selectedAccessEntitlements,
    setSelectedAccessEntitlements,
    fetchAccessPointsEntitlement,
    fetchAccessPointsEntitlementForDelete,
    getSearchAccessPointElementsLazyLoading,
    filteredData,
    setFilteredData,
    isLoading,
    isLoadingAccessPoints,
    selectedAccessPoints,
    setSelectedAccessPoints,
    selectedManageAccessEntitlements,
    setSelectedManageAccessEntitlements,
    createAccessPointsEntitlement,
    editManageAccessEntitlement,
    setEditManageAccessEntitlement,
    mangeAccessEntitlementAction,
    setMangeAccessEntitlementAction,
    createManageAccessEntitlements,
    updateManageAccessEntitlements,
    deleteManageAccessEntitlement,
    save,
    setSave,
    save2,
    setSave2,
    table,
    setTable,
    deleteAccessPointsElement,
    createAccessEntitlementElements,
    deleteAccessEntitlementElement,
    editAccessPoint,
    setEditAccessPoint,
    accessPointStatus,
    setAccessPointStatus,
    fetchAccessPointsData,
    fetchAccessEtitlementElenents,
    accessPoints,
    selectedAccessEntitlementElements,
    setSelectedAccessEntitlementElements,
    page,
    setPage,
    totalPage,
    setTotalPage,
    currentPage,
    limit,
    setLimit,
  };

  return (
    <ManageAccessEntitlements.Provider value={value}>
      {children}
    </ManageAccessEntitlements.Provider>
  );
};
