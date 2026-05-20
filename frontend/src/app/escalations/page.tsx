"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import { escalations } from "@/lib/mockData";

export default function EscalationsPage() {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEsc, setSelectedEsc] = useState<string | null>(null);

  const priorities = ["all", "critical", "high", "medium", "low"];
  const statuses = ["all", "open", "in_progress", "awaiting_customer", "resolved", "closed"];

  const filtered = escalations.filter((e) => {
    const mp = priorityFilter === "all" || e.priority === priorityFilter;
    const ms = statusFilter === "all" || e.status === statusFilter;
    return mp && ms;
  });

  const selected = escalations.find((e) => e.id === selectedEsc);

  const priorityCounts = {
    critical: escalations.filter((e) => e.priority === "critical" && e.status !== "resolved" && e.status !== "closed").length,
    high: escalations.filter((e) => e.priority === "high" && e.status !== "resolved" && e.status !== "closed").length,
    medium: escalations.filter((e) => e.priority === "medium" && e.status !== "resolved" && e.status !== "closed").length,
    low: escalations.filter((e) => e.priority === "low" && e.status !== "resolved" && e.status !== "closed").length,
  };

  return (
    <>
      <Header title="Escalation Dashboard" subtitle="Manage priority tickets requiring admin attention" />

      {/* Priority Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["critical", "high", "medium", "low"] as const).map((p, i) => (
          <button
            key={p}
            id={`escalation-priority-${p}`}
            onClick={() => setPriorityFilter(priorityFilter === p ? "all" : p)}
            className={`glass rounded-2xl p-4 text-center transition-all hover:scale-[1.02] animate-fade-in ${
              priorityFilter === p ? "ring-2 ring-offset-2 ring-offset-[#0f0a2a]" : ""
            } ${
              p === "critical" ? (priorityFilter === p ? "ring-red-500" : "") :
              p === "high" ? (priorityFilter === p ? "ring-orange-500" : "") :
              p === "medium" ? (priorityFilter === p ? "ring-amber-500" : "") :
              (priorityFilter === p ? "ring-blue-500" : "")
            }`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <p className={`text-2xl font-bold ${
              p === "critical" ? "text-red-400" :
              p === "high" ? "text-orange-400" :
              p === "medium" ? "text-amber-400" : "text-blue-400"
            }`}>
              {priorityCounts[p]}
            </p>
            <p className="text-xs text-slate-400 capitalize mt-1">{p} Priority</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6 animate-fade-in delay-200">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center mr-1">Status:</span>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 border border-white/10 hover:bg-white/5"
              }`}
            >
              {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Ticket List */}
        <div className={`flex-1 space-y-3 ${selectedEsc ? "hidden lg:block" : ""}`}>
          {filtered.map((esc, i) => (
            <button
              key={esc.id}
              id={`escalation-${esc.id}`}
              onClick={() => setSelectedEsc(esc.id)}
              className={`w-full text-left glass rounded-2xl p-5 transition-all hover:scale-[1.01] animate-fade-in ${
                selectedEsc === esc.id ? "ring-1 ring-indigo-500/50" : "glass-hover"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge label={esc.priority} variant={`priority-${esc.priority}`} />
                  <Badge label={esc.status} variant={`status-${esc.status}`} />
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(esc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{esc.subject}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{esc.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-500">
                  {esc.customerName} • {esc.ticketId}
                </span>
                <span className="text-xs text-slate-500">{esc.assignedTo}</span>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-slate-400">No escalations match your filters.</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className={`lg:w-[420px] flex-shrink-0 ${selectedEsc ? "fixed inset-0 z-30 lg:relative lg:inset-auto" : ""}`}>
            {/* Mobile overlay */}
            <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEsc(null)} />

            <div className="relative z-10 h-full lg:h-auto glass rounded-none lg:rounded-2xl p-6 overflow-y-auto animate-slide-right">
              {/* Close */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-mono text-slate-500">{selected.id}</span>
                <button
                  id="escalation-close-detail"
                  onClick={() => setSelectedEsc(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-2 mb-3">
                <Badge label={selected.priority} variant={`priority-${selected.priority}`} size="md" />
                <Badge label={selected.status} variant={`status-${selected.status}`} size="md" />
              </div>

              <h2 className="text-lg font-semibold text-white mb-2">{selected.subject}</h2>
              <p className="text-sm text-slate-300 mb-5">{selected.description}</p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-500">Customer</p>
                  <p className="text-sm text-white mt-0.5">{selected.customerName}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-500">Ticket</p>
                  <p className="text-sm font-mono text-indigo-300 mt-0.5">{selected.ticketId}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-500">Assigned To</p>
                  <p className="text-sm text-white mt-0.5">{selected.assignedTo}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm text-white mt-0.5">
                    {new Date(selected.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-6">
                <button className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors">
                  Assign Agent
                </button>
                <button className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium text-slate-300 transition-colors">
                  Update Status
                </button>
              </div>

              {/* Audit Log */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Audit Log</h3>
                <div className="relative pl-5">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/10" />
                  <div className="space-y-4">
                    {selected.auditLog.map((log, i) => (
                      <div key={log.id} className="relative animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="absolute -left-5 top-1.5 w-[14px] h-[14px] rounded-full bg-indigo-500/30 border border-indigo-500/50" />
                        <div>
                          <p className="text-sm text-slate-200">{log.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {log.performedBy} •{" "}
                            {new Date(log.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </p>
                          {log.details && <p className="text-xs text-slate-400 mt-1">{log.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
