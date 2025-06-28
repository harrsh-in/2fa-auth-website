"use client";

import { NEXT_PUBLIC_API_URL } from "@/utils/env";
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

/**
 * Pre-configured Axios instance with error logging and base URL from env.
 */
const api: AxiosInstance = axios.create({
    baseURL: NEXT_PUBLIC_API_URL,
});

api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Only return the data for successful responses
        return response.data;
    },
    (error: AxiosError) => {
        // Log the error but don't throw it
        console.error("API Error:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });

        // TODO: Show snackbar notification here in the future
        // For now, just log the error and don't break the component
    }
);

export default api;
