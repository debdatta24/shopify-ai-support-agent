interface BadgeProps {
  label: string;
  variant?: string;
  size?: "sm" | "md";
}

export default function Badge({ label, variant = "", size = "sm" }: BadgeProps) {
  const formatted = label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${sizeClasses} ${variant}`}
    >
      {formatted}
    </span>
  );
}
