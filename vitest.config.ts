import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";
import { join } from "path";

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: "jsdom",
        env: loadEnv(join("test"), process.cwd(), ""),
        setupFiles: join("__tests__", "setup", "setup.ts")
    }
})