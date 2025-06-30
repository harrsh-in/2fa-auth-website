"use client";

import { NEXT_PUBLIC_API_URL } from "@/utils/env";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { toast } from "react-toastify";

/**
 * Pre-configured Axios instance with error logging and base URL from env.
 */
const api: AxiosInstance = axios.create({
    baseURL: NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.data.message) toast.success(response.data.message);
        return response.data;
    },
    (
        error: AxiosError<{
            message?: string;
        }>
    ) => {
        toast.error(error.response?.data?.message || "Something went wrong.");
        return Promise.reject(error);
    }
);

export default api;
