"use client";

import { useState } from "react";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={`relative transition-all duration-300 ${searchOpen ? "w-64" : "w-10"}`}>
          <button
            id="header-search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            className={`absolute right-0 top-0 p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors ${searchOpen ? "" : "glass"}`}
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {searchOpen && (
            <input
              id="header-search-input"
              type="text"
              placeholder="Search orders, tickets..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl glass text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 animate-fade-in"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          )}
        </div>

        {/* Notifications */}
        <button
          id="header-notifications"
          className="relative p-2.5 rounded-xl glass text-slate-400 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
