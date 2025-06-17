import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobTitleTypes from "@/pages/Tools/SecurityConsole/ManageUsers/job_title.json";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
interface AddFormProps {
  form: UseFormReturn<FieldValues>;
  isLoading: boolean;
  userType: string;
  setUserType: Dispatch<SetStateAction<string>>;
  tenants: ITenantsTypes[] | undefined;
  handleReset: () => void;
  onSubmit: (data: any) => void;
}

const EditForm: FC<AddFormProps> = ({
  form,
  isLoading,
  userType,
  handleReset,
  onSubmit,
}) => {
  // console.log(form.getValues(), "form");
  const { token } = useGlobalContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="user_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    type="text"
                    placeholder="Username"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="job_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Job Title</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Job Title" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JobTitleTypes.map((item) => (
                      <SelectItem value={item.value} key={item.value}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">First Name</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="First Name" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middle_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Middle Name</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Middle Name" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Last Name</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Last Name" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            disabled={token.user_type !== "system" && userType === "system"}
            control={form.control}
            name="email_addresses"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="example@gmail.com"
                    multiple={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={token.user_type !== "system" && userType === "system"}
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={token.user_type !== "system" && userType === "system"}
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword2 ? "text" : "password"}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword2((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white"
                    >
                      {showPassword2 ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 pt-4 justify-end">
          <Button
            className="bg-white text-red-400 hover:text-Red-100 font-bold hover:bg-white border hover:shadow"
            onClick={handleReset}
          >
            Reset Form
          </Button>
          <Button type="submit" className="hover:shadow">
            {isLoading ? (
              <l-tailspin
                size="30"
                stroke="5"
                speed="0.9"
                color="white"
              ></l-tailspin>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default EditForm;
