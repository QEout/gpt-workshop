import { NextResponse } from "next/server";

export function throwError(error: Error | unknown): NextResponse {
  console.error("Error:", error);
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message });
  } else {
    return NextResponse.json({ error: "An unknown error occurred" });
  }
}
