import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // 🌟 1. Import Tailwind v4 Plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 🌟 2. Add it to your plugins array
  ],
});
