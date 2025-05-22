// src/services/api_keyclock.ts

export const fetchWithToken = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}), // Safely spread headers
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", // Optional: Add default Content-Type
    },
  });
};