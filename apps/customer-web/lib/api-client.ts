const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("gg_access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
