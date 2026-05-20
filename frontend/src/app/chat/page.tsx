"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { chatMessages as initialMessages, chatConversations, quickReplies } from "@/lib/mockData";
import { ChatMessage } from "@/lib/types";

const aiResponses = [
  "I'd be happy to help you with that! Let me look into it right away. 🔍",
  "I've found the information you need. Here's what I can tell you:\n\n📋 Your request has been processed successfully.\n✅ You should see the changes reflected in your account within 24 hours.\n\nIs there anything else you'd like to know?",
  "Great question! Based on our records, here's a summary:\n\n• Your account is in good standing\n• All recent transactions are verified\n• No pending issues found\n\nWould you like me to send you a detailed report via email?",
  "I understand your concern. Let me escalate this to our specialized team for a faster resolution. You'll receive an update within 2 hours. 🎯",
  "Absolutely! I've made that change for you. Here's the confirmation:\n\n🔄 Request ID: #REQ-" + Math.floor(Math.random() * 9000 + 1000) + "\n📅 Processed: Just now\n⏱️ Expected completion: Within 1 business day",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeConv, setActiveConv] = useState("conv-1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: content.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 1500 + Math.random() * 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <Header title="AI Chat" subtitle="Get instant AI-powered support for customer inquiries" />

      <div className="flex gap-4 h-[calc(100vh-180px)] min-h-[500px]">
        {/* Chat History Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-30 w-72 glass rounded-none lg:rounded-2xl lg:relative lg:w-72 lg:flex-shrink-0
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Conversations</h3>
              <button
                className="lg:hidden p-1 text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto h-[calc(100%-60px)]">
            {chatConversations.map((conv) => (
              <button
                key={conv.id}
                id={`chat-conv-${conv.id}`}
                onClick={() => { setActiveConv(conv.id); setSidebarOpen(false); }}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  activeConv === conv.id
                    ? "bg-indigo-500/20 border border-indigo-500/30"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium truncate ${activeConv === conv.id ? "text-indigo-300" : "text-slate-200"}`}>
                    {conv.title}
                  </p>
                  {conv.unread && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-1">{conv.lastMessage}</p>
                <p className="text-xs text-slate-600 mt-1">{conv.timestamp}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <button
              className="lg:hidden p-1 text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">CommerceMind AI</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online — Avg response: 1.2s
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.sender === "user"
                      ? "bg-indigo-600/80 text-white rounded-br-md"
                      : "glass-light text-slate-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1.5 ${msg.sender === "user" ? "text-indigo-200" : "text-slate-500"}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass-light rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-5 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="px-5 pb-5">
            <div className="flex items-end gap-3 glass-light rounded-2xl px-4 py-3">
              <button className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0" aria-label="Attach file">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <textarea
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-24"
              />
              <button
                id="chat-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
