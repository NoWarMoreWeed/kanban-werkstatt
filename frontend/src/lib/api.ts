const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | object | null;
};

export async function apiFetch<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  const headers = new Headers(options?.headers);
  let body = options?.body;

  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
    body
  });

  if (!response.ok) {
    let message = "Die Daten konnten nicht geladen werden.";

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = payload.error?.message ?? message;
    } catch {
      // Fallback to the default message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}
