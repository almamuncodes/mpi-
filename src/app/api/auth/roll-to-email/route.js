import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { roll } = await request.json();
    if (!roll) {
      return NextResponse.json({ error: "Roll number is required" }, { status: 400 });
    }

    // Better Auth stores user accounts in the "user" collection by default
    const user = await db.collection("user").findOne({ roll: roll.trim() });
    
    if (user) {
      return NextResponse.json({ email: user.email });
    } else {
      return NextResponse.json({ error: "No user found with this roll number" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 });
  }
}
