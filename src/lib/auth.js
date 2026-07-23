import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client, db } from "./db";

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to false to bypass email server requirement for now, or keep true if email verification is completed via OTP
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
      },
      department: {
        type: "string",
        defaultValue: "",
      },
      semester: {
        type: "string",
        defaultValue: "",
      },
      shift: {
        type: "string",
        defaultValue: "",
      },
      section: {
        type: "string",
        defaultValue: "",
      },
      phone: {
        type: "string",
        defaultValue: "",
      },
      roll: {
        type: "string",
        defaultValue: "",
      }
    },
  },
});
