import { getSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

const API_BASE_URL = process.env.API_BASE_URL; // Replace with your API Gateway URL

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const session = await getSession(); // Get session to retrieve token

  if (!session?.accessToken) {
    throw new Error("Unauthorized: No access token available");
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
