"use client";

import React, { useState } from "react";
import { DEPARTMENTS } from "@/data/mockData";
import { useLanguage } from "./LanguageContext";

export default function HomeView() {
  const { lang, t } = useLanguage();
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setSelectedShift(null); // Reset shift when selecting a new department
  };

  const handleSelectShift = (shift) => {
    setSelectedShift(shift);
  };

  const resetSelection = () => {
    setSelectedDept(null);
    setSelectedShift(null);
  };

  const resetShiftOnly = () => {
    setSelectedShift(null);
  };

  // Content for Office Section
  const officeSectionItems = [
    {
      titleEn: "Principal",
      titleBn: "অধ্যক্ষ",
      descEn: "Present age is the age of science and information technology.",
      descBn: "বর্তমান যুগ, বিজ্ঞান ও তথ্য প্রযুক্তির যুগ।",
      icon: "👨‍💼",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80"
    },
    {
      titleEn: "Computer Club",
      titleBn: "কম্পিউটার ক্লাব",
      descEn: "Various technical activities in our polytechnic...",
      descBn: "আমাদের পলিটেকনিকে বিভিন্ন কারিগরি...",
      icon: "💻",
      image: null
    }
  ];

  // Content for Additional Section
  const extraItems = [
    { titleEn: "Captain", titleBn: "ক্যাপ্টেন", icon: "⚓" },
    { titleEn: "Rover", titleBn: "রোভার", icon: "⚜️" },
    { titleEn: "Result", titleBn: "রেজাল্ট", icon: "🔍" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* If no department is selected, show list of departments and home layout */}
      {!selectedDept ? (
        <div className="space-y-8 animate-fade-in">
          
          {/* Section 1: Office Section (অফিস শাখা) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h2 className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-450">
                {lang === "en" ? "Office Section" : "অফিস শাখা"}
              </h2>
              <button className="text-xs font-bold text-zinc-500 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400">
                {t("viewAll")} 〉
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {officeSectionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.titleEn}
                      className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-2xl">
                      {item.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {lang === "en" ? item.titleEn : item.titleBn}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {lang === "en" ? item.descEn : item.descBn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Departments (ডিপার্টমেন্ট সমূহ) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h2 className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-450">
                {lang === "en" ? "Departments" : "ডিপার্টমেন্ট সমূহ"}
              </h2>
              <button className="text-xs font-bold text-zinc-500 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400">
                {t("viewAll")} 〉
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
              {DEPARTMENTS.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => handleSelectDept(dept)}
                  className="group flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-3xs hover:shadow-2xs hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all cursor-pointer text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 text-xl transition-colors mb-2">
                    {dept.icon}
                  </div>
                  <span className="text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-450 truncate w-full px-0.5">
                    {lang === "en" ? dept.shortEn : dept.shortBn}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Additional (অতিরিক্ত কিছু) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h2 className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-450">
                {lang === "en" ? "Extras" : "অতিরিক্ত কিছু"}
              </h2>
              <button className="text-xs font-bold text-zinc-500 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400">
                {t("viewAll")} 〉
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {extraItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-3xs hover:shadow-2xs transition-all text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xl mb-2">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300">
                    {lang === "en" ? item.titleEn : item.titleBn}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>
      ) : !selectedShift ? (
        /* Shift Selection Screen */
        <section className="max-w-xl mx-auto text-center py-12 animate-scale-up">
          <button
            onClick={resetSelection}
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 mb-8 cursor-pointer"
          >
            ← {lang === "en" ? "Back to Departments" : "ডিপার্টমেন্ট তালিকায় ফিরে যান"}
          </button>
          
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {lang === "en" ? selectedDept.nameEn : selectedDept.nameBn}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            {t("selectShift")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectShift("morning")}
              className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span className="text-4xl mb-3">🌅</span>
              <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                {t("morningShift")}
              </span>
            </button>
            <button
              onClick={() => handleSelectShift("day")}
              className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span className="text-4xl mb-3">☀️</span>
              <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                {t("dayShift")}
              </span>
            </button>
          </div>
        </section>
      ) : (
        /* Department Information & Teachers Card Screen */
        <section className="animate-fade-in space-y-12">
          {/* Top Controls & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div>
              <nav className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="cursor-pointer hover:underline" onClick={resetSelection}>
                  {t("departments")}
                </span>
                <span>/</span>
                <span className="cursor-pointer hover:underline" onClick={resetShiftOnly}>
                  {lang === "en" ? selectedDept.shortEn : selectedDept.shortBn}
                </span>
                <span>/</span>
                <span className="text-blue-500 dark:text-blue-400 capitalize">
                  {selectedShift === "morning" ? t("morningShift") : t("dayShift")}
                </span>
              </nav>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {lang === "en" ? selectedDept.nameEn : selectedDept.nameBn}
              </h2>
            </div>
            
            <button
              onClick={resetShiftOnly}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-250 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              ← {lang === "en" ? "Change Shift" : "শিফট পরিবর্তন"}
            </button>
          </div>

          {/* Chief Instructor Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-250 border-l-4 border-amber-500 pl-3">
              {t("chiefInstructor")}
            </h3>
            
            <div className="max-w-2xl bg-gradient-to-r from-amber-50/50 to-white dark:from-amber-950/10 dark:to-zinc-900 rounded-3xl border border-amber-500/20 shadow-md p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={selectedDept.ci.photo}
                alt={selectedDept.ci.nameEn}
                className="h-28 w-28 rounded-2xl object-cover border-2 border-amber-500/30"
              />
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {lang === "en" ? selectedDept.ci.nameEn : selectedDept.ci.nameBn}
                </h4>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {lang === "en" ? selectedDept.ci.designationEn : selectedDept.ci.designationBn}
                </p>
                <div className="pt-2 grid grid-cols-1 gap-1 text-sm text-zinc-650 dark:text-zinc-300">
                  <div>
                    <span className="font-semibold text-zinc-500">{t("phone")}: </span>
                    <a href={`tel:${selectedDept.ci.mobile}`} className="hover:underline">{selectedDept.ci.mobile}</a>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-500">{t("email")}: </span>
                    <a href={`mailto:${selectedDept.ci.email}`} className="hover:underline">{selectedDept.ci.email}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Teachers Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-250 border-l-4 border-blue-500 pl-3">
              {t("teachers")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDept.teachers.map((teacher, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 flex items-center sm:items-start gap-4 shadow-xs"
                >
                  <img
                    src={teacher.photo}
                    alt={teacher.nameEn}
                    className="h-20 w-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-900 dark:text-white truncate">
                      {lang === "en" ? teacher.nameEn : teacher.nameBn}
                    </h4>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      {lang === "en" ? teacher.designationEn : teacher.designationBn}
                    </p>
                    <div className="text-xs text-zinc-550 dark:text-zinc-400 space-y-1 mt-3">
                      <div className="truncate">
                        <span className="font-semibold">{t("phone")}:</span>{" "}
                        <a href={`tel:${teacher.mobile}`} className="hover:underline">{teacher.mobile}</a>
                      </div>
                      <div className="truncate">
                        <span className="font-semibold">{t("email")}:</span>{" "}
                        <a href={`mailto:${teacher.email}`} className="hover:underline">{teacher.email}</a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
