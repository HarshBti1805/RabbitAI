import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Upload,
  FileSpreadsheet,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export default function UploadCard({ onSummary }) {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error("Invalid file. Please upload a .csv or .xlsx file under 10 MB.");
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    if (!email || !isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      const headers = {};
      if (API_KEY) headers["X-API-Key"] = API_KEY;

      const { data } = await axios.post(`${API_URL}/api/v1/upload`, formData, {
        headers,
        timeout: 120000, // 2 min for large files / slow AI
      });

      setStatus("success");
      onSummary(data.summary);
      toast.success("Summary generated & emailed!");
    } catch (err) {
      setStatus("error");
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
    }
  };

  const resetForm = () => {
    setFile(null);
    setEmail("");
    setStatus("idle");
    onSummary(null);
  };

  return (
    <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20">
      <h2 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
          <Upload size={16} className="text-brand-400" />
        </div>
        Upload &amp; Analyze
      </h2>

      {/* ── Dropzone ─────────────────────────────────── */}
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 sm:p-10 text-center
          transition-all duration-300 group
          ${
            isDragActive
              ? "border-brand-400 bg-brand-950/50 scale-[1.01]"
              : file
                ? "border-emerald-600/40 bg-emerald-950/10"
                : "border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/20"
          }
        `}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileSpreadsheet size={24} className="text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-emerald-300">{file.name}</p>
            <p className="text-xs text-slate-500">
              {(file.size / 1024).toFixed(1)} KB &middot; Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center group-hover:bg-slate-700/60 transition-colors">
              <Upload size={24} className="text-slate-500 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-sm text-slate-400">
              {isDragActive ? "Drop your file here..." : "Drag & drop a .csv or .xlsx file"}
            </p>
            <p className="text-xs text-slate-600">or click to browse &middot; Max 10 MB</p>
          </div>
        )}
      </div>

      {/* ── Email Input ──────────────────────────────── */}
      <div className="mt-6">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Mail size={12} />
          Recipient Email
        </label>
        <input
          type="email"
          placeholder="executive@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700/60
                     text-white placeholder-slate-600 focus:outline-none focus:ring-2
                     focus:ring-brand-500/30 focus:border-brand-600 transition-all text-sm"
        />
      </div>

      {/* ── Submit Button ────────────────────────────── */}
      <button
        onClick={status === "success" ? resetForm : handleSubmit}
        disabled={status === "uploading"}
        className={`
          mt-6 w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide
          flex items-center justify-center gap-2 transition-all duration-200
          ${
            status === "uploading"
              ? "bg-slate-800 text-slate-500 cursor-wait"
              : status === "success"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                : status === "error"
                  ? "bg-red-600/80 hover:bg-red-500 text-white"
                  : "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-600/20"
          }
        `}
      >
        {status === "uploading" && <Loader2 size={16} className="animate-spin" />}
        {status === "success" && <CheckCircle2 size={16} />}
        {status === "error" && <AlertCircle size={16} />}
        {status === "idle" && <ArrowRight size={16} />}

        {status === "uploading"
          ? "Analyzing & Sending..."
          : status === "success"
            ? "Send Another"
            : status === "error"
              ? "Retry"
              : "Generate & Send Brief"}
      </button>
    </div>
  );
}
