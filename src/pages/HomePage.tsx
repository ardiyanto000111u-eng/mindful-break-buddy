import { useState, useEffect } from "react";
import { Sparkles, Clock, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/StreakBadge";
import { WellnessCard } from "@/components/WellnessCard";
import {
  getStreakData,
  confirmBreak,
  getReminderSettings,
  getCompletedChallengesCount,
  type StreakData,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

// Motivational messages based on streak
const getMotivationalMessage = (streak: number): string => {
  if (streak === 0) return "Ready to start your wellness journey? 🌱";
  if (streak === 1) return "Great start! Your journey begins with a single step 🌿";
  if (streak < 7) return "You're building momentum! Keep going 💪";
  if (streak < 14) return "One week strong! You're doing amazing ✨";
  if (streak < 30) return "Your dedication is inspiring! 🌟";
  return "You're a mindfulness master! 🏆";
};

// Time-based greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export function HomePage() {
  const [streakData, setStreakData] = useState<StreakData>(getStreakData());
  const [reminderSettings] = useState(getReminderSettings());
  const [completedChallenges] = useState(getCompletedChallengesCount());
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirmBreak = () => {
    const updated = confirmBreak();
    setStreakData(updated);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  // Check if break was confirmed today
  const today = new Date().toISOString().split("T")[0];
  const confirmedToday = streakData.lastBreakDate === today;

  return (
    <div className="min-h-screen pb-24 gradient-nature">
      {/* Header */}
      <div className="px-5 pt-8 safe-top">
        <p className="text-muted-foreground font-medium">{getGreeting()}</p>
        <h1 className="text-2xl font-display font-bold text-foreground mt-1">
          Your Mindful Space
        </h1>
      </div>

      {/* Streak Section */}
      <div className="px-5 mt-8">
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium mb-1">
                Current Streak
              </p>
              <p className="text-foreground font-display text-lg">
                {getMotivationalMessage(streakData.currentStreak)}
              </p>
            </div>
            <StreakBadge streak={streakData.currentStreak} size="md" />
          </div>

          {/* Confirm Break Button */}
          <div className="mt-6">
            {confirmedToday ? (
              <div className="flex items-center gap-3 text-success bg-success/10 rounded-xl p-4">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Break confirmed today! Great job 🎉</span>
              </div>
            ) : (
              <Button
                variant="calm"
                size="lg"
                className="w-full"
                onClick={handleConfirmBreak}
              >
                <Clock className="w-5 h-5 mr-2" />
                I Took a Break
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {showConfirmation && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-success text-success-foreground rounded-2xl p-4 shadow-lg flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <p className="font-semibold">Break Confirmed!</p>
              <p className="text-sm opacity-90">Keep up the great work 🌟</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-5 mt-6 grid grid-cols-2 gap-4">
        <WellnessCard
          emoji="🔥"
          title="Longest Streak"
          value={`${streakData.longestStreak} days`}
          variant="muted"
        />
        <WellnessCard
          emoji="📅"
          title="Total Detox Days"
          value={streakData.totalDetoxDays}
          variant="muted"
        />
      </div>

      {/* Reminder Status */}
      <div className="px-5 mt-6">
        <WellnessCard
          icon={Clock}
          title="Reminder Status"
          subtitle={
            reminderSettings.enabled
              ? `Every ${reminderSettings.intervalMinutes} minutes`
              : "Reminders are off"
          }
          variant={reminderSettings.enabled ? "success" : "default"}
        >
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                reminderSettings.enabled ? "bg-success animate-pulse-soft" : "bg-muted-foreground"
              )}
            />
            <span className="text-muted-foreground">
              {reminderSettings.enabled ? "Active" : "Inactive"}
            </span>
          </div>
        </WellnessCard>
      </div>

      {/* Challenges Progress */}
      <div className="px-5 mt-6">
        <WellnessCard
          icon={Target}
          title="Challenges Completed"
          subtitle="Keep exploring new ways to disconnect"
          value={completedChallenges}
          variant="accent"
        />
      </div>

      {/* Daily Tip */}
      <div className="px-5 mt-6 mb-8">
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <p className="text-sm font-medium text-primary mb-2">💡 Daily Tip</p>
          <p className="text-foreground">
            Try placing your phone in another room during meals. It's a simple way to be more present.
          </p>
        </div>
      </div>
    </div>
  );
}
