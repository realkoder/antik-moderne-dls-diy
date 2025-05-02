import axios from "axios";

const apiCsr = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});


const apiSsr = axios.create({
    baseURL: process.env.VITE_BASE_URL_SSR || 'http://auth-service:3001',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});


apiCsr.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

apiSsr.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

apiCsr.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error.response?.data || error.message)
);

apiSsr.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error.response?.data || error.message)
);

export function useFetch<T>() {
    const fetchData = async (
        url: string,
        isSsr: boolean,
        config?: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
            data?: unknown;
            params?: Record<string, unknown>;
        }
    ): Promise<T> => {
        try {
            if (isSsr) {
                const response = await apiSsr({
                    url,
                    method: config?.method || 'GET',
                    data: config?.data,
                    params: config?.params,
                });
                return response as T;
            } else {
                const response = await apiCsr({
                    url,
                    method: config?.method || 'GET',
                    data: config?.data,
                    params: config?.params,
                });
                return response as T;
            }
        } catch (error) {
            throw new Error(error as string);
        }
    };

    return { fetchData };
}