import { api } from "@/Api/Api";
import { toast } from "@/components/ui/use-toast";
import { AxiosResponse } from "axios";
import { Dispatch, SetStateAction } from "react";

interface loadDataParams {
  baseURL: string;
  url: string;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

interface postDataParams {
  baseURL: string;
  url: string;
  setLoading: Dispatch<SetStateAction<boolean>>;
  payload: any;
  isConsole?: boolean;
}

interface putDataParams {
  baseURL: string;
  url: string;
  setLoading: Dispatch<SetStateAction<boolean>>;
  payload: any;
  isConsole?: boolean;
}

export async function loadData(params: loadDataParams) {
  try {
    params.setLoading(true);
    const res = await api.get(`${params.url}`, {
      baseURL: params.baseURL,
    });
    if (res) {
      return res.data;
    }
  } catch (error) {
    if (error instanceof Error) {
      toast({ title: error.message, variant: "destructive" });
    }
    return undefined;
  } finally {
    params.setLoading(false);
  }
}

export async function postData(params: postDataParams) {
  try {
    params.setLoading(true);
    const res = await api.post(`${params.url}`, params.payload, {
      baseURL: params.baseURL,
    });
    if (res.status === 201) {
      toast({ title: res.data.message });
      return res;
    }
    if (res.status === 200) {
      toast({ title: res.data[0].message });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res as any;
    }
  } catch (error) {
    if (error instanceof Error) {
      toast({ title: error.message, variant: "destructive" });
      return error.message;
    }
  } finally {
    params.setLoading(false);
  }
}

export async function putData(params: putDataParams) {
  try {
    params.setLoading(true);
    const res = await api.put(`${params.url}`, params.payload, {
      baseURL: params.baseURL,
    });
    if (res.status === 200) {
      toast({ title: res.data.message });
      return res;
    }
  } catch (error) {
    if (error instanceof Error) {
      toast({ title: error.message, variant: "destructive" });
      return error.message;
    }
  } finally {
    params.setLoading(false);
  }
}
