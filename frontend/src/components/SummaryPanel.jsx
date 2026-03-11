import { useState } from "react";
import { FileText, Copy, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Lightweight Markdown → HTML renderer.
 * Handles headers, bold, italic, lists, and line breaks.
 */
function renderMarkdown(md) {
  if (!md) return "";
  let html = md
    // Headers
    .replace(/^#### (.*$)/gm, '<h4 class="text-sm font-semibold text-blue-300 mt-4 mb-1">$1</h4>')
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-semibold text-brand-300 mt-4 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-bold text-brand-200 mt-5 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold text-white mt-6 mb-2">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-white"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Unordered lists
    .replace(/^[-*] (.*$)/gm, '<li class="ml-4 list-disc text-slate-300 text-sm leading-relaxed my-0.5">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-slate-300 text-sm leading-relaxed my-0.5">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-slate-700/50 my-4" />')
    // Line breaks
    .replace(/\n\n/g, '<div class="h-3"></div>')
    .replace(/\n/g, "<br/>");

  return html;
}

export default function SummaryPanel({ summary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20 flex flex-col min-h-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
            <FileText size={16} className="text-purple-400" />
          </div>
          AI Summary
        </h2>
        {summary && (
          <button
            onClick={handleCopy}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5
                       px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-all"
          >
            {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {/* Content */}
      {summary ? (
        <div
          className="flex-1 overflow-y-auto pr-2 text-slate-300 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/40 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-slate-700" />
            </div>
            <p className="text-sm text-slate-600 max-w-[220px]">
              Your AI-generated executive brief will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
