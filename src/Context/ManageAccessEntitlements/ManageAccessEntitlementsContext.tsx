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
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Table } from "@tanstack/react-table";
import { AxiosResponse } from "axios";
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
  const api = useAxiosPrivate();
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAccessPoints, setIsLoadingAccessPoints] =
    useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;

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
      last_updated_by: "",
      created_by: "",
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
    setIsLoading(true);
    try {
      const response = await api.get<IFetchAccessPointsElementTypes[]>(
        `/def-access-point-elements`
      );
      setAccessPoints(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search Access Points Elements
  const getSearchAccessPointElementsLazyLoading = async (
    page: number,
    limit: number,
    element_name: string
  ) => {
    try {
      setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/def-access-point-elements/search/${page}/${limit}?element_name=${element_name}`
      );
      setTotalPage(resultLazyLoading.data.pages);
      console.log(resultLazyLoading.data.items);
      return resultLazyLoading.data.items;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccessPointsEntitlement = useCallback(
    async (fetchData: IManageAccessEntitlementsTypes) => {
      setIsLoading(true);
      try {
        if (fetchData.def_entitlement_id) {
          const response = await api.get<
            IFetchAccessEntitlementElementsTypes[]
          >(`/access-entitlement-elements/${fetchData.def_entitlement_id}`);

          const accessPointsId = response.data.map(
            (data) => data.access_point_id
          );

          if (accessPointsId.length === 0) {
            setFilteredData([]);
          } else {
            const filterAccessPointsById = await api.get(
              `/def-access-point-elements/accesspoints-id/${page}/${limit}?accessPointsId=${accessPointsId}`
            );

            const totalCount = response.data.length;
            const totalPages = Math.ceil(totalCount / limit);

            console.log(filterAccessPointsById, "access point data");
            setTotalPage(totalPages);
            setCurrentPage(currentPage);
            setFilteredData(
              filterAccessPointsById.data as IFetchCombinedAccessPointsElementAndDatasourceTypes[]
            );
          }

          // fetch access points data by IDS array
        } else {
          setFilteredData([]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [api, currentPage, limit, page]
  );
  const fetchAccessPointsEntitlementForDelete = useCallback(
    async (fetchData: IManageAccessEntitlementsTypes) => {
      try {
        if (fetchData) {
          const response = await api.get<
            IFetchAccessEntitlementElementsTypes[]
          >(`/access-entitlement-elements/${fetchData.def_entitlement_id}`);
          console.log(response, "response");
          const accessPointsId = response.data.map(
            (data) => data.access_point_id
          );
          console.log(accessPointsId, "accesspointsid");
          // fetch access points data by IDS array
          if (accessPointsId.length > 0) {
            const filterAccessPointsById = await api.get(
              `/def-access-point-elements/access-points/id-delete?accessPoint=${accessPointsId}`
            );
            console.log(
              `/def-access-point-elements/access-points/id-delete?accessPoint=${accessPointsId}`
            );
            return filterAccessPointsById.data;
          } else {
            return [];
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );
  const createAccessPointsEntitlement = async (
    postData: ICreateAccessPointsElementTypes
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
    } = postData;
    try {
      setIsLoading(true);
      const res = await api.post<ICreateAccessPointsElementTypes>(
        `/def-access-point-elements`,
        {
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
        }
      );
      // setSave((prevSave) => prevSave + 1);
      if (res.status === 201) {
        toast({
          description: `Added successfully.`,
        });
        setSave2((prevSave) => prevSave + 1);
      }
      return res.status;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        toast({
          description: `Failed: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setSave2((prevSave) => prevSave + 1);
    }
  };
  const deleteAccessPointsElement = async (id: number) => {
    try {
      const res = await api.delete(`/def-access-point-elements/${id}`, {
        baseURL: flaskUrl, // Overrides the default baseURL
      });
      if (res.status === 200) {
        toast({
          description: `Deleted successfully.`,
        });
      }
      // setSave((prevSave) => prevSave + 1);
      return res.status;
    } catch (error) {
      console.log(error);
    }
  };
  const fetchAccessEtitlementElenents = async () => {
    const res = await api.get<IFetchAccessEntitlementElementsTypes[]>(
      `/access-entitlement-elements`
    );
    return res.data;
  };

  // Access entitlement elements
  const createAccessEntitlementElements = async (
    def_entitlement_id: number,
    accessPointsMaxId: (number | undefined)[]
  ) => {
    try {
      setIsLoadingAccessPoints(true);
      for (const id of accessPointsMaxId) {
        const response: AxiosResponse<IFetchAccessEntitlementElementsTypes> =
          await api.post<IFetchAccessEntitlementElementsTypes>(
            `/access-entitlement-elements`,
            {
              entitlement_id: def_entitlement_id,
              access_point_id: id,
              created_by: token.user_name,
              last_updated_by: token.user_name,
            }
          );

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
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: error.message,
        });
      }
    } finally {
      setIsLoadingAccessPoints(false);
    }

    fetchAccessPointsEntitlement(selectedAccessEntitlements);
  };
  const deleteAccessEntitlementElement = async (
    entitlementId: number,
    accessPointId: number
  ) => {
    setIsLoadingAccessPoints(true);
    try {
      await Promise.all([
        await api
          .delete(
            `/access-entitlement-elements/${entitlementId}/${accessPointId}`
          )
          .then((res) => {
            if (res.status === 200) {
              toast({
                description: `Deleted successfully.`,
              });
            }
          })
          .catch((error) => {
            if (error instanceof Error) {
              toast({
                title: error.message,
              });
            }
          })
          .finally(() => {
            fetchAccessPointsEntitlementForDelete(selectedAccessEntitlements);
          }),
        // await api.delete(`/access-points-element/${accessPointId}`),
      ]);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: error.message,
        });
      }
    } finally {
      setIsLoadingAccessPoints(false);
    }
  };

  // Manage Access Entitlements && Access points element
  const fetchManageAccessEntitlements = async (page: number, limit: number) => {
    setIsLoading(true);
    try {
      const response = await api.get<IManageAccessEntitlementsPerPageTypes>(
        `/def-access-entitlements/${page}/${limit}`
      );
      const sortingData = response.data;
      return sortingData ?? {};
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const createManageAccessEntitlements = async (
    postData: IManageAccessEntitlementsTypes
  ) => {
    const {
      entitlement_name,
      description,
      comments,
      status,
      created_by,
      last_updated_by,
    } = postData;

    try {
      setIsLoading(true);
      const res = await api.post(`/def-access-entitlements`, {
        entitlement_name,
        description,
        comments,
        status,
        last_updated_by,
        created_by,
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
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSave((prevSave) => prevSave + 1);
      setIsLoading(false);
    }
  };
  const updateManageAccessEntitlements = async (
    id: number,
    putData: IManageAccessEntitlementsTypes
  ) => {
    const {
      def_entitlement_id,
      entitlement_name,
      description,
      comments,
      status,
      created_by,
      last_updated_by,
    } = putData;
    try {
      setIsLoading(true);
      const res = await api.put(`/def-access-entitlements/${id}`, {
        def_entitlement_id,
        entitlement_name,
        description,
        comments,
        status,
        last_updated_by,
        created_by,
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
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSave((prevSave) => prevSave + 1);
      setIsLoading(false);
    }
  };
  const deleteManageAccessEntitlement = async (id: number) => {
    try {
      //fetch access entitlements
      const response = await api.get(`/access-entitlement-elements/${id}`);

      console.log(response, "response 569");

      if (response.data.length > 0) {
        for (const element of response.data) {
          await deleteAccessEntitlementElement(
            element.entitlement_id,
            element.access_point_id
          );
        }
      }
      const res = await api.delete(`/def-access-entitlements/${id}`);
      if (res.status === 200) {
        toast({
          description: `Deleted successfully.`,
        });
      }
      setSave((prevSave) => prevSave + 1);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: error.message,
        });
      }
    }
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
