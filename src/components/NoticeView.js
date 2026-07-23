"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { INITIAL_NOTICES, DEPARTMENTS } from "@/data/mockData";

export default function NoticeView() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [notices, setNotices] = useState([]);
  
  // Form state
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentBn, setContentBn] = useState("");
  const [category, setCategory] = useState("principal");
  const [targetDept, setTargetDept] = useState("all");
  const [targetSem, setTargetSem] = useState("all");
  const [targetSec, setTargetSec] = useState("all");
  
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Load notices from local state or localStorage
  useEffect(() => {
    const savedNotices = localStorage.getItem("notices");
    if (savedNotices) {
      try {
        setNotices(JSON.parse(savedNotices));
      } catch (e) {
        setNotices(INITIAL_NOTICES);
      }
    } else {
      setNotices(INITIAL_NOTICES);
      localStorage.setItem("notices", JSON.stringify(INITIAL_NOTICES));
    }
  }, []);

  // Filter notices based on logged-in user role and hierarchy rules
  const getFilteredNotices = () => {
    if (!user) {
      // Unauthenticated users can only see Principal notices
      return notices.filter((notice) => notice.category === "principal");
    }

    return notices.filter((notice) => {
      // 1. Principal Notices: Visible to everyone
      if (notice.category === "principal") {
        return true;
      }

      // 2. Vice Principal Notices: Visible to VP, CI, Teacher, Student, Departments. NOT visible to Principal!
      if (notice.category === "vp") {
        return user.role !== "principal";
      }

      // 3. Department CI Notices: Visible only to students and teachers of that department
      if (notice.category === "ci") {
        // Must match department
        if (user.role === "principal" || user.role === "vp") {
          return true; // Principal and VP can oversee
        }
        return user.department === notice.department;
      }

      // 4. Class Notices: Visible only to the students of that specific class (dept, semester, section)
      if (notice.category === "class") {
        if (user.role === "principal" || user.role === "vp") {
          return true; // Admin visibility
        }
        if (user.role === "ci") {
          return user.department === notice.department; // CI can see notices of their own department
        }
        // Students can only see if department, semester, and section match
        return (
          user.department === notice.department &&
          user.semester === notice.semester &&
          user.section === notice.section
        );
      }

      return false;
    });
  };

  // Check if current user is authorized to publish notices
  const canPublish = () => {
    if (!user) return false;
    return ["principal", "vp", "ci", "student"].includes(user.role); // Students can publish class notices for tests
  };

  const handlePublish = (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!titleEn || !titleBn || !contentEn || !contentBn) {
      setFormError(lang === "en" ? "Please fill in all fields." : "অনুগ্রহ করে সকল তথ্য পূরণ করুন।");
      return;
    }

    // Role-based Category restrictions
    if (category === "principal" && user.role !== "principal") {
      setFormError(t("notAuthorizedNotice"));
      return;
    }
    if (category === "vp" && user.role !== "vp") {
      setFormError(t("notAuthorizedNotice"));
      return;
    }
    if (category === "ci" && user.role !== "ci" && user.role !== "principal" && user.role !== "vp") {
      setFormError(t("notAuthorizedNotice"));
      return;
    }

    const newNotice = {
      id: Date.now(),
      titleEn,
      titleBn,
      contentEn,
      contentBn,
      category,
      department: category === "ci" || category === "class" ? (user.department || targetDept) : null,
      semester: category === "class" ? (user.semester || targetSem) : null,
      section: category === "class" ? (user.section || targetSec) : null,
      date: new Date().toISOString().split("T")[0],
      authorEn: `${user.nameEn} (${t(user.role)})`,
      authorBn: `${user.nameBn} (${t(user.role)})`
    };

    const updatedNotices = [newNotice, ...notices];
    setNotices(updatedNotices);
    localStorage.setItem("notices", JSON.stringify(updatedNotices));

    // Reset Form
    setTitleEn("");
    setTitleBn("");
    setContentEn("");
    setContentBn("");
    setFormSuccess(lang === "en" ? "Notice published successfully!" : "নোটিশ সফলভাবে প্রকাশিত হয়েছে!");
  };

  const filtered = getFilteredNotices();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Notice Board Description Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl border border-blue-500/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t("noticeTitle")}
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {t("noticeHierarchyNote")}
          </p>
        </div>
        {user && (
          <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-extrabold px-3 py-1.5 rounded-lg capitalize">
            {lang === "en" ? `View: ${user.role} mode` : `ভিউ: ${t(user.role)} মোড`}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Notices Feed List */}
        <div className="lg:col-span-2 space-y-6">
          {filtered.length > 0 ? (
            filtered.map((notice) => (
              <div
                key={notice.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Category Badge Indicator */}
                <div className="absolute top-0 left-0 w-2.5 h-full bg-blue-500" style={{
                  backgroundColor: notice.category === "principal" ? "#ef4444" : 
                                   notice.category === "vp" ? "#f59e0b" : 
                                   notice.category === "ci" ? "#3b82f6" : "#10b981"
                }} />

                <div className="pl-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-350">
                      {notice.category} Notice
                    </span>
                    <span className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold">
                      📅 {notice.date}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white leading-snug">
                    {lang === "en" ? notice.titleEn : notice.titleBn}
                  </h3>

                  <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {lang === "en" ? notice.contentEn : notice.contentBn}
                  </p>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      ✍️ {lang === "en" ? notice.authorEn : notice.authorBn}
                    </span>
                    {notice.department && (
                      <span className="bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-md">
                        {notice.department.toUpperCase()} {notice.semester ? `${notice.semester}` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-12 text-center">
              <span className="text-4xl">🔔</span>
              <p className="text-zinc-650 dark:text-zinc-400 font-semibold mt-4">
                {t("noNotices")}
              </p>
            </div>
          )}
        </div>

        {/* Publish Notice Sidebar Board */}
        {canPublish() && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 h-fit shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-l-4 border-blue-500 pl-3">
              {t("publishNotice")}
            </h3>

            <form onSubmit={handlePublish} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-450 rounded-lg text-xs font-semibold">
                  {formSuccess}
                </div>
              )}

              {/* Scope Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  {t("noticeCategory")}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm text-zinc-800 focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                >
                  {user.role === "principal" && <option value="principal">Principal Notice</option>}
                  {user.role === "vp" && <option value="vp">Vice Principal Notice</option>}
                  {(user.role === "ci" || user.role === "principal" || user.role === "vp") && (
                    <option value="ci">Department CI Notice</option>
                  )}
                  <option value="class">Class Notice</option>
                </select>
              </div>

              {/* Target options for class notices if published by admin */}
              {category === "class" && !user.department && (
                <div className="space-y-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-550 mb-1">{t("targetDept")}</label>
                    <select
                      value={targetDept}
                      onChange={(e) => setTargetDept(e.target.value)}
                      className="w-full h-8 rounded-md border border-zinc-250 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-550 mb-1">{t("targetSemester")}</label>
                    <select
                      value={targetSem}
                      onChange={(e) => setTargetSem(e.target.value)}
                      className="w-full h-8 rounded-md border border-zinc-250 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <option value="1st">1st Semester</option>
                      <option value="3rd">3rd Semester</option>
                      <option value="5th">5th Semester</option>
                      <option value="7th">7th Semester</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-550 mb-1">{t("targetSection")}</label>
                    <select
                      value={targetSec}
                      onChange={(e) => setTargetSec(e.target.value)}
                      className="w-full h-8 rounded-md border border-zinc-250 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Title Inputs */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  {t("noticeTitleInput")} (English)
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Java Exam Postponed"
                  className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  {t("noticeTitleInput")} (বাংলা)
                </label>
                <input
                  type="text"
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  placeholder="যেমন: জাভা পরীক্ষা স্থগিতকরণ"
                  className="w-full h-10 rounded-lg border border-zinc-250 bg-white px-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                />
              </div>

              {/* Content Inputs */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  {t("noticeContentInput")} (English)
                </label>
                <textarea
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  rows="3"
                  className="w-full rounded-lg border border-zinc-250 bg-white p-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  {t("noticeContentInput")} (বাংলা)
                </label>
                <textarea
                  value={contentBn}
                  onChange={(e) => setContentBn(e.target.value)}
                  rows="3"
                  className="w-full rounded-lg border border-zinc-250 bg-white p-3 text-sm focus:border-blue-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-blue-500 font-bold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xs cursor-pointer"
              >
                {t("postBtn")}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
