import { NextResponse } from "next/server";
import { isGoogleConfigured } from "@/lib/google-oauth";

// Lets the login page know which buttons to draw, so an unconfigured
// provider shows nothing rather than a button that fails when tapped.
export async function GET() {
  return NextResponse.json({
    success: true,
    data: { google: isGoogleConfigured() },
  });
}
