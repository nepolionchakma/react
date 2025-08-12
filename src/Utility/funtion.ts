/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/Api/Api";
import { toast } from "@/components/ui/use-toast";
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
  isToast?: boolean;
}

interface putDataParams {
  baseURL: string;
  url: string;
  setLoading: Dispatch<SetStateAction<boolean>>;
  payload: any;
  isConsole?: boolean;
  isToast?: boolean;
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
    if (res.status === 201 || res.status === 200) {
      if (params.isToast) {
        toast({ title: res.data.message });
      }
      return res as any;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (params.isToast) {
        toast({ title: error.message, variant: "destructive" });
      }
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
      if (params.isToast) {
        toast({ title: res.data.message });
      }
      return res as any;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (params.isToast) {
        toast({ title: error.message, variant: "destructive" });
      }
      return error.message;
    }
  } finally {
    params.setLoading(false);
  }
}
