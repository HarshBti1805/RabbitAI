import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import UploadCard from "./components/UploadCard";
import SummaryPanel from "./components/SummaryPanel";

export default function App() {
  const [summary, setSummary] = useState(null);

  return (
    <div className="relative min-h-screen">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-24 w-[600px] h-[600px] rounded-full bg-brand-700 opacity-10 blur-[140px] animate-pulse-soft" />
        <div className="absolute -bottom-48 -right-24 w-[500px] h-[500px] rounded-full bg-purple-700 opacity-10 blur-[140px] animate-pulse-soft" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-700 opacity-5 blur-[100px]" />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#e2e8f0",
            border: "1px solid #334155",
            fontSize: "14px",
          },
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <Header />

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mt-10">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <UploadCard onSummary={setSummary} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <SummaryPanel summary={summary} />
          </div>
        </div>

        <footer className="mt-16 text-center text-xs text-slate-600">
          Built by Rabbitt AI Engineering &middot; Powered by OpenAI
        </footer>
      </div>
    </div>
  );
}
