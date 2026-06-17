import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server binds 0.0.0.0 so it works both locally and inside Docker.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
