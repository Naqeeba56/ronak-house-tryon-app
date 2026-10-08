"use client";

import { Sparkles, Image as ImageIcon, Zap, Activity, Clock, ArrowUpRight, CheckCircle, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-slate-100 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">FabricFit Analytics Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Overview of AI Virtual Try-On metrics, renders, and system throughput</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> AICredits Image Model
          </span>
        </div>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Try-On Renders</span>
            <ImageIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">1,482</span>
            <span className="text-xs text-emerald-400 ml-2 font-medium inline-flex items-center">+18.4% <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Credits Consumed</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">3,290</span>
            <span className="text-xs text-amber-400 ml-2 font-medium">Avg 2.2 / user</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Inference Speed</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">6.4s</span>
            <span className="text-xs text-purple-400 ml-2 font-medium">IDM-VTON model</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Generation Success Rate</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">98.2%</span>
            <span className="text-xs text-emerald-400 ml-2 font-medium">0.8% error rate</span>
          </div>
        </div>
      </div>

      {/* CATEGORY METRICS & RECENT QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Popularity Bar Charts */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-4">Garment Category Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Kurta / Kurti</span>
                <span>42% (622)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "42%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Pathani Suit</span>
                <span>28% (415)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Shirts & Blazers</span>
                <span>18% (266)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: "18%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Pants & Trousers</span>
                <span>12% (179)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "12%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Webhook Execution Activity Log */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-4">Live Generation Execution Log</h3>
          <div className="space-y-3">
            {[
              { id: "gen_8921", category: "Kurta", status: "succeeded", time: "2 mins ago", speed: "5.8s" },
              { id: "gen_8920", category: "Pathani", status: "succeeded", time: "5 mins ago", speed: "6.2s" },
              { id: "gen_8919", category: "Blazer", status: "processing", time: "Just now", speed: "..." },
              { id: "gen_8918", category: "Shirt", status: "failed", time: "12 mins ago", speed: "N/A" },
            ].map((log) => (
              <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {log.status === "succeeded" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {log.status === "processing" && <Zap className="w-4 h-4 text-amber-400 animate-pulse" />}
                  {log.status === "failed" && <AlertCircle className="w-4 h-4 text-red-400" />}
                  <div>
                    <p className="font-mono text-slate-200">{log.id}</p>
                    <p className="text-[10px] text-slate-500">{log.category} • {log.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                    log.status === "succeeded" ? "bg-emerald-500/10 text-emerald-400" :
                    log.status === "processing" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {log.status}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{log.speed}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}