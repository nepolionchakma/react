import { toast } from "@/components/ui/use-toast";
import {
  IAccessPointTypes,
  IFetchAccessEntitlementElementsTypes,
  IManageAccessEntitlementsTypes,
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
import { deleteData, loadData, postData, putData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
interface IGetReturnData {
  items: [];
  page: number;
  pages: number;
  total: number;
}
interface IManageAccessEntitlementsProviderProps {
  children: React.ReactNode;
}
interface IContextTypes {
  selectedAccessEntitlements: IManageAccessEntitlementsTypes;
  setSelectedAccessEntitlements: Dispatch<
    SetStateAction<IManageAccessEntitlementsTypes>
  >;
  fetchManageAccessEntitlements: () => Promise<IGetReturnData>;
  fetchAccessPointsByEntitlementId: (fetchData: number) => Promise<void>;
  fetchUnLinkedAccessPointsData: (access_point_name?: string) => Promise<void>;
  accessPointsData: IAccessPointTypes[];
  setAccessPointsData: Dispatch<SetStateAction<IAccessPointTypes[] | []>>;
  isLoading: boolean;
  isLoadingAccessPoints: boolean;
  setIsLoadingAccessPoints: Dispatch<SetStateAction<boolean>>;
  selectedAccessPoints: IAccessPointTypes[];
  setSelectedAccessPoints: Dispatch<SetStateAction<IAccessPointTypes[]>>;
  selectedManageAccessEntitlements: IManageAccessEntitlementsTypes | undefined;
  setSelectedManageAccessEntitlements: Dispatch<
    SetStateAction<IManageAccessEntitlementsTypes | undefined>
  >;
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
  deleteManageAccessEntitlement: (
    def_access_entitlement_id: number
  ) => Promise<void>;
  save: number;
  setSave: Dispatch<SetStateAction<number>>;
  save2: number;
  setSave2: Dispatch<SetStateAction<number>>;
  table: Table<IManageAccessEntitlementsTypes> | undefined;
  setTable: Dispatch<
    SetStateAction<Table<IManageAccessEntitlementsTypes> | undefined>
  >;
  createAccessEntitlementElements: (
    def_entitlement_id: number,
    accessPointsMaxId: (number | undefined)[]
  ) => Promise<void>;
  deleteAccessEntitlementElement: (
    def_entitlement_id: number,
    accessPointIds: (number | undefined)[]
  ) => Promise<void>;
  editAccessPoint: boolean;
  setEditAccessPoint: Dispatch<SetStateAction<boolean>>;
  accessPointStatus: string;
  setAccessPointStatus: Dispatch<SetStateAction<string>>;
  fetchAccessEtitlementElenents: () => Promise<
    IFetchAccessEntitlementElementsTypes[] | [] | undefined
  >;
  selectedAccessEntitlementElements: number[];
  setSelectedAccessEntitlementElements: Dispatch<SetStateAction<number[] | []>>;
  unLinkedAccessPoints: IAccessPointTypes[];
  isLoadingUnLinkedAccessPoints: boolean;
  accessEntitlementsPage: number;
  setAccessEntitlementsPage: Dispatch<SetStateAction<number>>;
  accessEntitlementsLimit: number;
  setAccessEntitlementsLimit: Dispatch<SetStateAction<number>>;
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
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAccessPoints, setIsLoadingAccessPoints] =
    useState<boolean>(false);
  const [isLoadingUnLinkedAccessPoints, setIsLoadingUnLinkedAccessPoints] =
    useState<boolean>(true);

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
  const [accessPointsData, setAccessPointsData] = useState<IAccessPointTypes[]>(
    []
  );
  const [selectedAccessPoints, setSelectedAccessPoints] = useState<
    IAccessPointTypes[]
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
  const [
    selectedAccessEntitlementElements,
    setSelectedAccessEntitlementElements,
  ] = useState<number[]>([]);
  const [unLinkedAccessPoints, setUnLinkedAccessPoints] = useState<
    IAccessPointTypes[]
  >([]);
  const [accessEntitlementsPage, setAccessEntitlementsPage] =
    useState<number>(1);
  const [accessEntitlementsLimit, setAccessEntitlementsLimit] = useState(4);

  // UnLinked Access Points
  const fetchUnLinkedAccessPointsData = async (access_point_name?: string) => {
    if (!token?.access_token) return;
    const isUnLinked = true;
    const response = await loadData({
      baseURL: FLASK_URL,
      url: `${
        flaskApi.DefAccessPointsView
      }?unlinked=${isUnLinked}&access_point_name=${access_point_name ?? ""}`,
      setLoading: setIsLoadingUnLinkedAccessPoints,
      accessToken: token?.access_token,
    });
    setUnLinkedAccessPoints(response);
  };

  // Linked Access Points
  const fetchAccessPointsByEntitlementId = useCallback(
    async (def_entitlement_id: number) => {
      if (token?.access_token && def_entitlement_id > 0) {
        const response = await loadData({
          baseURL: FLASK_URL,
          url: `${flaskApi.DefAccessPointsView}?def_entitlement_id=${def_entitlement_id}`,
          setLoading: setIsLoadingAccessPoints,
          accessToken: token.access_token,
        });

        if (response.message) {
          setAccessPointsData([]);
        } else {
          setAccessPointsData(response);
        }
      }
    },
    [token.access_token]
  );

  const fetchAccessEtitlementElenents = async () => {
    const res = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessPoints,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    return res.data;
  };

  // Access entitlement elements
  const createAccessEntitlementElements = async (
    def_entitlement_id: number,
    accessPointIds: (number | undefined)[]
  ) => {
    const response = await postData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlementElements}/${def_entitlement_id}`,
      payload: {
        def_access_point_ids: accessPointIds,
      },
      accessToken: token.access_token,
      setLoading: setIsLoadingUnLinkedAccessPoints,
    });

    if (response.status === 201) {
      toast({
        description: `${
          selectedManageAccessEntitlements?.def_entitlement_id
            ? `Data added successfully to ${selectedManageAccessEntitlements?.entitlement_name}`
            : "Data added successfully"
        } `,
      });
      await fetchUnLinkedAccessPointsData();
      await fetchAccessPointsByEntitlementId(
        selectedAccessEntitlements.def_entitlement_id
      );
    }
  };

  const deleteAccessEntitlementElement = async (
    def_entitlement_id: number,
    accessPointIds: (number | undefined)[]
  ) => {
    const res = await deleteData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlementElements}/${def_entitlement_id}`,
      payload: {
        def_access_point_ids: accessPointIds,
      },
      accessToken: token.access_token,
    });
    if (res.status === 200) {
      toast({
        description: `Removed successfully.`,
      });
      await fetchUnLinkedAccessPointsData();
      await fetchAccessPointsByEntitlementId(
        selectedAccessEntitlements.def_entitlement_id
      );
    }
  };

  // Manage Access Entitlements && Access points element
  const fetchManageAccessEntitlements = async () => {
    const response = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlements}/search/${accessEntitlementsPage}/${accessEntitlementsLimit}`,
      accessToken: token.access_token,
      setLoading: setIsLoading,
    });
    return response;
  };

  const createManageAccessEntitlements = async (
    data: IManageAccessEntitlementsTypes
  ) => {
    // data is: entitlement_name, description, comments, status, created_by, last_updated_by,

    const res = await postData({
      baseURL: FLASK_URL,
      url: flaskApi.DefAccessEntitlements,
      payload: data,
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
    // data is: entitlement_name, description, comments, status, created_by, last_updated_by,

    const res = await putData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlements}/${id}`,
      payload: data,
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

  const deleteManageAccessEntitlement = async (
    def_access_entitlement_id: number
  ) => {
    const response = await deleteData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAccessEntitlements}/${def_access_entitlement_id}`,
      accessToken: token.access_token,
    });

    if (response.status === 200) {
      toast({
        description: `Deleted successfully.`,
      });
      setAccessPointsData([]);
      setSave((prevSave) => prevSave + 1);
    }
  };

  const value = {
    fetchManageAccessEntitlements,
    selectedAccessEntitlements,
    setSelectedAccessEntitlements,
    fetchAccessPointsByEntitlementId,
    fetchUnLinkedAccessPointsData,
    accessPointsData,
    setAccessPointsData,
    isLoading,
    isLoadingAccessPoints,
    setIsLoadingAccessPoints,
    selectedAccessPoints,
    setSelectedAccessPoints,
    selectedManageAccessEntitlements,
    setSelectedManageAccessEntitlements,
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
    createAccessEntitlementElements,
    deleteAccessEntitlementElement,
    editAccessPoint,
    setEditAccessPoint,
    accessPointStatus,
    setAccessPointStatus,
    fetchAccessEtitlementElenents,
    selectedAccessEntitlementElements,
    setSelectedAccessEntitlementElements,
    unLinkedAccessPoints,
    isLoadingUnLinkedAccessPoints,
    accessEntitlementsPage,
    setAccessEntitlementsPage,
    accessEntitlementsLimit,
    setAccessEntitlementsLimit,
  };

  return (
    <ManageAccessEntitlements.Provider value={value}>
      {children}
    </ManageAccessEntitlements.Provider>
  );
};
