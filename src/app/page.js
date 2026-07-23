"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import HomeView from "@/components/HomeView";
import NoticeView from "@/components/NoticeView";
import RoutineView from "@/components/RoutineView";
import ChatView from "@/components/ChatView";
import ProfileView from "@/components/ProfileView";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const renderActiveView = () => {
    switch (activeTab) {
      case "home":
        return <HomeView />;
      case "notices":
        return <NoticeView />;
      case "routine":
        return <RoutineView setActiveTab={setActiveTab} />;
      case "chat":
        return <ChatView setActiveTab={setActiveTab} />;
      case "profile":
        return <ProfileView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop & Mobile Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4 pb-24 md:pb-8">
        {renderActiveView()}
      </main>

      {/* App-like bottom bar on mobile viewports */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
