import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("Environment variables:", {
      KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
      KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    });

    const authHeader = request.headers.get("Authorization");
    console.log("Received Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token);

    const keycloakUserInfoUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'myrealm'}/protocol/openid-connect/userinfo`;
    console.log("Keycloak Userinfo URL:", keycloakUserInfoUrl);

    const response = await fetch(keycloakUserInfoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Keycloak response status:", response.status);
    console.log("Keycloak response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Keycloak error response:", errorText);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userInfo = await response.json();
    console.log("User info fetched:", userInfo);
    return NextResponse.json(userInfo, { status: 200 });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 });
  }
}