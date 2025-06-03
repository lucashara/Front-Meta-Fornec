import { defineConfig } from "vite";

export default defineConfig({
  define: {
    global: {},
    "process.env": {},
  },
  resolve: {
    alias: {
      "./runtimeConfig": "./runtimeConfig.browser",
    },
  },
});
