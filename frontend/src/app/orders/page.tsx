"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import OrderTimeline from "@/components/OrderTimeline";
import { orders } from "@/lib/mockData";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["all", "processing", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"];

  return (
    <>
      <Header title="Order Tracking" subtitle="Monitor and manage customer orders in real-time" />

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="order-search"
              type="text"
              placeholder="Search by order ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                    : "text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                {status === "all" ? "All" : status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-2xl overflow-hidden animate-fade-in delay-100">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-white/5">
          <span>Order ID</span>
          <span>Customer</span>
          <span>Items</span>
          <span>Total</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {filteredOrders.map((order, i) => (
            <div key={order.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              {/* Row */}
              <button
                id={`order-row-${order.id}`}
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="md:grid md:grid-cols-6 md:gap-4 md:items-center space-y-2 md:space-y-0">
                  <span className="text-sm font-mono font-medium text-indigo-300">{order.id}</span>
                  <div>
                    <p className="text-sm text-white">{order.customerName}</p>
                    <p className="text-xs text-slate-500 md:hidden">{order.customerEmail}</p>
                  </div>
                  <span className="text-sm text-slate-300">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                  <span className="text-sm font-medium text-white">${order.total.toFixed(2)}</span>
                  <Badge label={order.status} variant={`status-${order.status}`} />
                  <span className="text-sm text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="px-6 pb-6 border-t border-white/5 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div>
                              <p className="text-sm text-slate-200">{item.name}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-white">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Info */}
                      <div className="mt-4 p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-slate-400 mb-1">Shipping Address</p>
                        <p className="text-sm text-slate-200">{order.shippingAddress}</p>
                        {order.trackingNumber && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-400">Tracking Number</p>
                            <p className="text-sm font-mono text-indigo-300">{order.trackingNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Order Timeline</h4>
                      <OrderTimeline events={order.timeline} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400">No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </>
  );
}
