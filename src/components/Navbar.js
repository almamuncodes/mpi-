"use client";

import React from "react";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";

export default function Navbar({ activeTab, setActiveTab }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* TechVerse MPI Logo */}
        <div 
          onClick={() => setActiveTab("home")} 
          className="flex flex-col cursor-pointer select-none"
        >
          <span className="text-2xl font-extrabold tracking-tight text-blue-500 dark:text-blue-400 leading-none">
            TechVerse
          </span>
          <span className="text-xs font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5 pl-0.5">
            MPI
          </span>
        </div>

        {/* Desktop Navigation Link Tabs */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { id: "home", label: t("home") },
            { id: "notices", label: t("notices") },
            { id: "routine", label: t("routine") },
            { id: "chat", label: t("chat") },
            { id: "profile", label: t("profile") }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-semibold transition-all relative py-1 ${
                activeTab === tab.id
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-500 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Global Controls & User Widget */}
        <div className="flex items-center gap-3">
          
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            aria-label="Language Toggle"
          >
            {lang === "en" ? "বাংলা" : "English"}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-lg text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            aria-label="Theme Toggle"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* User Widget */}
          {user ? (
            <div className="relative pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  const state = !window._navbarDropdownState;
                  window._navbarDropdownState = state;
                  // Force a re-render or trigger local state
                  document.getElementById("user-dropdown-container")?.classList.toggle("hidden");
                }}
                className="flex items-center focus:outline-none cursor-pointer"
                aria-label="User Menu"
              >
                <img
                  src={user.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"}
                  alt="Avatar"
                  className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 hover:scale-105 transition-transform"
                />
              </button>
              
              <div 
                id="user-dropdown-container"
                className="hidden absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50"
              >
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-805 mb-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {lang === "en" ? user.nameEn : user.nameBn}
                  </p>
                  <p className="text-[10px] font-semibold text-zinc-550 capitalize mt-0.5">
                    {t(user.role)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    document.getElementById("user-dropdown-container")?.classList.add("hidden");
                  }}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                >
                  {t("logout")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab("profile")}
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg bg-blue-500 px-4 text-xs font-bold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xs"
            >
              {t("login")}
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
