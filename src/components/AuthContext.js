"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { MOCK_USERS } from "@/data/mockData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const [user, setUser] = useState(null);

  // Sync user state with better-auth session data
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        nameEn: session.user.name,
        nameBn: session.user.name, // Fallback
        email: session.user.email,
        role: session.user.role || "student",
        department: session.user.department || "",
        semester: session.user.semester || "",
        shift: session.user.shift || "",
        section: session.user.section || "",
        phone: session.user.phone || "",
        photo: session.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (emailOrRoll, password) => {
    try {
      let targetEmail = emailOrRoll;

      // If it doesn't look like an email, treat it as a roll number
      if (!emailOrRoll.includes("@")) {
        const response = await fetch("/api/auth/roll-to-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roll: emailOrRoll }),
        });
        const resData = await response.json();
        if (!response.ok) {
          return { success: false, message: resData.error || "Roll number not found" };
        }
        targetEmail = resData.email;
      }

      const { data, error } = await authClient.signIn.email({
        email: targetEmail,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    try {
      // Step 1: Sign up user
      const { data, error } = await authClient.signUp.email({
        email: userData.email,
        password: userData.password,
        name: userData.nameEn,
        image: userData.photo,
        role: userData.role,
        department: userData.department,
        semester: userData.semester,
        shift: userData.shift,
        section: userData.section,
        phone: userData.phone,
        roll: userData.roll
      });

      if (error) {
        return { success: false, message: error.message };
      }

      // Step 2: Sign out immediately so they must verify first
      await authClient.signOut();

      // Step 3: Trigger real OTP send to their email
      const sendRes = await sendOtp(userData.email);
      if (!sendRes.success) {
        return { success: false, message: sendRes.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const sendOtp = async (email) => {
    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "signup" }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to send OTP" };
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type: "signup" }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Verification failed" };
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const quickLogin = (roleKey) => {
    if (MOCK_USERS[roleKey]) {
      const mock = MOCK_USERS[roleKey];
      setUser({
        nameEn: mock.nameEn,
        nameBn: mock.nameBn,
        email: mock.email,
        role: mock.role,
        department: mock.department || "",
        semester: mock.semester || "",
        shift: mock.shift || "",
        section: mock.section || "",
        phone: mock.phone || "",
        photo: mock.photo
      });
    }
  };

  const logout = async () => {
    await authClient.signOut();
    setUser(null);
  };

  const updateProfile = (updatedData) => {
    if (!user) return;
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, sendOtp, verifyOtp, quickLogin, logout, updateProfile, initialized: !isPending }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
