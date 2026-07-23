import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, otp, type } = await req.json();

    if (!email || !otp || !type) {
      return NextResponse.json(
        { success: false, message: "Email, OTP and type are required" },
        { status: 400 }
      );
    }

    // Find the latest OTP record
    const otpRecord = await db.collection("otps").findOne({ email, type });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if OTP is already expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await db.collection("otps").deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify code match
    if (otpRecord.otp !== otp.trim()) {
      const newAttempts = (otpRecord.attempts || 0) + 1;
      
      if (newAttempts >= 5) {
        await db.collection("otps").deleteOne({ _id: otpRecord._id });
        return NextResponse.json(
          { success: false, message: "Too many failed attempts. Please request a new code." },
          { status: 400 }
        );
      } else {
        await db.collection("otps").updateOne(
          { _id: otpRecord._id },
          { $set: { attempts: newAttempts } }
        );
        return NextResponse.json(
          { success: false, message: "Incorrect OTP code" },
          { status: 400 }
        );
      }
    }

    // OTP is correct!
    if (type === "signup") {
      // Mark user as verified in the user table
      await db.collection("user").updateOne(
        { email },
        { $set: { emailVerified: true } }
      );
      // Clean up/consume signup OTP
      await db.collection("otps").deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: true, message: "Verification Successful" },
        { status: 200 }
      );
    } else if (type === "reset-password") {
      // Set verified to true, to be consumed by the password reset endpoint
      await db.collection("otps").updateOne(
        { _id: otpRecord._id },
        { $set: { verified: true } }
      );
      return NextResponse.json(
        { success: true, message: "OTP Verified Successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid configuration" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[OTP Verify Error]", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong: " + err.message },
      { status: 500 }
    );
  }
}
