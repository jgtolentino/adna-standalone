import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: expose NEXT_PUBLIC_* in import.meta.env (Supabase→Vercel integration uses this prefix)
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
});
