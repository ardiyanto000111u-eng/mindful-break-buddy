import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface WellnessCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  emoji?: string;
  value?: string | number;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "accent" | "success" | "muted";
}

export function WellnessCard({
  title,
  subtitle,
  icon: Icon,
  emoji,
  value,
  children,
  onClick,
  className,
  variant = "default",
}: WellnessCardProps) {
  const variantClasses = {
    default: "bg-card shadow-card",
    accent: "gradient-warm",
    success: "bg-success/10 border-success/20",
    muted: "bg-muted",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-5 border border-border transition-all duration-200",
        variantClasses[variant],
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {(Icon || emoji) && (
            <div className="mb-3">
              {emoji ? (
                <span className="text-2xl">{emoji}</span>
              ) : Icon ? (
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              ) : null}
            </div>
          )}
          <h3 className="font-display font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {value !== undefined && (
          <div className="text-right">
            <span className="text-2xl font-display font-bold text-primary">
              {value}
            </span>
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
