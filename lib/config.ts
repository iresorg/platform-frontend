export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// No backend yet — every data module falls back to an in-memory mock
// implementation until NEXT_PUBLIC_API_BASE_URL is set.
export const USE_MOCK_API = !API_BASE_URL;
