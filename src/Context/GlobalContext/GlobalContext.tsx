import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios, { AxiosError } from "axios";
import {
  Token,
  Users,
  ITenantsTypes,
  IUsersInfoTypes,
  IUpdateUserTypes,
  IUserPasswordResetTypes,
  IUserLinkedDevices,
  IGetResponeUsersInfoTypes,
} from "@/types/interfaces/users.interface";
import {
  IDataSourcePostTypes,
  IDataSourceTypes,
} from "@/types/interfaces/datasource.interface";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ManageAccessEntitlementsProvider } from "../ManageAccessEntitlements/ManageAccessEntitlementsContext";
import { AACContextProvider } from "../ManageAccessEntitlements/AdvanceAccessControlsContext";
import { SocketContextProvider } from "../SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useUserDevice from "@/hooks/useUserDevice";
import { ARMContextProvider } from "../ARMContext/ARMContext";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData } from "@/Utility/funtion";

interface GlobalContextProviderProps {
  children: ReactNode;
}

interface GlobalContex {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  token: Token;
  userId: number;
  setToken: React.Dispatch<React.SetStateAction<Token>>;
  users: Users[];
  fetchDataSources: (
    page: number,
    limit: number
  ) => Promise<IDataSourceTypes[] | undefined>;
  getSearchDataSources: (
    page: number,
    limit: number,
    dataSourceName: string
  ) => Promise<IDataSourceTypes[]>;
  fetchDataSource: (id: number) => Promise<IDataSourceTypes>;
  isLoading: boolean;
  isCombinedUserLoading: boolean;
  setIsCombinedUserLoading: Dispatch<SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateProfileImage: React.Dispatch<React.SetStateAction<number>>;
  createDataSource: (postData: IDataSourcePostTypes) => Promise<void>;
  updateDataSource: (
    id: number,
    postData: IDataSourcePostTypes
  ) => Promise<void>;
  deleteDataSource: (id: number) => Promise<void>;

  fetchTenants: () => Promise<ITenantsTypes[] | undefined>;
  combinedUser: IUsersInfoTypes | undefined;
  setCombinedUser: React.Dispatch<
    React.SetStateAction<IUsersInfoTypes | undefined>
  >;
  // usersInfo: IUsersInfoTypes[];
  fetchCombinedUser: (
    page: number,
    limit: number
  ) => Promise<IGetResponeUsersInfoTypes | undefined>;
  searchCombinedUser: (
    page: number,
    limit: number,
    userName: string
  ) => Promise<IGetResponeUsersInfoTypes | undefined>;
  //lazy loading
  page: number;
  setPage: Dispatch<React.SetStateAction<number>>;
  totalPage: number;
  setTotalPage: Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  limit: number;
  setLimit: Dispatch<React.SetStateAction<number>>;
  deleteCombinedUser: (user_infos: IUsersInfoTypes[]) => Promise<void>;
  updateUser: (id: number, userInfo: IUpdateUserTypes) => void;
  isOpenModal: string;
  setIsOpenModal: Dispatch<SetStateAction<string>>;
  isOpenScheduleModal: string;
  setIsOpenScheduleModal: Dispatch<SetStateAction<string>>;
  resetPassword: (resetData: IUserPasswordResetTypes) => Promise<void>;
  isUserLoading: boolean;
  presentDevice: IUserLinkedDevices;
  setPresentDevice: Dispatch<SetStateAction<IUserLinkedDevices>>;
  stateChange: number;
  setStateChange: Dispatch<SetStateAction<number>>;
  signonId: string;
  setSignonId: Dispatch<SetStateAction<string>>;
  isActive: boolean;
  setIsActive: Dispatch<SetStateAction<boolean>>;
  edgeConnectionPosition: string[];
  setEdgeConnectionPosition: Dispatch<SetStateAction<string[]>>;
}

export const userExample = {
  isLoggedIn: false,
  user_id: 0,

  access_token: "",
  refresh_token: "",
};

const GlobalContex = createContext({} as GlobalContex);

export function useGlobalContext() {
  return useContext(GlobalContex);
}

export function GlobalContextProvider({
  children,
}: GlobalContextProviderProps) {
  // const { setIsOpenModal } = useManageAccessEntitlementsContext();
  const userDevice = useUserDevice();
  const api = useAxiosPrivate();
  const FLASK_ENDPOINT_URL = import.meta.env.VITE_FLASK_ENDPOINT_URL;
  const [open, setOpen] = useState<boolean>(false);
  const [token, setToken] = useState<Token>(userExample);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const [users, setUsers] = useState<Users[]>([]);
  const [combinedUser, setCombinedUser] = useState<IUsersInfoTypes>();
  const [isCombinedUserLoading, setIsCombinedUserLoading] = useState(true);
  const [stateChange, setStateChange] = useState<number>(0);
  // const [usersInfo, setUsersInfo] = useState<IUsersInfoTypes[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<string>("");
  const [isOpenScheduleModal, setIsOpenScheduleModal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updateProfileImage, setUpdateProfileImage] = useState(0);
  const userId = token?.user_id || 0;

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [signonId, setSignonId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [edgeConnectionPosition, setEdgeConnectionPosition] = useState<
    string[]
  >([]);

  const [presentDevice, setPresentDevice] = useState<IUserLinkedDevices>(
    userDevice()
  );

  useEffect(() => {
    const storedValue = localStorage.getItem("signonId");
    if (storedValue) {
      setSignonId(storedValue);
    }
  }, []);

  useEffect(() => {
    const storedValue = localStorage.getItem("presentDeviceInfo");
    if (storedValue) {
      const parsed: IUserLinkedDevices = JSON.parse(storedValue);
      setPresentDevice(parsed);
    }
  }, [presentDevice.id]);

  //get user (when refresh page user must be needed)
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await api.get<Token>("/auth/user");
        setToken(res.data);
      } catch (error) {
        console.log("Please login.");
      } finally {
        setIsUserLoading(false);
      }
    };
    getUser();
  }, [api, token?.user_id]);

  //Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsCombinedUserLoading(true);
        if (token?.user_id === 0) return;
        const [users, combinedUser] = await Promise.all([
          loadData({
            baseURL: FLASK_URL,
            url: flaskApi.Users,
            setLoading: setIsLoading,
            accessToken: `${token.access_token}`,
          }),
          loadData({
            baseURL: FLASK_URL,
            url: `${flaskApi.Users}/${token?.user_id}`,
            setLoading: setIsCombinedUserLoading,
            accessToken: `${token.access_token}`,
          }),
        ]);

        setUsers(users);
        setCombinedUser(combinedUser?.user);
      } catch (error) {
        console.log(error);
      } finally {
        setIsCombinedUserLoading(false);
      }
    };

    fetchUsers();
  }, [api, token?.user_id, updateProfileImage]);

  //user info
  const fetchCombinedUser = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const res = await api.get<IGetResponeUsersInfoTypes>(
        `/combined-user/${page}/${limit}`
      );

      setTotalPage(res.data.pages);
      setCurrentPage(res.data.page);
      return res.data ?? {};
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const searchCombinedUser = async (
    page: number,
    limit: number,
    userName: string
  ) => {
    try {
      setIsLoading(true);
      const res = await api.get<IGetResponeUsersInfoTypes>(
        `/combined-user/search/${page}/${limit}?user_name=${userName}`
      );

      // setUsersInfo(res.data.items ?? []);
      // setTotalPage(res.data.pages);
      // setCurrentPage(res.data.page);
      return res.data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (user_id: number, userInfo: IUpdateUserTypes) => {
    setIsLoading(true);
    try {
      const res = await axios.put(
        `${FLASK_ENDPOINT_URL}/users/${user_id}`,
        userInfo
      );

      if (res.status === 200) {
        setIsLoading(false);
        setIsOpenModal("");
        toast({
          description: `${res.data.message}`,
        });
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status) {
          toast({
            description: `${error.message}`,
          });
        }
      }
      console.log(error);
    } finally {
      setStateChange(Math.random() + 23 * 3000);
    }
  };
  const resetPassword = async (resetData: IUserPasswordResetTypes) => {
    try {
      setIsLoading(true);
      const res = await api.put(
        `/user-credentials/reset-password/${resetData.user_id}`,
        resetData
      );

      if (res.status === 200) {
        toast({
          description: `Password reset successfully.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: `Failed to reset password.`,
      });

      return;
    } finally {
      setIsLoading(false);
    }
  };
  const deleteCombinedUser = async (user_infos: IUsersInfoTypes[]) => {
    setIsLoading(true);
    try {
      for (const id of user_infos) {
        const [users, persons, credentials] = await Promise.all([
          api.delete(`/users/${id.user_id}`),
          api.delete(`/persons/${id.user_id}`),
          api.delete(`/user-credentials/${id.user_id}`),
        ]);
        if (
          users.status === 200 ||
          persons.status === 200 ||
          credentials.status === 200
        ) {
          toast({
            description: `Deleted successfully.`,
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast({
          description: `Error: ${error.message}`,
        });
      }
    } finally {
      setStateChange(Math.random() + 23 * 3000);
      setIsLoading(false);
    }
  };

  //Fetch DataSources
  const fetchDataSources = async (page: number, limit: number) => {
    try {
      const response = await api.get<{
        items: IDataSourceTypes[];
        pages: number;
        page: number;
      }>(`/def-data-sources/${page}/${limit}`);
      setTotalPage(response.data.pages);
      setCurrentPage(response.data.page);
      return response.data.items;
    } catch (error) {
      console.log(error);
    }
  };

  const getSearchDataSources = async (
    page: number,
    limit: number,
    dataSourceName: string
  ) => {
    try {
      const resultLazyLoading = await api.get(
        `/def-data-sources/search/${page}/${limit}?datasource_name=${dataSourceName}`
      );

      setTotalPage(resultLazyLoading.data.pages);
      setCurrentPage(resultLazyLoading.data.page);
      return resultLazyLoading.data.items;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDataSource = async (id: number): Promise<IDataSourceTypes> => {
    try {
      const response = await api.get<IDataSourceTypes>(
        `/def-data-sources/${id}`
      );
      if (response.status === 200) {
        // Check if status code indicates success
        return response.data;
      } else {
        throw new Error(
          `Failed to fetch data source, status code: ${response.status}`
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  const createDataSource = async (postData: IDataSourcePostTypes) => {
    const {
      datasource_name,
      description,
      application_type,
      application_type_version,
      last_access_synchronization_status,
      last_access_synchronization_date,
      last_transaction_synchronization_status,
      last_transaction_synchronization_date,
      default_datasource,
      created_by,
      last_updated_by,
    } = postData;
    try {
      const res = await api.post<IDataSourceTypes>(`/def-data-sources`, {
        datasource_name,
        description,
        application_type,
        application_type_version,
        last_access_synchronization_status,
        last_access_synchronization_date,
        last_transaction_synchronization_status,
        last_transaction_synchronization_date,
        default_datasource,
        created_by,
        last_updated_by,
      });
      // for sync data call fetch data source

      if (res.status === 201) {
        toast({
          description: `Data added successfully.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: `Failed to add data.`,
      });
      console.log(error);
    }
  };
  const updateDataSource = async (
    id: number,
    postData: IDataSourcePostTypes
  ) => {
    try {
      const res = await api.put<IDataSourcePostTypes>(
        `/def-data-sources/${id}`,
        // {
        //   data_source_id: id,
        //   datasource_name: postData.datasource_name,
        //   description: postData.description,
        //   application_type: postData.application_type,
        //   application_type_version: postData.application_type_version,
        //   last_access_synchronization_status:
        //     postData.last_access_synchronization_status,
        //   last_access_synchronization_date:
        //     postData.last_access_synchronization_date,
        //   last_transaction_synchronization_status:
        //     postData.last_transaction_synchronization_status,
        //   last_transaction_synchronization_date:
        //     postData.last_transaction_synchronization_date,
        //   default_datasource: postData.default_datasource,
        //   created_by: postData.created_by,
        //   last_updated_by: postData.last_updated_by,
        // }
        {
          description: postData.description,
          last_transaction_synchronization_date:
            postData.last_transaction_synchronization_date,
          last_updated_by: postData.last_updated_by,
        }
      );
      // for sync data call fetch data source
      if (res.status === 200) {
        toast({
          description: `Data updated successfully.`,
        });
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status == 408) {
          toast({
            description: `Can't change data already exist !.`,
          });
        }
      }

      console.log(error);
    }
  };
  const deleteDataSource = async (id: number) => {
    try {
      const res = await api.delete<IDataSourceTypes>(`/def-data-sources/${id}`);

      if (res.status === 200) {
        toast({
          description: "Deleted Succesfully",
        });
      }
      console.log(res);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error?.status === 500) {
          toast({
            title: "Info",
            description: `Error : ${error.message}`,
          });
        }
      }
      console.log(error);
    }
  };

  // Tenants
  const fetchTenants = async () => {
    try {
      const res = await api.get<ITenantsTypes[]>(`/def-tenants`);

      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <GlobalContex.Provider
      value={{
        open,
        setOpen,
        token,
        userId,
        setToken,
        users,
        fetchDataSources,
        getSearchDataSources,
        fetchDataSource,
        isLoading,
        isCombinedUserLoading,
        setIsCombinedUserLoading,
        setIsLoading,
        setUpdateProfileImage,
        createDataSource,
        updateDataSource,
        deleteDataSource,
        fetchTenants,
        combinedUser,
        setCombinedUser,
        // usersInfo,
        fetchCombinedUser,
        searchCombinedUser,
        page,
        setPage,
        totalPage,
        setTotalPage,
        currentPage,
        limit,
        setLimit,
        deleteCombinedUser,
        updateUser,
        isOpenModal,
        setIsOpenModal,
        isOpenScheduleModal,
        setIsOpenScheduleModal,
        resetPassword,
        isUserLoading,
        presentDevice,
        setPresentDevice,
        stateChange,
        setStateChange,
        signonId,
        setSignonId,
        isActive,
        setIsActive,
        edgeConnectionPosition,
        setEdgeConnectionPosition,
      }}
    >
      <SocketContextProvider>
        <ManageAccessEntitlementsProvider>
          <AACContextProvider>
            <ARMContextProvider>
              <Toaster />
              {children}
            </ARMContextProvider>
          </AACContextProvider>
        </ManageAccessEntitlementsProvider>
      </SocketContextProvider>
    </GlobalContex.Provider>
  );
}
