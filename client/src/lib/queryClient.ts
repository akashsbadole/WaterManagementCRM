import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Configure the API base URL based on the environment
// When running frontend and backend separately, use this variable to point to the backend server
const API_BASE_URL = import.meta.env.DEV && import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL 
  : ''; // Empty string means same origin (default)

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to prepend API base URL if needed
function getFullUrl(url: string): string {
  // Don't modify absolute URLs or URLs that are already prefixed with the base URL
  if (url.startsWith('http') || url.startsWith(API_BASE_URL)) {
    return url;
  }
  
  return `${API_BASE_URL}${url}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = getFullUrl(url);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the full URL with the API base URL if needed
    const url = getFullUrl(queryKey[0] as string);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
