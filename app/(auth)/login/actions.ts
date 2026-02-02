"use server";

import { cookies } from "next/headers";

export async function login() {
  // dummy login
  (await cookies()).set("session", "logged-in", {
    httpOnly: true,
    path: "/",
  });
}
