import axios from "axios";

/**
 * Base URL is configurable via Vite env vars.
 * Create `.env` with:
 *   VITE_API_BASE_URL=http://localhost:3000
 */
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8080";

/**
 * Normalized error shape thrown by this API layer.
 * @typedef {Object} ApiError
 * @property {string} message - Human readable message safe to show in UI.
 * @property {number | null} status - HTTP status code when available.
 * @property {string | null} code - Axios/internal code when available.
 * @property {any} details - Raw backend payload / extra context.
 */

/**
 * Convert Axios errors into a consistent error object.
 * @param {unknown} error
 * @returns {ApiError}
 */
function normalizeAxiosError(error) {
  // Axios error
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;

    // Backend may return JSON, string, or empty body.
    const data = error.response?.data;
    const backendMessage =
      (data && typeof data === "object" && ("message" in data ? data.message : null)) ||
      (typeof data === "string" ? data : null);

    // Provide nicer message for common cases.
    let message =
      backendMessage ||
      (status ? `Request failed with status ${status}` : "Network error. Please try again.");

    if (status === 409) {
      message = backendMessage || "Subscription already exists.";
    }

    return {
      message,
      status,
      code: error.code ?? null,
      details: data ?? null,
    };
  }

  // Non-Axios (unexpected) error
  if (error instanceof Error) {
    return { message: error.message, status: null, code: null, details: null };
  }

  return { message: "Unexpected error occurred.", status: null, code: null, details: error };
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

// Interceptors: normalize errors in one place.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeAxiosError(error)),
);

/**
 * GET /weather?city={city}
 * @param {string} city
 * @returns {Promise<{temperature:number, humidity:number, description:string}>}
 */
export async function getWeather(city) {
  const response = await apiClient.get("/weather", {
    params: { city },
  });
  return response.data;
}

/**
 * POST /subscribe (multipart/form-data)
 * form-data: email, city, frequency ("hourly" | "daily")
 * @param {string} email
 * @param {string} city
 * @param {"hourly" | "daily"} frequency
 * @returns {Promise<void>}
 */
export async function subscribeUser(email, city, frequency) {
  const form = new FormData();
  form.append("email", email);
  form.append("city", city);
  form.append("frequency", frequency);

  await apiClient.post("/subscribe", form);
}

/**
 * GET /confirm/{token}
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function confirmSubscription(token) {
  await apiClient.get(`/confirm/${encodeURIComponent(token)}`);
}

/**
 * GET /unsubscribe/{token}
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function unsubscribeUser(token) {
  await apiClient.get(`/unsubscribe/${encodeURIComponent(token)}`);
}

export default apiClient;
