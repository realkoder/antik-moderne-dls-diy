import { defineConfig } from "vitest/config";
import path from 'path'


export default defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./app"),
            '@components': path.resolve(__dirname, './src/components/'),
        },
    },
    test: {
        environment: "jsdom",
    },
});