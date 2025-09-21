// src/lib/api.ts

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function authenticatedFetch(
  url: string,
  token: string | null,
  options: FetchOptions = {}
): Promise<any> {
  console.log("🔑 Token being sent:", token ? "✓ Present" : "✗ Missing");

  if (!token) {
    throw new Error("User is not authenticated.");
  }

  // Normalize URL to always end with slash for FastAPI consistency
  const normalizedUrl = url.endsWith("/") ? url : `${url}/`;

  const defaultHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Debugging logs
  console.log(`🌐 API Request: ${options.method || "GET"} ${normalizedUrl}`);
  if (options.body) {
    console.log("📦 Request body:", options.body);
  }

  try {
    const response = await fetch(normalizedUrl, config);

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        console.error("❌ API Error details:", errorData);
      } catch {
        console.error("❌ Non-JSON error response");
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ API Response data:", data);
    return data;
  } catch (error: any) {
    console.error("❌ API Request failed:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection and try again.");
    }

    throw error;
  }
}

// ---------------------------------
// Repository API Wrapper
// ---------------------------------
export const repositoryApi = {
  list: async (
    token: string,
    params?: { skip?: number; limit?: number; is_private?: boolean; owner_id?: string }
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params?.is_private !== undefined) queryParams.append("is_private", params.is_private.toString());
    if (params?.owner_id) queryParams.append("owner_id", params.owner_id);

    const url = `http://localhost:8000/api/repositories${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return authenticatedFetch(url, token);
  },

  create: async (token: string, repoData: any) => {
    return authenticatedFetch("http://localhost:8000/api/repositories", token, {
      method: "POST",
      body: JSON.stringify(repoData),
    });
  },

  get: async (token: string, repoId: string) => {
    return authenticatedFetch(`http://localhost:8000/api/repositories/${repoId}`, token);
  },

  update: async (token: string, repoId: string, updateData: any) => {
    return authenticatedFetch(`http://localhost:8000/api/repositories/${repoId}`, token, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  },

  delete: async (token: string, repoId: string) => {
    return authenticatedFetch(`http://localhost:8000/api/repositories/${repoId}`, token, {
      method: "DELETE",
    });
  },

  fork: async (token: string, repoId: string) => {
    return authenticatedFetch(`http://localhost:8000/api/repositories/${repoId}/fork`, token, {
      method: "POST",
    });
  },
};

// ---------------------------------
// Generic error handler for UI components
// ---------------------------------
export const handleApiError = (error: any, setError: (error: string) => void) => {
  console.error("API Error:", error);

  if (error.message) {
    setError(error.message);
  } else if (typeof error === "string") {
    setError(error);
  } else {
    setError("An unexpected error occurred. Please try again.");
  }
};
