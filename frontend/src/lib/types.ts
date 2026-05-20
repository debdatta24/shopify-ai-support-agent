// ===== Core Entity Types =====

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  shippingAddress: string;
  timeline: TimelineEvent[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export type OrderStatus =
  | "processing"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export interface TimelineEvent {
  status: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

// ===== Chat Types =====

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  status?: "sending" | "sent" | "error";
}

export interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

// ===== Refund Types =====

export interface RefundRequest {
  id: string;
  orderId: string;
  customerName: string;
  reason: RefundReason;
  description: string;
  amount: number;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
}

export type RefundReason =
  | "defective"
  | "wrong_item"
  | "not_as_described"
  | "arrived_late"
  | "changed_mind"
  | "other";

export type RefundStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "completed";

// ===== Escalation Types =====

export interface Escalation {
  id: string;
  ticketId: string;
  customerName: string;
  subject: string;
  description: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  auditLog: AuditLogEntry[];
}

export type EscalationPriority = "critical" | "high" | "medium" | "low";

export type EscalationStatus =
  | "open"
  | "in_progress"
  | "awaiting_customer"
  | "resolved"
  | "closed";

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

// ===== Dashboard Stats =====

export interface DashboardStat {
  label: string;
  value: string | number;
  change: number; // percentage change
  changeLabel: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  type: "order" | "refund" | "escalation" | "chat";
  message: string;
  timestamp: string;
  avatar?: string;
}
