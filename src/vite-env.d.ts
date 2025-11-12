/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAPI_URL: string;
  readonly VITE_AUDIT_TOKEN: string;
  // 👆 Aquí agregas las variables que tengas en tu .env
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
