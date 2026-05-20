"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import { refundRequests, orders } from "@/lib/mockData";
import { RefundReason } from "@/lib/types";

const steps = ["Select Order", "Reason", "Review", "Submit"];

const reasons: { value: RefundReason; label: string; icon: string }[] = [
  { value: "defective", label: "Defective Product", icon: "🔧" },
  { value: "wrong_item", label: "Wrong Item Received", icon: "📦" },
  { value: "not_as_described", label: "Not as Described", icon: "📝" },
  { value: "arrived_late", label: "Arrived Too Late", icon: "⏰" },
  { value: "changed_mind", label: "Changed My Mind", icon: "💭" },
  { value: "other", label: "Other Reason", icon: "❓" },
];

export default function RefundsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedReason, setSelectedReason] = useState<RefundReason | "">("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedOrderData = orders.find((o) => o.id === selectedOrder);

  const canProceed = () => {
    if (currentStep === 0) return !!selectedOrder;
    if (currentStep === 1) return !!selectedReason && description.trim().length > 0;
    if (currentStep === 2) return true;
    return false;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setCurrentStep(0);
      setSelectedOrder("");
      setSelectedReason("");
      setDescription("");
    }, 3000);
  };

  return (
    <>
      <Header title="Refund Requests" subtitle="Submit and track refund requests for customer orders" />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Refund Form */}
        <div className="xl:col-span-2 glass rounded-2xl p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-white mb-6">New Refund Request</h2>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentStep
                      ? "bg-emerald-500/30 text-emerald-400 border border-emerald-500/40"
                      : i === currentStep
                      ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 animate-pulse-glow"
                      : "bg-white/5 text-slate-500 border border-white/10"
                  }`}
                >
                  {i < currentStep ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${i < currentStep ? "bg-emerald-500/40" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {submitted ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Refund Submitted!</h3>
              <p className="text-sm text-slate-400">Your refund request has been received and is being processed.</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Step 0: Select Order */}
              {currentStep === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400 mb-4">Select the order you want to request a refund for:</p>
                  {orders.filter((o) => o.status === "delivered" || o.status === "shipped").map((order) => (
                    <button
                      key={order.id}
                      id={`refund-select-${order.id}`}
                      onClick={() => setSelectedOrder(order.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all border ${
                        selectedOrder === order.id
                          ? "bg-indigo-500/15 border-indigo-500/40"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-mono font-medium text-indigo-300">{order.id}</p>
                          <p className="text-xs text-slate-400 mt-1">{order.items.map((i) => i.name).join(", ")}</p>
                        </div>
                        <p className="text-sm font-medium text-white">${order.total.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Reason */}
              {currentStep === 1 && (
                <div>
                  <p className="text-sm text-slate-400 mb-4">Why are you requesting a refund?</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {reasons.map((reason) => (
                      <button
                        key={reason.value}
                        onClick={() => setSelectedReason(reason.value)}
                        className={`p-3 rounded-xl text-left transition-all border ${
                          selectedReason === reason.value
                            ? "bg-indigo-500/15 border-indigo-500/40"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-lg">{reason.icon}</span>
                        <p className="text-xs text-slate-300 mt-1">{reason.label}</p>
                      </button>
                    ))}
                  </div>
                  <textarea
                    id="refund-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>
              )}

              {/* Step 2: Review */}
              {currentStep === 2 && selectedOrderData && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 mb-2">Please review your refund request:</p>
                  <div className="p-4 rounded-xl bg-white/5 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Order</span>
                      <span className="text-sm font-mono text-indigo-300">{selectedOrder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Amount</span>
                      <span className="text-sm font-medium text-white">${selectedOrderData.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Reason</span>
                      <span className="text-sm text-slate-200">{reasons.find((r) => r.value === selectedReason)?.label}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <span className="text-xs text-slate-400">Description</span>
                      <p className="text-sm text-slate-200 mt-1">{description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentStep === 0
                      ? "invisible"
                      : "text-slate-400 hover:text-white border border-white/10 hover:bg-white/5"
                  }`}
                >
                  Back
                </button>
                <button
                  id="refund-next-btn"
                  onClick={() => {
                    if (currentStep === 2) handleSubmit();
                    else setCurrentStep((s) => s + 1);
                  }}
                  disabled={!canProceed()}
                  className="px-6 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {currentStep === 2 ? "Submit Refund" : "Continue"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Refund History */}
        <div className="xl:col-span-3 glass rounded-2xl p-6 animate-fade-in delay-200">
          <h2 className="text-lg font-semibold text-white mb-5">Refund History</h2>
          <div className="space-y-3">
            {refundRequests.map((refund, i) => (
              <div
                key={refund.id}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-indigo-300">{refund.id}</span>
                      <Badge label={refund.status} variant={`status-${refund.status}`} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{refund.customerName} • Order {refund.orderId}</p>
                  </div>
                  <p className="text-sm font-medium text-white">${refund.amount.toFixed(2)}</p>
                </div>
                <p className="text-xs text-slate-400">{refund.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">
                    {refund.reason.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(refund.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
