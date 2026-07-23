import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, type } = await req.json();

    if (!email || !type) {
      return NextResponse.json(
        { success: false, message: "Email and type are required" },
        { status: 400 }
      );
    }

    if (type !== "signup" && type !== "reset-password") {
      return NextResponse.json(
        { success: false, message: "Invalid OTP type" },
        { status: 400 }
      );
    }

    // Check resend cooldown (60 seconds)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOtp = await db.collection("otps").findOne({
      email,
      type,
      createdAt: { $gt: oneMinuteAgo },
    });

    if (recentOtp) {
      return NextResponse.json(
        { success: false, message: "Please wait 60 seconds before requesting another code." },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete older OTPs for this email & type
    await db.collection("otps").deleteMany({ email, type });

    // Insert new OTP
    await db.collection("otps").insertOne({
      email,
      otp,
      type,
      expiresAt,
      createdAt: new Date(),
      attempts: 0,
    });

    // Send email
    await sendOtpEmail(email, otp, type);

    return NextResponse.json(
      { success: true, message: "OTP Sent Successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[OTP Send Error]", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong: " + err.message },
      { status: 500 }
    );
  }
}
