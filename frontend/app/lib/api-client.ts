import axios from "axios";

const isServer = typeof window === 'undefined';
console.log("IS SERVER", isServer);

const BASE_URL = isServer
    ? process.env.VITE_BASE_URL_SSR || 'http://auth-service:3001'
    : import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error.response?.data || error.message)
);

export function useFetch<T>() {
    const fetchData = async (
        url: string,
        config?: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
            data?: unknown;
            params?: Record<string, unknown>;
        }
    ): Promise<T> => {
        try {
            console.log("FETCHING THIS NOW", api.getUri());
            const response = await api({
                url,
                method: config?.method || 'GET',
                data: config?.data,
                params: config?.params,
            });
            return response as T;
        } catch (error) {
            throw new Error(error as string);
        }
    };

    return { fetchData };
}