import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import {
  ITenantsTypes,
  IUsersInfoTypes,
} from "@/types/interfaces/users.interface";
import { FC, useEffect, useState } from "react";
import { hourglass } from "ldrs";
import AddForm from "./AddForm";
import { X } from "lucide-react";
import EditForm from "./EditForm";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData, postData, putData } from "@/Utility/funtion";
interface IAddUserProps {
  selected: IUsersInfoTypes;
  handleCloseModal: () => void;
}
const AddUser: FC<IAddUserProps> = ({ selected, handleCloseModal }) => {
  const { token, isOpenModal, setStateChange } = useGlobalContext();
  const [userType, setUserType] = useState<string>("person");
  const [tenants, setTenants] = useState<ITenantsTypes[] | undefined>([]);
  const [isLoading, setIsLoading] = useState(false);

  hourglass.register();

  useEffect(() => {
    const fetchTenantsData = async () => {
      const params = {
        baseURL: FLASK_URL,
        url: flaskApi.DefTenants,
        accessToken: token.access_token as string,
      };
      try {
        const res = await loadData(params);
        if (res) {
          setTenants(res);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTenantsData();
  }, [token.access_token]);

  const FormSchema = z
    .object(
      isOpenModal === "add_user"
        ? {
            user_type: z.string(),
            user_name: z.string(),
            first_name: z.string(),
            middle_name: z.string().optional(),
            last_name: z.string().optional(),
            job_title: z.string(),
            tenant_id: z.string(),
            email_address: z.string().email(),
            password: z.string().min(8, {
              message: "At least 8 characters.",
            }),
            confirm_password: z.string().min(8, {
              message: "At least 8 characters need.",
            }),
          }
        : {
            user_name: z.string().optional(),
            first_name: z.string().optional(),
            middle_name: z.string().optional(),
            last_name: z.string().optional(),
            job_title: z.string().optional(),
            email_address: z.string().email(),
            password: z.string().optional(),
            confirm_password: z.string().optional(),
          }
    )
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues:
      isOpenModal === "add_user"
        ? {
            user_name: "",
            user_type: "person",
            email_address: "",
            tenant_id: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            job_title: "",
            password: "",
            confirm_password: "",
          }
        : {
            user_name: selected.user_name,
            job_title: selected.job_title,
            email_address: selected.email_address,
            password: "",
            confirm_password: "",
            first_name: selected.first_name,
            middle_name: selected.middle_name,
            last_name: selected.last_name,
            tenant_id: selected.tenant_id,
          },
  });
  const { reset } = form;
  const handleReset = () => {
    reset();
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const postDataPayload = {
      user_type: data.user_type,
      user_name: data.user_name,
      email_address: data.email_address,
      tenant_id: Number(data.tenant_id),
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      job_title: data.job_title,
      password: data.password,
    };

    console.log(postDataPayload);

    const postDataParams = {
      baseURL: FLASK_URL,
      url: flaskApi.Users,
      setLoading: setIsLoading,
      payload: postDataPayload,
      isConsole: true,
      isToast: true,
      accessToken: token.access_token,
    };
    const putDataPayload = {
      user_name: data.user_name,
      job_title: data.job_title,
      email_address: data.email_address,
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      password: data.password,
    };

    const putDataParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.Users}/${selected.user_id}`,
      setLoading: setIsLoading,
      payload: putDataPayload,
      // isConsole?: boolean;
      isToast: true,
      accessToken: token.access_token,
    };

    try {
      isOpenModal === "add_user" && (await postData(postDataParams));
      isOpenModal === "edit_user" && (await putData(putDataParams));
    } catch (error) {
      console.log(error);
    } finally {
      setStateChange(Math.random() + 23 * 3000);
      reset();
      handleCloseModal();
    }
  };
  return (
    <div className=" ">
      <div className="p-2 bg-slate-300 rounded-t mx-auto text-center font-bold flex justify-between">
        <h1>
          {isOpenModal === "edit_user" ? "Edit an Account" : "Add an Account"}
        </h1>

        <X onClick={() => handleCloseModal()} className="cursor-pointer" />
      </div>
      <div className="px-11 py-3">
        {isOpenModal === "edit_user" ? (
          <EditForm
            form={form}
            isLoading={isLoading}
            userType={userType}
            setUserType={setUserType}
            tenants={tenants}
            handleReset={handleReset}
            onSubmit={onSubmit}
          />
        ) : (
          <AddForm
            form={form}
            isLoading={isLoading}
            userType={userType}
            setUserType={setUserType}
            tenants={tenants}
            handleReset={handleReset}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default AddUser;
