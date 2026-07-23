"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { INITIAL_CHAT_MESSAGES, DEPARTMENTS } from "@/data/mockData";

export default function ChatView({ setActiveTab }) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [channels, setChannels] = useState({});
  const [activeChannelId, setActiveChannelId] = useState("");
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);

  // Load chat history from localStorage or fallback to defaults
  useEffect(() => {
    const savedChats = localStorage.getItem("chat_messages");
    if (savedChats) {
      try {
        setChannels(JSON.parse(savedChats));
      } catch (e) {
        setChannels(INITIAL_CHAT_MESSAGES);
      }
    } else {
      setChannels(INITIAL_CHAT_MESSAGES);
      localStorage.setItem("chat_messages", JSON.stringify(INITIAL_CHAT_MESSAGES));
    }
  }, []);

  // Determine active channel for the logged-in user
  useEffect(() => {
    if (user) {
      if (user.role === "student") {
        // Enforce strict class-restricted channel
        const channelKey = `${user.department}_${user.semester}_${user.section}`;
        setActiveChannelId(channelKey);
      } else {
        // Teacher/CI/Principal/VP can switch channels. Set default to computer_5th_A
        setActiveChannelId("computer_5th_A");
      }
    }
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channels, activeChannelId]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <span className="text-5xl">💬</span>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-4 mb-2">
          {t("chatTitle")}
        </h2>
        <p className="text-zinc-650 dark:text-zinc-400 mb-6">
          {t("restrictedChat")}
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      sender: lang === "en" ? user.nameEn : user.nameBn,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      system: false
    };

    const currentChannelMsgs = channels[activeChannelId] || [];
    const updatedChannels = {
      ...channels,
      [activeChannelId]: [...currentChannelMsgs, newMessage]
    };

    setChannels(updatedChannels);
    localStorage.setItem("chat_messages", JSON.stringify(updatedChannels));
    setInputText("");
  };

  const activeMessages = channels[activeChannelId] || [];
  
  // Helper to format channel title beautifully
  const getChannelTitle = (channelId) => {
    if (!channelId) return "";
    const parts = channelId.split("_");
    if (parts.length < 3) return channelId;
    const dept = DEPARTMENTS.find(d => d.id === parts[0]);
    const deptName = dept ? (lang === "en" ? dept.shortEn : dept.shortBn) : parts[0];
    return `${deptName} ${parts[1]} Sem (Sec ${parts[2]})`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-md flex flex-col h-[600px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-zinc-50 dark:bg-zinc-850 px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 font-bold">
              💬
            </span>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white leading-tight">
                {getChannelTitle(activeChannelId)}
              </h3>
              <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase mt-0.5">
                {lang === "en" ? `${user.role} workspace` : `${t(user.role)} চ্যাটরুম`}
              </p>
            </div>
          </div>

          {/* Teacher/Admin Selectors to Switch channels (only for testing and admin roles) */}
          {user.role !== "student" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {lang === "en" ? "Switch Channel:" : "চ্যানেল পরিবর্তন:"}
              </label>
              <select
                value={activeChannelId}
                onChange={(e) => setActiveChannelId(e.target.value)}
                className="h-8 rounded-lg border border-zinc-250 bg-white px-2 text-xs text-zinc-800 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              >
                <option value="computer_5th_A">CST 5th A</option>
                <option value="computer_5th_B">CST 5th B</option>
                <option value="civil_3rd_A">Civil 3rd A</option>
              </select>
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30 dark:bg-zinc-950/20">
          {activeMessages.map((msg, index) => {
            if (msg.system) {
              return (
                <div key={index} className="flex justify-center my-2">
                  <span className="bg-zinc-150/70 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-350 px-3 py-1 rounded-full text-center">
                    📢 {msg.text}
                  </span>
                </div>
              );
            }

            const isOwnMessage = msg.sender === (lang === "en" ? user.nameEn : user.nameBn);

            return (
              <div
                key={index}
                className={`flex flex-col max-w-[75%] ${isOwnMessage ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <span className="text-[10px] text-zinc-500 mb-1 font-semibold">
                  {msg.sender} • {msg.time}
                </span>
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  isOwnMessage
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/80 dark:border-zinc-700/60"
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t("placeholderMsg")}
            className="flex-1 h-11 rounded-full border border-zinc-250 bg-zinc-50 px-5 text-sm focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:bg-zinc-950"
          />
          <button
            type="submit"
            className="h-11 px-6 rounded-full bg-blue-500 font-bold text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all flex items-center justify-center cursor-pointer"
          >
            {t("send")}
          </button>
        </form>

      </div>
    </div>
  );
}
