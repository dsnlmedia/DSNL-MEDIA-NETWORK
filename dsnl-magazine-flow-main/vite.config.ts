import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 9001,
    proxy: {
      '/blogger-feed': {
        target: 'https://dsnlmedia.blogspot.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/blogger-feed/, '/feeds/posts/default'),
        secure: true,
      },
      '/dsnl-news-feed': {
        target: 'https://dsnlmedia-news.blogspot.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dsnl-news-feed/, '/feeds/posts/default'),
        secure: true,
      },
      '/dsnl-editorials-feed': {
        target: 'https://dsnlmedia-editorials.blogspot.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dsnl-editorials-feed/, '/feeds/posts/default'),
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
