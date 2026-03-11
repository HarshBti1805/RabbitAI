import { Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="text-center animate-fade-in-up">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/70 border border-brand-800/30 text-brand-300 text-xs font-medium tracking-wide uppercase mb-5">
        <Zap size={12} className="text-brand-400" />
        AI-Powered Analytics
      </div>

      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
        Sales Insight
        <br />
        <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Automator
        </span>
      </h1>

      <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
        Upload your sales data, get an AI-generated executive brief
        delivered to any inbox in seconds.
      </p>
    </header>
  );
}
