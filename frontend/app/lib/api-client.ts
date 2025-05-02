import axios from "axios";
import type { AxiosRequestConfig } from "axios";

export interface Response<T> {
    count: number;
    next: string | null;
    results: T[];
}

const axiosInstance = axios.create({
    // baseURL: "https://api.rawg.io/api",
    baseURL: import.meta.env.VITE_API_URL,
    // params: {
    //   key: import.meta.env.VITE_API_KEY,
    // },
});

class ApiClient<T> {
    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    getAll = (config?: AxiosRequestConfig) =>
        axiosInstance
            .get<Response<T>>(this.endpoint, config)
            .then((res) => res.data);

    get = (id: number | string) =>
        axiosInstance.get<T>(this.endpoint + "/" + id).then((res) => res.data);
}

export default ApiClient;