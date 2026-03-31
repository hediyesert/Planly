import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_PROXY_TARGET || "http://127.0.0.1:5000";

  const proxy = {
    "^/(auth|exam-types|study-plans|study-sessions|tasks|users|friends|analytics)": {
      target,
      changeOrigin: true,
    },
    "/socket.io": {
      target,
      ws: true,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy,
    },
    preview: {
      port: 4173,
      proxy,
    },
  };
});
