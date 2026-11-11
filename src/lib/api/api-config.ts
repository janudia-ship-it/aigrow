
export const BACKEND_URL =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://172.16.20.58:81";
