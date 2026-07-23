"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    home: "Home",
    notices: "Notices",
    routine: "Routine",
    chat: "Chat",
    profile: "Profile",
    login: "Log In",
    logout: "Log Out",
    welcome: "Welcome to TechVerse MPI",
    departments: "Departments",
    viewAll: "View All",
    selectShift: "Select Shift",
    morningShift: "Morning Shift",
    dayShift: "Day Shift",
    chiefInstructor: "Chief Instructor",
    teachers: "Teachers",
    phone: "Phone",
    email: "Email",
    designation: "Designation",
    routineTitle: "Student Routine",
    restrictedRoutine: "Please log in to view your routine. You can only view the routine of your own Department, Semester, and Shift.",
    noticeTitle: "Notice Board",
    noticeHierarchyNote: "Principal notices are visible to everyone. Vice Principal notices are visible to all except the Principal. Department CI notices are visible to that department's students and teachers. Class notices are visible only to the specified class.",
    publishNotice: "Publish Notice",
    noticeTitleInput: "Notice Title",
    noticeContentInput: "Notice Content",
    noticeCategory: "Scope/Category",
    targetDept: "Target Department",
    targetSemester: "Target Semester",
    targetSection: "Target Section",
    allDepts: "All Departments",
    allSemesters: "All Semesters",
    allSections: "All Sections",
    postBtn: "Post Notice",
    chatTitle: "Class Chat Room",
    restrictedChat: "Please log in to enter your class chat room. You will be automatically connected to your Class Chat Group.",
    placeholderMsg: "Type a message...",
    send: "Send",
    fullName: "Full Name",
    personalInfo: "Personal Information",
    saveChanges: "Save Changes",
    semester: "Semester",
    shift: "Shift",
    section: "Section",
    role: "Role",
    student: "Student",
    ci: "Chief Instructor",
    vp: "Vice Principal",
    principal: "Principal",
    teacher: "Teacher",
    quickLogin: "Quick Switch Account (Testing)",
    quickLoginDesc: "Switch roles instantly to test different access levels and notices.",
    chooseDept: "Choose a Department first",
    photoUrl: "Photo URL",
    updateSuccess: "Profile updated successfully!",
    notAuthorizedNotice: "You do not have permission to publish notices under this category.",
    noNotices: "No notices available under your view permissions.",
    noRoutine: "No routine scheduled for your Class / Shift.",
    signUp: "Sign Up",
    forgotPassword: "Forgot Password?",
    dontHaveAccount: "Don't have an account? Sign Up",
    alreadyHaveAccount: "Already have an account? Log In",
    confirmPassword: "Confirm Password",
    verifyEmail: "Verify Email",
    codeSent: "Verification code sent to email",
    otpPrompt: "Enter 6-Digit OTP code sent to your email",
    verifyButton: "Verify & Activate Account",
    resendCode: "Resend Code",
    backToLogin: "Back to Log In",
    backToSignup: "Back to Sign Up",
    resetBtn: "Send Reset Link",
    resetSuccess: "Reset link sent successfully!",
    otpDemoText: "For testing, use OTP: 123456",
    selectRole: "Select Role",
    username: "Username",
    roll: "Roll Number"
  },
  bn: {
    home: "হোম",
    notices: "নোটিশ",
    routine: "রুটিন",
    chat: "চ্যাট",
    profile: "প্রোফাইল",
    login: "লগ ইন",
    logout: "লগ আউট",
    welcome: "টেকভার্স এমপিআই-তে আপনাকে স্বাগতম",
    departments: "ডিপার্টমেন্ট সমূহ",
    viewAll: "সব দেখুন",
    selectShift: "শিফট নির্বাচন করুন",
    morningShift: "মর্নিং শিফট",
    dayShift: "ডে শিফট",
    chiefInstructor: "চিফ ইন্সট্রাক্টর (CI)",
    teachers: "শিক্ষকগণ",
    phone: "মোবাইল নম্বর",
    email: "ইমেইল",
    designation: "পদবী",
    routineTitle: "ক্লাস রুটিন",
    restrictedRoutine: "আপনার রুটিন দেখতে অনুগ্রহ করে লগ ইন করুন। আপনি শুধুমাত্র আপনার নিজের ডিপার্টমেন্ট, সেমিস্টার এবং শিফটের রুটিন দেখতে পারবেন।",
    noticeTitle: "নোটিশ বোর্ড",
    noticeHierarchyNote: "অধ্যক্ষের নোটিশ সবার জন্য দৃশ্যমান। উপাধ্যক্ষের নোটিশ অধ্যক্ষ ব্যতীত সবার জন্য দৃশ্যমান। চিফ ইন্সট্রাক্টরের নোটিশ শুধুমাত্র সংশ্লিষ্ট বিভাগের শিক্ষার্থী ও শিক্ষকদের জন্য। ক্লাস নোটিশ শুধুমাত্র নির্দিষ্ট ক্লাসের শিক্ষার্থীদের জন্য।",
    publishNotice: "নোটিশ প্রকাশ করুন",
    noticeTitleInput: "নোটিশের শিরোনাম",
    noticeContentInput: "নোটিশের বিষয়বস্তু",
    noticeCategory: "নোটিশের ধরণ",
    targetDept: "টার্গেট ডিপার্টমেন্ট",
    targetSemester: "টার্গেট সেমিস্টার",
    targetSection: "টার্গেট সেকশন",
    allDepts: "সকল ডিপার্টমেন্ট",
    allSemesters: "সকল সেমিস্টার",
    allSections: "সকল সেকশন",
    postBtn: "নোটিশ পোস্ট করুন",
    chatTitle: "ক্লাস চ্যাট গ্রুপ",
    restrictedChat: "আপনার ক্লাস চ্যাট গ্রুপে প্রবেশ করতে অনুগ্রহ করে লগ ইন করুন। আপনার ডিপার্টমেন্ট, সেমিস্টার ও সেকশন অনুযায়ী স্বয়ংক্রিয়ভাবে চ্যাট গ্রুপে যুক্ত হবেন।",
    placeholderMsg: "বার্তা লিখুন...",
    send: "পাঠান",
    fullName: "পূর্ণ নাম",
    personalInfo: "ব্যগত তথ্য",
    saveChanges: "তথ্য আপডেট করুন",
    semester: "সেমিস্টার",
    shift: "শিফট",
    section: "সেকশন",
    role: "পদবী/রোল",
    student: "শিক্ষার্থী",
    ci: "চিফ ইন্সট্রাক্টর",
    vp: "উপাধ্যক্ষ",
    principal: "অধ্যক্ষ",
    teacher: "শিক্ষক",
    quickLogin: "কুইক অ্যাকাউন্ট সুইচ (টেস্টিং)",
    quickLoginDesc: "বিভিন্ন অ্যাক্সেস লেভেল এবং নোটিশ পরীক্ষা করতে তাৎক্ষণিকভাবে রোল পরিবর্তন করুন।",
    chooseDept: "প্রথমে একটি ডিপার্টমেন্ট নির্বাচন করুন",
    photoUrl: "ছবির লিংক",
    updateSuccess: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!",
    notAuthorizedNotice: "এই ক্যাটাগরিতে নোটিশ প্রকাশের অনুমতি আপনার নেই।",
    noNotices: "আপনার দেখার অনুমতি অনুযায়ী কোনো নোটিশ নেই।",
    noRoutine: "আপনার ক্লাস / শিফটের জন্য কোনো রুটিন নেই।",
    signUp: "রেজিস্ট্রেশন করুন",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    dontHaveAccount: "অ্যাকাউন্ট নেই? রেজিস্ট্রেশন করুন",
    alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে? লগ ইন করুন",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    verifyEmail: "ইমেল ভেরিফিকেশন",
    codeSent: "আপনার ইমেলে একটি ভেরিফিকেশন কোড পাঠানো হয়েছে",
    otpPrompt: "আপনার ইমেলে পাঠানো ৬ ডিজিটের ওটিপি (OTP) কোডটি দিন",
    verifyButton: "ভেরিফাই ও অ্যাকাউন্ট সচল করুন",
    resendCode: "কোডটি আবার পাঠান",
    backToLogin: "লগ ইনে ফিরে যান",
    backToSignup: "সাইন আপে ফিরে যান",
    resetBtn: "রিসেট লিংক পাঠান",
    resetSuccess: "পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!",
    otpDemoText: "পরীক্ষার জন্য ওটিপি কোড ব্যবহার করুন: 123456",
    selectRole: "রোল নির্বাচন করুন",
    username: "ইউজারনেম",
    roll: "রোল নম্বর"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("bn"); // default to Bengali as per screenshot

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "bn" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
