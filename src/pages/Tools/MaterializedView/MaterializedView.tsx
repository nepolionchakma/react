import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { postData } from "@/Utility/funtion";
import Spinner from "@/components/Spinner/Spinner";

const formSchema = z.object({
  materialized_view_name: z.string().min(2, {
    message: "Must be at least 2 characters.",
  }),
  schema_name: z.string().optional(),
});

const MaterializedView = () => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialized_view_name: "",
      schema_name: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const postMaterializedView = {
      baseURL: FLASK_URL,
      url: flaskApi.CreateAggregateTable,
      setLoading: setIsLoading,
      payload: values,
      isToast: true,
      accessToken: token.access_token,
    };

    await postData(postMaterializedView);
    form.reset();
  }
  return (
    <div className="flex justify-center items-center h-96">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create Aggregate Table</CardTitle>
          <CardDescription>
            Enter credentials for creating table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="materialized_view_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materialized View Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Materialized view name"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schema_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schema Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Schema Name" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex w-full justify-center">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner size="25" color="white" /> : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterializedView;
