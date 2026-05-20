import { Order, ChatConversation, ChatMessage, RefundRequest, Escalation, DashboardStat, ActivityItem } from "./types";

export const dashboardStats: DashboardStat[] = [
  { label: "Total Orders", value: "12,847", change: 12.5, changeLabel: "vs last month", icon: "📦" },
  { label: "Open Tickets", value: 342, change: -8.3, changeLabel: "vs last week", icon: "🎫" },
  { label: "Refund Rate", value: "2.4%", change: -0.5, changeLabel: "vs last month", icon: "💰" },
  { label: "Avg Response Time", value: "1.2m", change: -15.2, changeLabel: "vs last month", icon: "⚡" },
];

export const recentActivity: ActivityItem[] = [
  { id: "act-1", type: "order", message: "New order #ORD-7829 placed by Sarah Mitchell — $249.99", timestamp: "2 min ago" },
  { id: "act-2", type: "refund", message: "Refund #REF-1042 approved for James Wilson — $89.50", timestamp: "8 min ago" },
  { id: "act-3", type: "escalation", message: "Critical escalation #ESC-301 assigned to Team Lead", timestamp: "15 min ago" },
  { id: "act-4", type: "chat", message: "AI resolved shipping inquiry for customer Emily Chen", timestamp: "22 min ago" },
  { id: "act-5", type: "order", message: "Order #ORD-7825 marked as delivered", timestamp: "35 min ago" },
  { id: "act-6", type: "refund", message: "Refund request #REF-1041 submitted by David Park", timestamp: "42 min ago" },
  { id: "act-7", type: "chat", message: "New chat session started by Alex Thompson", timestamp: "1 hr ago" },
  { id: "act-8", type: "escalation", message: "Escalation #ESC-299 resolved by Agent Martinez", timestamp: "1.5 hr ago" },
];

export const orders: Order[] = [
  {
    id: "ORD-7829", customerName: "Sarah Mitchell", customerEmail: "sarah.m@email.com",
    items: [
      { id: "itm-1", name: "Wireless Noise-Cancelling Headphones", quantity: 1, price: 199.99 },
      { id: "itm-2", name: "USB-C Charging Cable", quantity: 2, price: 14.99 },
    ],
    total: 229.97, status: "processing", createdAt: "2026-05-19T10:30:00Z", updatedAt: "2026-05-19T10:30:00Z",
    shippingAddress: "742 Evergreen Terrace, Springfield, IL 62704",
    timeline: [
      { status: "Order Placed", description: "Order confirmed and payment received", timestamp: "2026-05-19T10:30:00Z", completed: true },
      { status: "Processing", description: "Order is being prepared", timestamp: "2026-05-19T11:00:00Z", completed: true },
      { status: "Shipped", description: "Package handed to carrier", timestamp: "", completed: false },
      { status: "Delivered", description: "Package delivered", timestamp: "", completed: false },
    ],
  },
  {
    id: "ORD-7825", customerName: "James Wilson", customerEmail: "j.wilson@email.com",
    items: [{ id: "itm-3", name: "Ergonomic Office Chair", quantity: 1, price: 449.00 }],
    total: 449.0, status: "delivered", createdAt: "2026-05-17T14:20:00Z", updatedAt: "2026-05-19T09:15:00Z",
    trackingNumber: "1Z999AA10123456784", shippingAddress: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    timeline: [
      { status: "Order Placed", description: "Order confirmed", timestamp: "2026-05-17T14:20:00Z", completed: true },
      { status: "Processing", description: "Order is being prepared", timestamp: "2026-05-17T16:00:00Z", completed: true },
      { status: "Shipped", description: "Package handed to carrier", timestamp: "2026-05-18T08:30:00Z", completed: true },
      { status: "Delivered", description: "Package delivered", timestamp: "2026-05-19T09:15:00Z", completed: true },
    ],
  },
  {
    id: "ORD-7820", customerName: "Emily Chen", customerEmail: "emily.c@email.com",
    items: [
      { id: "itm-4", name: "Smart Watch Pro", quantity: 1, price: 329.99 },
      { id: "itm-5", name: "Watch Band - Midnight Blue", quantity: 1, price: 49.99 },
    ],
    total: 392.97, status: "shipped", createdAt: "2026-05-16T09:45:00Z", updatedAt: "2026-05-18T11:00:00Z",
    trackingNumber: "9400111899223100001", shippingAddress: "350 Fifth Avenue, New York, NY 10118",
    timeline: [
      { status: "Order Placed", description: "Order confirmed", timestamp: "2026-05-16T09:45:00Z", completed: true },
      { status: "Processing", description: "Order is being prepared", timestamp: "2026-05-16T12:00:00Z", completed: true },
      { status: "Shipped", description: "Package handed to carrier", timestamp: "2026-05-18T11:00:00Z", completed: true },
      { status: "Delivered", description: "Package delivered", timestamp: "", completed: false },
    ],
  },
  {
    id: "ORD-7818", customerName: "David Park", customerEmail: "d.park@email.com",
    items: [{ id: "itm-7", name: '4K Gaming Monitor 27"', quantity: 1, price: 599.99 }],
    total: 599.99, status: "confirmed", createdAt: "2026-05-19T08:00:00Z", updatedAt: "2026-05-19T08:30:00Z",
    shippingAddress: "221B Baker Street, London, UK",
    timeline: [
      { status: "Order Placed", description: "Order confirmed", timestamp: "2026-05-19T08:00:00Z", completed: true },
      { status: "Processing", description: "Order is being prepared", timestamp: "", completed: false },
      { status: "Shipped", description: "Package handed to carrier", timestamp: "", completed: false },
      { status: "Delivered", description: "Package delivered", timestamp: "", completed: false },
    ],
  },
  {
    id: "ORD-7815", customerName: "Alex Thompson", customerEmail: "alex.t@email.com",
    items: [
      { id: "itm-8", name: "Mechanical Keyboard RGB", quantity: 1, price: 159.99 },
      { id: "itm-9", name: "Wrist Rest Pad", quantity: 1, price: 24.99 },
    ],
    total: 184.98, status: "cancelled", createdAt: "2026-05-15T16:30:00Z", updatedAt: "2026-05-16T10:00:00Z",
    shippingAddress: "10 Downing Street, Westminster, London",
    timeline: [
      { status: "Order Placed", description: "Order confirmed", timestamp: "2026-05-15T16:30:00Z", completed: true },
      { status: "Cancelled", description: "Customer requested cancellation", timestamp: "2026-05-16T10:00:00Z", completed: true },
    ],
  },
  {
    id: "ORD-7810", customerName: "Maria Garcia", customerEmail: "m.garcia@email.com",
    items: [{ id: "itm-10", name: "Bluetooth Speaker", quantity: 2, price: 79.99 }],
    total: 159.98, status: "out_for_delivery", createdAt: "2026-05-14T11:20:00Z", updatedAt: "2026-05-19T06:45:00Z",
    trackingNumber: "7489201345678", shippingAddress: "8 Rue de Rivoli, 75001 Paris, France",
    timeline: [
      { status: "Order Placed", description: "Order confirmed", timestamp: "2026-05-14T11:20:00Z", completed: true },
      { status: "Processing", description: "Order is being prepared", timestamp: "2026-05-14T14:00:00Z", completed: true },
      { status: "Shipped", description: "Package handed to carrier", timestamp: "2026-05-16T09:00:00Z", completed: true },
      { status: "Out for Delivery", description: "Package is on its way", timestamp: "2026-05-19T06:45:00Z", completed: true },
      { status: "Delivered", description: "Package delivered", timestamp: "", completed: false },
    ],
  },
];

export const chatConversations: ChatConversation[] = [
  { id: "conv-1", title: "Order Shipping Delay", lastMessage: "Your package is on its way!", timestamp: "2 min ago", unread: true },
  { id: "conv-2", title: "Return Request Help", lastMessage: "I've initiated the return for you.", timestamp: "1 hr ago", unread: false },
  { id: "conv-3", title: "Product Recommendation", lastMessage: "Based on your preferences, I suggest...", timestamp: "3 hr ago", unread: false },
  { id: "conv-4", title: "Payment Issue", lastMessage: "The payment has been processed successfully.", timestamp: "Yesterday", unread: false },
  { id: "conv-5", title: "Account Settings", lastMessage: "Your email has been updated.", timestamp: "2 days ago", unread: false },
];

export const chatMessages: ChatMessage[] = [
  { id: "msg-1", content: "Hi! I need help tracking my order #ORD-7820. It was supposed to arrive yesterday.", sender: "user", timestamp: "10:30 AM" },
  { id: "msg-2", content: "Hello! I'd be happy to help you track your order. Let me look that up for you right away. 🔍", sender: "ai", timestamp: "10:30 AM" },
  { id: "msg-3", content: "I found your order #ORD-7820. It contains a Smart Watch Pro, Watch Band, and Screen Protector. The package was shipped on May 18th and is currently in transit.", sender: "ai", timestamp: "10:31 AM" },
  { id: "msg-4", content: "The estimated delivery is tomorrow, May 20th. The slight delay was due to weather conditions. I apologize for the inconvenience! 🙏", sender: "ai", timestamp: "10:31 AM" },
  { id: "msg-5", content: "Oh I see, that makes sense. Can I get a notification when it's out for delivery?", sender: "user", timestamp: "10:32 AM" },
  { id: "msg-6", content: "Absolutely! I've enabled real-time delivery notifications for this order. You'll receive:\n\n✅ SMS alert when out for delivery\n✅ Email notification with live tracking link\n✅ Push notification 30 minutes before arrival\n\nIs there anything else I can help you with?", sender: "ai", timestamp: "10:32 AM" },
];

export const refundRequests: RefundRequest[] = [
  { id: "REF-1042", orderId: "ORD-7825", customerName: "James Wilson", reason: "defective", description: "The chair arrived with a broken armrest.", amount: 449.0, status: "approved", createdAt: "2026-05-19T11:00:00Z", updatedAt: "2026-05-19T14:30:00Z" },
  { id: "REF-1041", orderId: "ORD-7810", customerName: "Maria Garcia", reason: "wrong_item", description: "Received a red speaker instead of blue.", amount: 79.99, status: "pending", createdAt: "2026-05-19T09:30:00Z", updatedAt: "2026-05-19T09:30:00Z" },
  { id: "REF-1039", orderId: "ORD-7800", customerName: "Robert Kim", reason: "not_as_described", description: "Product quality does not match listing.", amount: 129.99, status: "under_review", createdAt: "2026-05-18T15:00:00Z", updatedAt: "2026-05-19T08:00:00Z" },
  { id: "REF-1037", orderId: "ORD-7795", customerName: "Lisa Anderson", reason: "arrived_late", description: "Package arrived 10 days late.", amount: 64.50, status: "completed", createdAt: "2026-05-17T10:00:00Z", updatedAt: "2026-05-18T16:00:00Z" },
  { id: "REF-1035", orderId: "ORD-7790", customerName: "Michael Brown", reason: "changed_mind", description: "No longer need this item.", amount: 199.99, status: "rejected", createdAt: "2026-05-16T12:00:00Z", updatedAt: "2026-05-17T14:00:00Z" },
];

export const escalations: Escalation[] = [
  {
    id: "ESC-301", ticketId: "TKT-4521", customerName: "Jennifer Lopez", subject: "Unauthorized charges on account",
    description: "Customer reports multiple unauthorized transactions totaling $1,247.50. Possible account breach.",
    priority: "critical", status: "open", assignedTo: "Team Lead - Sarah K.",
    createdAt: "2026-05-19T08:00:00Z", updatedAt: "2026-05-19T08:00:00Z",
    auditLog: [
      { id: "log-1", action: "Ticket created", performedBy: "System", timestamp: "2026-05-19T08:00:00Z", details: "Auto-escalated due to fraud detection" },
      { id: "log-2", action: "Assigned to Team Lead", performedBy: "AI Routing", timestamp: "2026-05-19T08:01:00Z" },
    ],
  },
  {
    id: "ESC-299", ticketId: "TKT-4518", customerName: "Thomas Wright", subject: "Damaged premium item — $2,500",
    description: "High-value electronics item arrived severely damaged. Customer provided photos.",
    priority: "high", status: "in_progress", assignedTo: "Agent Martinez",
    createdAt: "2026-05-18T14:30:00Z", updatedAt: "2026-05-19T10:00:00Z",
    auditLog: [
      { id: "log-3", action: "Ticket created", performedBy: "Agent Lee", timestamp: "2026-05-18T14:30:00Z" },
      { id: "log-4", action: "Photos uploaded", performedBy: "Customer", timestamp: "2026-05-18T15:00:00Z" },
      { id: "log-5", action: "Escalated to senior agent", performedBy: "Agent Lee", timestamp: "2026-05-18T15:30:00Z" },
      { id: "log-6", action: "Replacement order initiated", performedBy: "Agent Martinez", timestamp: "2026-05-19T10:00:00Z" },
    ],
  },
  {
    id: "ESC-297", ticketId: "TKT-4515", customerName: "Amanda Foster", subject: "Repeated delivery failures",
    description: "Customer has experienced 3 consecutive failed delivery attempts.",
    priority: "medium", status: "awaiting_customer", assignedTo: "Agent Johnson",
    createdAt: "2026-05-17T11:00:00Z", updatedAt: "2026-05-19T09:00:00Z",
    auditLog: [
      { id: "log-8", action: "Ticket created", performedBy: "AI Chat Bot", timestamp: "2026-05-17T11:00:00Z" },
      { id: "log-9", action: "Assigned to Agent Johnson", performedBy: "System", timestamp: "2026-05-17T11:05:00Z" },
      { id: "log-10", action: "Customer contacted", performedBy: "Agent Johnson", timestamp: "2026-05-18T09:00:00Z" },
    ],
  },
  {
    id: "ESC-295", ticketId: "TKT-4510", customerName: "Kevin O'Brien", subject: "Warranty claim dispute",
    description: "Customer claiming warranty coverage for item purchased 14 months ago.",
    priority: "low", status: "resolved", assignedTo: "Agent Williams",
    createdAt: "2026-05-15T16:00:00Z", updatedAt: "2026-05-18T12:00:00Z",
    auditLog: [
      { id: "log-12", action: "Ticket created", performedBy: "Agent Park", timestamp: "2026-05-15T16:00:00Z" },
      { id: "log-13", action: "Goodwill gesture approved", performedBy: "Supervisor Chen", timestamp: "2026-05-17T14:00:00Z" },
      { id: "log-14", action: "Customer accepted offer", performedBy: "Agent Williams", timestamp: "2026-05-18T12:00:00Z" },
    ],
  },
  {
    id: "ESC-293", ticketId: "TKT-4505", customerName: "Rachel Green", subject: "Bulk order pricing error",
    description: "Corporate client charged retail prices for bulk order of 500 units. ~$15,000 adjustment needed.",
    priority: "high", status: "open", assignedTo: "Unassigned",
    createdAt: "2026-05-19T07:30:00Z", updatedAt: "2026-05-19T07:30:00Z",
    auditLog: [
      { id: "log-17", action: "Ticket created", performedBy: "System", timestamp: "2026-05-19T07:30:00Z", details: "Auto-flagged: price discrepancy" },
    ],
  },
];

export const quickReplies = [
  "Where is my order?", "I want a refund", "Track my package",
  "Speak to an agent", "Change shipping address", "Cancel my order",
];
