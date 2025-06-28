// See: https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser

/**
 * For client-side code, process.env.NEXT_PUBLIC_* variables are inlined at build time.
 * For server-side code, process.env.NEXT_PUBLIC_* is available at runtime.
 *
 * Do NOT use runtime validation for client-side, as process.env is not available at runtime in the browser.
 *
 * Usage:
 *   import { NEXT_PUBLIC_API_URL } from "@/utils/env";
 *   api.get(`${NEXT_PUBLIC_API_URL}/endpoint`)
 */

export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Optionally, throw at runtime on the server if missing
if (typeof window === "undefined" && !NEXT_PUBLIC_API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set in environment variables.");
}
