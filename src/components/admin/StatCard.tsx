// src/components/admin/StatCard.tsx
import { cn } from "@/lib/utils";

interface StatCardProps {
  label:       string;
  value:       string | number;
  icon:        React.ReactNode;
  trend?:      string;
  trendUp?:    boolean;
  accentColor?: string;
  className?:  string;
}

export function StatCard({
  label, value, icon, trend, trendUp, accentColor = "var(--color-primary)", className,
}: StatCardProps) {
  return (
    <div className={cn("glass rounded-2xl p-5 flex flex-col gap-3 animate-fadeInUp", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-text-faint)" }}>
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accentColor}18`, color: accentColor }}>
          {icon}
        </div>
      </div>

      <div style={{
        fontFamily: "var(--font-display)",
        fontSize:   "var(--text-xl)",
        fontWeight: 800,
        color:      "var(--color-text)",
        lineHeight: 1,
      }}>
        {value}
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-xs"
          style={{ color: trendUp ? "var(--color-success)" : "var(--color-error)" }}>
          <span>{trendUp ? "↑" : "↓"}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}