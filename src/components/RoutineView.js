"use client";

import React from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { MOCK_ROUTINES, DEPARTMENTS } from "@/data/mockData";

export default function RoutineView({ setActiveTab }) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-4 mb-2">
          {t("routineTitle")}
        </h2>
        <p className="text-zinc-650 dark:text-zinc-400 mb-6">
          {t("restrictedRoutine")}
        </p>
        <button
          onClick={() => setActiveTab("profile")}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm transition-all cursor-pointer"
        >
          {t("login")} / {t("profile")}
        </button>
      </div>
    );
  }

  // If user is not a student (e.g. Principal/VP), let's show an selector or just show all routines,
  // but if the user is a student, enforce the strict rule: only see their own department/semester/shift routine.
  const isStudent = user.role === "student";
  
  let targetDept = user.department;
  let targetShift = user.shift;
  let targetSemester = user.semester;

  const routineData = MOCK_ROUTINES[targetDept]?.[targetShift]?.[targetSemester] || null;
  const deptInfo = DEPARTMENTS.find(d => d.id === targetDept);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t("routineTitle")}
          </h2>
          <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-1">
            {lang === "en" ? "Showing your personalized class schedule" : "আপনার ব্যক্তিগত ক্লাসের সময়সূচী প্রদর্শন করা হচ্ছে"}
          </p>
        </div>

        {/* Badge of User Profile Class Details */}
        <div className="inline-flex flex-wrap gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
          <span className="bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-900/50 uppercase">
            {deptInfo ? (lang === "en" ? deptInfo.shortEn : deptInfo.shortBn) : targetDept}
          </span>
          <span className="bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-900/50">
            {targetSemester} Semester
          </span>
          <span className="bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-900/50 capitalize">
            {targetShift === "morning" ? t("morningShift") : t("dayShift")}
          </span>
          {user.section && (
            <span className="bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-900/50">
              Section {user.section}
            </span>
          )}
        </div>
      </div>

      {routineData && routineData.length > 0 ? (
        <div className="space-y-6">
          {routineData.map((dayItem, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs"
            >
              <div className="bg-zinc-50 dark:bg-zinc-850 px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <h3 className="font-bold text-zinc-950 dark:text-white">
                  {lang === "en" ? dayItem.dayEn : dayItem.dayBn}
                </h3>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {dayItem.classes.map((cls, idx) => (
                  <div
                    key={idx}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">⏰</span>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {cls.time}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Class Period
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 sm:pl-8">
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                        {lang === "en" ? cls.subjectEn : cls.subjectBn}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
                        {cls.room}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-12 text-center">
          <span className="text-4xl">📅</span>
          <p className="text-zinc-650 dark:text-zinc-400 font-medium mt-4">
            {t("noRoutine")}
          </p>
        </div>
      )}
    </div>
  );
}
