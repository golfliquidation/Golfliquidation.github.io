/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_HOST_EMAIL?: string;
  readonly VITE_HOST_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
