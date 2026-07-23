"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { DEPARTMENTS, MOCK_USERS } from "@/data/mockData";
import { authClient } from "@/lib/auth-client";
import ImageCropModal from "./ui/ImageCropModal";

export default function ProfileView() {
  const { user, login, register, sendOtp, verifyOtp, quickLogin, logout, updateProfile } = useAuth();
  const { lang, t } = useLanguage();

  // Authentication Mode: 'login' | 'signup' | 'verify' | 'forgot'
  const [authMode, setAuthMode] = useState("login");

  // Login Form States
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Signup Form States
  const [signupNameEn, setSignupNameEn] = useState("");
  const [signupNameBn, setSignupNameBn] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupRole, setSignupRole] = useState("student");
  const [signupDept, setSignupDept] = useState("computer");
  const [signupSem, setSignupSem] = useState("5th");
  const [signupShift, setSignupShift] = useState("morning");
  const [signupSec, setSignupSec] = useState("A");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupRoll, setSignupRoll] = useState("");

  // OTP Verification States
  const [otpArray, setOtpArray] = useState(new Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Edit profile states
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Temporary container for registration data before OTP verification
  const [tempRegData, setTempRegData] = useState(null);

  // Manage resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (user) {
      setNameEn(user.nameEn || "");
      setNameBn(user.nameBn || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPhoto(user.photo || "");
      setImagePreview(user.photo || "");
    }
  }, [user]);

  // Handle Login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!usernameInput || !passwordInput) {
      setLoginError(lang === "en" ? "Please fill in all fields." : "অনুগ্রহ করে সব তথ্য পূরণ করুন।");
      return;
    }

    const res = await login(usernameInput, passwordInput);
    if (!res.success) {
      setLoginError(lang === "en" ? "Invalid Email or Password." : "ভুল ইমেল অথবা পাসওয়ার্ড।");
    } else {
      setUsernameInput("");
      setPasswordInput("");
    }
  };

  // Handle Signup submission (takes user to verify step)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");

    if (!signupNameEn || !signupNameBn || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setSignupError(lang === "en" ? "Please fill in all fields." : "অনুগ্রহ করে সব তথ্য পূরণ করুন।");
      return;
    }

    if (signupRole === "student" && !signupRoll) {
      setSignupError(lang === "en" ? "Please enter your Roll Number." : "অনুগ্রহ করে আপনার রোল নম্বর লিখুন।");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError(lang === "en" ? "Passwords do not match." : "পাসওয়ার্ড দুটি মিলছে না।");
      return;
    }

    // Save signup details to temporary state
    const regData = {
      username: signupEmail.split("@")[0],
      password: signupPassword,
      nameEn: signupNameEn,
      nameBn: signupNameBn,
      email: signupEmail,
      phone: "+8801555" + Math.floor(100000 + Math.random() * 900000),
      role: signupRole,
      department: signupRole === "student" || signupRole === "teacher" ? signupDept : null,
      semester: signupRole === "student" ? signupSem : null,
      shift: signupRole === "student" ? signupShift : null,
      section: signupRole === "student" ? signupSec : null,
      roll: signupRole === "student" ? signupRoll.trim() : "",
      photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };

    const res = await register(regData);
    if (res.success) {
      setTempRegData(regData);
      setAuthMode("verify");
      setResendCooldown(60);
      setOtpArray(new Array(6).fill(""));
      setOtpError("");
    } else {
      setSignupError(res.message || "Registration failed.");
    }
  };

  // Handle OTP Inputs Change
  const handleOtpChange = (value, idx) => {
    if (isNaN(value)) return;
    const newOtp = [...otpArray];
    newOtp[idx] = value.substring(value.length - 1);
    setOtpArray(newOtp);

    // Auto-focus next field
    if (value && idx < 5) {
      otpRefs.current[idx + 1].focus();
    }
  };

  // Handle OTP Backspace key
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otpArray[idx] && idx > 0) {
      otpRefs.current[idx - 1].focus();
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    const code = otpArray.join("");

    if (code.length < 6) {
      setOtpError(lang === "en" ? "Please enter all 6 digits." : "অনুগ্রহ করে ৬টি ডিজিটই লিখুন।");
      return;
    }

    const res = await verifyOtp(tempRegData.email, code);
    if (res.success) {
      // Authenticate the user right away
      const logRes = await login(tempRegData.email, tempRegData.password);
      if (logRes.success) {
        setAuthMode("login");
        setTempRegData(null);
      } else {
        setOtpError(logRes.message || "Failed to log in after verification.");
      }
    } else {
      setOtpError(res.message || "Incorrect code. Please try again.");
    }
  };

  // Handle Forgot Password submission
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSuccess("");
    if (!forgotEmail) return;

    setForgotSuccess(t("resetSuccess"));
    setForgotEmail("");
    setTimeout(() => {
      setAuthMode("login");
      setForgotSuccess("");
    }, 2000);
  };

  // Cloudinary image upload function
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "easymess_preset");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "kkvshrff"}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error("Image upload failed");
    }

    return data.secure_url;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropImageSrc(URL.createObjectURL(file));
  };

  const handleCroppedImageApply = ({ file, previewUrl }) => {
    setImageFile(file);
    setImagePreview(previewUrl);
    setCropImageSrc(null);
  };

  const handleCancelEdit = () => {
    setNameEn(user.nameEn || "");
    setNameBn(user.nameBn || "");
    setPhone(user.phone || "");
    setImagePreview(user.photo || "");
    setImageFile(null);
    setIsEditing(false);
  };

  // Profile Edit Update using Cloudinary
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setSavingProfile(true);

    try {
      let imageUrl = photo;

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      // Update Better Auth database through SDK
      await authClient.updateUser({
        name: nameEn,
        image: imageUrl,
        phone: phone
      });

      // Update local AuthContext state
      updateProfile({
        nameEn: nameEn,
        nameBn: nameBn || nameEn,
        phone: phone,
        photo: imageUrl
      });

      setPhoto(imageUrl);
      setImagePreview(imageUrl);
      setImageFile(null);
      setSuccessMsg(t("updateSuccess"));
      setIsEditing(false);
    } catch (err) {
      console.error("Update profile failed:", err);
      setSuccessMsg(lang === "en" ? "Failed to update profile. Please try again." : "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setSavingProfile(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const getDeptName = (deptId) => {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    return dept ? (lang === "en" ? dept.nameEn : dept.nameBn) : deptId;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* 1. Logged out Views */}
      {!user && (
        <div className="max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 shadow-md space-y-6 animate-scale-up">
          
          {/* Sign In Screen */}
          {authMode === "login" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">🔐</span>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {t("login")}
                </h2>
                <p className="text-xs text-zinc-550 dark:text-zinc-400">
                  {lang === "en" ? "Sign in to enter routines and chat groups" : "রুটিন ও চ্যাট গ্রুপে প্রবেশ করতে সাইন ইন করুন"}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                    {t("username")} / {t("email")}
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="student_cst_m"
                    className="w-full h-11 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      {lang === "en" ? "Password" : "পাসওয়ার্ড"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-xs font-bold text-blue-500 dark:text-blue-400 hover:underline"
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="123"
                    className="w-full h-11 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-blue-500 font-bold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xs cursor-pointer"
                >
                  {t("login")}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-405 hover:underline"
                >
                  {t("dontHaveAccount")}
                </button>
              </div>
            </div>
          )}

          {/* Sign Up Screen */}
          {authMode === "signup" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">📝</span>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {t("signUp")}
                </h2>
                <p className="text-xs text-zinc-550 dark:text-zinc-400">
                  {lang === "en" ? "Create your TechVerse MPI account" : "আপনার টেকভার্স এমপিআই অ্যাকাউন্ট তৈরি করুন"}
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {signupError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold">
                    {signupError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">{t("fullName")} (EN)</label>
                    <input
                      type="text"
                      value={signupNameEn}
                      onChange={(e) => setSignupNameEn(e.target.value)}
                      placeholder="Sadia Rahman"
                      className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">{t("fullName")} (BN)</label>
                    <input
                      type="text"
                      value={signupNameBn}
                      onChange={(e) => setSignupNameBn(e.target.value)}
                      placeholder="সাদিয়া রহমান"
                      className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">{t("email")}</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="sadia@gmail.com"
                    className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">{t("selectRole")}</label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-2 text-xs focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    >
                      <option value="student">Student / শিক্ষার্থী</option>
                      <option value="teacher">Teacher / শিক্ষক</option>
                    </select>
                  </div>
                  {signupRole === "student" ? (
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">{t("roll")}</label>
                      <input
                        type="text"
                        value={signupRoll}
                        onChange={(e) => setSignupRoll(e.target.value)}
                        placeholder="e.g. 502123"
                        className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">{t("targetDept")}</label>
                      <select
                        value={signupDept}
                        onChange={(e) => setSignupDept(e.target.value)}
                        className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-2 text-xs focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      >
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {signupRole === "student" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">{t("targetDept")}</label>
                      <select
                        value={signupDept}
                        onChange={(e) => setSignupDept(e.target.value)}
                        className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-2 text-xs focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      >
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
                      </select>
                    </div>
                    <div>
                      {/* Blank placeholder */}
                    </div>
                  </div>
                )}

                {signupRole === "student" && (
                  <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">{t("semester")}</label>
                      <select
                        value={signupSem}
                        onChange={(e) => setSignupSem(e.target.value)}
                        className="w-full h-8 rounded-md border border-zinc-250 bg-white px-1 text-xs dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value="1st">1st Sem</option>
                        <option value="3rd">3rd Sem</option>
                        <option value="5th">5th Sem</option>
                        <option value="7th">7th Sem</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">{t("shift")}</label>
                      <select
                        value={signupShift}
                        onChange={(e) => setSignupShift(e.target.value)}
                        className="w-full h-8 rounded-md border border-zinc-250 bg-white px-1 text-xs dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value="morning">Morning</option>
                        <option value="day">Day</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">{t("section")}</label>
                      <select
                        value={signupSec}
                        onChange={(e) => setSignupSec(e.target.value)}
                        className="w-full h-8 rounded-md border border-zinc-250 bg-white px-1 text-xs dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value="A">Sec A</option>
                        <option value="B">Sec B</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">{lang === "en" ? "Password" : "পাসওয়ার্ড"}</label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">{t("confirmPassword")}</label>
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-blue-500 font-bold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xs cursor-pointer"
                >
                  {t("signUp")}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-405 hover:underline"
                >
                  {t("alreadyHaveAccount")}
                </button>
              </div>
            </div>
          )}

          {/* OTP Verification Screen */}
          {authMode === "verify" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">📧</span>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {t("verifyEmail")}
                </h2>
                <p className="text-xs text-zinc-550 dark:text-zinc-400">
                  {t("otpPrompt")}
                </p>
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg font-bold">
                  ⚠️ {t("otpDemoText")}
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {otpError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold">
                    {otpError}
                  </div>
                )}

                {/* 6 OTP boxes */}
                <div className="flex justify-center gap-2">
                  {otpArray.map((val, idx) => (
                    <input
                      key={idx}
                      type="text"
                      ref={(el) => (otpRefs.current[idx] = el)}
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="h-12 w-10 text-center rounded-lg border-2 border-zinc-250 bg-white text-lg font-bold text-zinc-900 focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-blue-500 font-bold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xs cursor-pointer"
                >
                  {t("verifyButton")}
                </button>
              </form>

              <div className="flex flex-col items-center gap-3 pt-2 text-xs">
                <button
                  disabled={resendCooldown > 0}
                  onClick={async () => {
                    setResendCooldown(60);
                    const res = await sendOtp(tempRegData.email);
                    if (res.success) {
                      alert("A new verification code has been sent to your email!");
                    } else {
                      alert("Error: " + res.message);
                    }
                  }}
                  className={`font-bold hover:underline ${resendCooldown > 0 ? "text-zinc-400 cursor-not-allowed" : "text-blue-500 dark:text-blue-400"}`}
                >
                  {t("resendCode")} {resendCooldown > 0 ? `(${resendCooldown}s)` : ""}
                </button>

                <button
                  onClick={() => setAuthMode("signup")}
                  className="font-bold text-zinc-550 hover:underline"
                >
                  ← {t("backToSignup")}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Screen */}
          {authMode === "forgot" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">🔑</span>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {t("forgotPassword")}
                </h2>
                <p className="text-xs text-zinc-550 dark:text-zinc-400">
                  {lang === "en" ? "Enter your email to receive a password reset link" : "পাসওয়ার্ড রিসেট লিংক পেতে আপনার ইমেইল লিখুন"}
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-xs font-semibold">
                    {forgotSuccess}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="sadia@gmail.com"
                    className="w-full h-11 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-blue-500 font-bold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xs cursor-pointer"
                >
                  {t("resetBtn")}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-xs font-bold text-zinc-550 hover:underline"
                >
                  ← {t("backToLogin")}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. Logged in Profile Settings */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* User Details Sidebar */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs h-fit space-y-6 text-center">
            
            {/* Profile Avatar Container */}
            <div className="relative inline-block group">
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="block cursor-pointer focus:outline-none"
                title="View Photo"
              >
                <img
                  src={imagePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                  alt="Avatar"
                  className="h-28 w-28 rounded-3xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm mx-auto group-hover:scale-105 transition-transform"
                />
              </button>
              {isEditing ? (
                <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white h-8 px-2.5 rounded-full flex items-center justify-center text-xs font-bold shadow-md cursor-pointer border-2 border-white dark:border-zinc-900">
                  📁 {lang === "en" ? "Upload" : "আপলোড"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <span className="absolute bottom-0 right-0 bg-zinc-200 text-zinc-700 h-7 w-7 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white dark:border-zinc-900">
                  ✓
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                {lang === "en" ? user.nameEn : user.nameBn}
              </h3>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 capitalize mt-1">
                {t(user.role)}
              </p>
            </div>

            {/* Profile Meta Cards */}
            <div className="text-left text-xs bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 space-y-3">
              {user.email && (
                <div>
                  <span className="font-semibold text-zinc-450 block mb-0.5">{t("email")}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate block">{user.email}</span>
                </div>
              )}
              {user.roll && (
                <div>
                  <span className="font-semibold text-zinc-450 block mb-0.5">{t("roll")}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{user.roll}</span>
                </div>
              )}
              {user.department && (
                <div>
                  <span className="font-semibold text-zinc-450 block mb-0.5">{t("targetDept")}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{getDeptName(user.department)}</span>
                </div>
              )}
              {user.semester && (
                <div>
                  <span className="font-semibold text-zinc-450 block mb-0.5">{t("semester")}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{user.semester} Semester</span>
                </div>
              )}
              {user.shift && (
                <div>
                  <span className="font-semibold text-zinc-450 block mb-0.5">{t("shift")}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">
                    {user.shift === "morning" ? t("morningShift") : t("dayShift")}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                logout();
                setAuthMode("login");
              }}
              className="w-full h-10 rounded-lg bg-red-50 text-red-650 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 text-sm font-bold transition-all cursor-pointer"
            >
              {t("logout")}
            </button>
          </div>

          {/* Edit Profile Form / Details Panel */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-l-4 border-blue-500 pl-3">
                {t("personalInfo")}
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-bold text-blue-500 hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-zinc-850 cursor-pointer"
                >
                  {lang === "en" ? "Edit details" : "তথ্য পরিবর্তন"}
                </button>
              )}
            </div>

            {successMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-455 rounded-lg text-xs font-semibold">
                {successMsg}
              </div>
            )}

            {!isEditing ? (
              /* VIEW ONLY MODE */
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <span className="font-bold text-zinc-500">{t("fullName")}</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{lang === "en" ? user.nameEn : user.nameBn}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <span className="font-bold text-zinc-500">{t("phone")}</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{user.phone || "-"}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-1">
                  <span className="font-bold text-zinc-500">{t("role")}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{t(user.role)}</span>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Profile Picture Upload Container */}
                <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="relative shrink-0">
                    <img
                      src={imagePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                      alt="Preview"
                      className="h-16 w-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4 text-xs font-bold cursor-pointer transition-all shadow-xs">
                      📷 {lang === "en" ? "Change Photo" : "ছবি পরিবর্তন করুন"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                      Supports JPG, PNG, GIF. Max 4MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">
                      {t("fullName")} (English)
                    </label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">
                      {t("fullName")} (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                      className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">
                    {t("phone")}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 h-11 rounded-lg border border-zinc-250 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350 dark:hover:bg-zinc-800 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex-1 h-11 rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. Quick Account Switcher (Always show at bottom for testing) */}
      <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 p-6 space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
            ⚙️ {t("quickLogin")}
          </h3>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
            {t("quickLoginDesc")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { key: "principal", label: "Principal", emoji: "👨‍💼" },
            { key: "vp", label: "Vice Principal", emoji: "👩‍💼" },
            { key: "ci_cst", label: "CST CI", emoji: "👨‍🏫" },
            { key: "student_cst_morning", label: "CST Morning Stud", emoji: "🌅" },
            { key: "student_cst_day", label: "CST Day Stud", emoji: "☀️" },
            { key: "student_civil", label: "Civil Stud", emoji: "🏗️" }
          ].map((account) => (
            <button
              key={account.key}
              onClick={() => {
                quickLogin(account.key);
                setAuthMode("login");
                setSuccessMsg(lang === "en" ? `Logged in as ${account.label}` : `${account.label} হিসেবে লগ ইন করা হয়েছে`);
                setTimeout(() => setSuccessMsg(""), 3000);
              }}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-center cursor-pointer shadow-2xs"
            >
              <span className="text-xl mb-1">{account.emoji}</span>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-350 truncate w-full">
                {account.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= Image Crop & Filter Editor Modal ================= */}
      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onApply={handleCroppedImageApply}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      {/* ================= Image Lightbox Modal ================= */}
      {showImageModal && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={imagePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80"}
              alt="Profile Lightbox"
              className="h-auto w-[80vw] max-w-md rounded-3xl object-cover shadow-2xl border border-zinc-800"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white font-bold text-zinc-900 shadow cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
