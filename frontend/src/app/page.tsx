"use client";

import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import { dashboardStats, recentActivity } from "@/lib/mockData";

const typeIcons: Record<string, string> = {
  order: "📦",
  refund: "💰",
  escalation: "🔺",
  chat: "💬",
};

const typeColors: Record<string, string> = {
  order: "text-indigo-400",
  refund: "text-emerald-400",
  escalation: "text-amber-400",
  chat: "text-cyan-400",
};

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back, John. Here's what's happening today." />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2 glass rounded-2xl p-6 animate-fade-in delay-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <span className="text-xs text-slate-400 px-3 py-1 rounded-full bg-white/5">Live</span>
          </div>
          <div className="space-y-1">
            {recentActivity.map((item, i) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors animate-fade-in"
                style={{ animationDelay: `${(i + 4) * 80}ms` }}
              >
                <span className="text-lg mt-0.5">{typeIcons[item.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-relaxed">{item.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.timestamp}</p>
                </div>
                <span className={`text-xs font-medium ${typeColors[item.type]} capitalize hidden sm:block`}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6 animate-fade-in delay-400">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Start AI Chat", href: "/chat", icon: "💬", color: "from-indigo-500/20 to-purple-500/20" },
                { label: "View Orders", href: "/orders", icon: "📦", color: "from-cyan-500/20 to-blue-500/20" },
                { label: "Process Refunds", href: "/refunds", icon: "💰", color: "from-emerald-500/20 to-green-500/20" },
                { label: "Check Escalations", href: "/escalations", icon: "🔺", color: "from-amber-500/20 to-orange-500/20" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  id={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${action.color} hover:scale-[1.02] transition-all duration-200 group`}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white">{action.label}</span>
                  <svg className="w-4 h-4 ml-auto text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Performance Mini Chart */}
          <div className="glass rounded-2xl p-6 animate-fade-in delay-400">
            <h2 className="text-lg font-semibold text-white mb-4">Ticket Resolution</h2>
            <div className="flex items-end gap-2 h-32">
              {[65, 45, 78, 52, 90, 68, 85, 72, 95, 60, 82, 77].map((val, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-indigo-600/60 to-indigo-400/30 rounded-t-sm transition-all duration-500 hover:from-indigo-500/80 hover:to-indigo-300/50"
                  style={{
                    height: `${val}%`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
