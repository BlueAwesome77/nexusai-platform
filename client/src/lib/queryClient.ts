import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${res.status}: ${errorText}`);
  }
}

export async function apiRequest(
  method: string,
  path: string,
  body?: any
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (body && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(path, {
    method,
    headers,
    body,
  });

  await throwIfResNotOk(response);
  return response;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await apiRequest("GET", queryKey[0] as string);
        return response.json();
      },
    },
  },
});
