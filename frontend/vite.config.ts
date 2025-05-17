import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  optimizeDeps: {
    // Excluding com.chrome.devtools.json since it resulted in: Error: No route matches URL "/.well-known/appspecific/com.chrome.devtools.json"
    exclude: ['@chakra-ui/react', 'com.chrome.devtools.json'],
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['86be-195-249-146-101.ngrok-free.app', 'localhost', '0.0.0.0']
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
