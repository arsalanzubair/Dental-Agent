import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    envPrefix: 'SUPABASE_', // Allow variables starting with SUPABASE_ to be exposed to client
    server: {
        port: 5173,
        strictPort: false, // Allow it to try 5174 if 5173 is temporarily locked
    }
});
