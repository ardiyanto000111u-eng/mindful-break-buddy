import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Challenge } from "@/lib/storage";

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (id: string) => void;
}

export function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  const { id, title, description, duration, icon, completed } = challenge;

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border transition-all duration-300 animate-fade-in",
        completed
          ? "bg-success/10 border-success/30"
          : "bg-card border-border shadow-card"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all",
            completed ? "bg-success/20" : "bg-secondary"
          )}
        >
          {completed ? <Check className="w-6 h-6 text-success" /> : icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                "font-display font-semibold",
                completed && "text-success"
              )}
            >
              {title}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {duration}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {!completed && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="calm"
            size="sm"
            onClick={() => onComplete(id)}
            className="rounded-xl"
          >
            Mark Complete
          </Button>
        </div>
      )}

      {completed && (
        <div className="mt-3 text-sm text-success font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          Completed
        </div>
      )}
    </div>
  );
}
