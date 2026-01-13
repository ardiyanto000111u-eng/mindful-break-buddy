import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function StreakBadge({ streak, size = "md", animate = true }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "w-16 h-16 text-xl",
    md: "w-24 h-24 text-3xl",
    lg: "w-32 h-32 text-4xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-success/20 to-success/10 border-2 border-success/30",
        sizeClasses[size],
        animate && streak > 0 && "animate-streak-glow"
      )}
    >
      <Flame
        className={cn(
          iconSizes[size],
          "text-success",
          animate && streak > 0 && "animate-pulse-soft"
        )}
      />
      <span className="font-display font-bold text-success">{streak}</span>
      {size !== "sm" && (
        <span className="text-xs text-success/80 font-medium">
          {streak === 1 ? "day" : "days"}
        </span>
      )}
    </div>
  );
}
