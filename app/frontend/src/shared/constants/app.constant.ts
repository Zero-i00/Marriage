export const IS_CLIENT = typeof window !== "undefined";

export const APP_HOST = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";
export const APP_PORT = process.env.NEXT_PUBLIC_PORT ?? "";
