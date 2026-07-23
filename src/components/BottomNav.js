"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";

export default function BottomNav({ activeTab, setActiveTab }) {
  const { t } = useLanguage();

  const navItems = [
    { id: "home", label: t("home"), icon: "🏠" },
    { id: "notices", label: t("notices"), icon: "🔔" },
    { id: "routine", label: t("routine"), icon: "📅" },
    { id: "chat", label: t("chat"), icon: "💬" },
    { id: "profile", label: t("profile"), icon: "👤" }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/95 transition-all shadow-lg pb-safe-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-1 flex-col items-center justify-center py-2 text-zinc-650 transition-all cursor-pointer"
            >
              <span className={`text-xl transition-transform duration-250 ${isActive ? "scale-120 filter-blue-drop" : "opacity-80"}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] mt-1 font-semibold transition-colors ${
                isActive ? "text-blue-500 dark:text-blue-400 font-bold" : "text-zinc-500 dark:text-zinc-400"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
