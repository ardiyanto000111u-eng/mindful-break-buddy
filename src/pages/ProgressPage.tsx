import { useState, useEffect } from "react";
import { Flame, Calendar, Target, Heart, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WellnessCard } from "@/components/WellnessCard";
import { StreakBadge } from "@/components/StreakBadge";
import {
  getStreakData,
  getCompletedChallengesCount,
  getReflections,
  saveReflection,
  type StreakData,
  type Reflection,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const moodOptions = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "tough", emoji: "😔", label: "Tough" },
] as const;

export function ProgressPage() {
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState<StreakData>(getStreakData());
  const [completedChallenges] = useState(getCompletedChallengesCount());
  const [reflections, setReflections] = useState<Reflection[]>(getReflections());
  const [reflectionText, setReflectionText] = useState("");
  const [selectedMood, setSelectedMood] = useState<Reflection["mood"]>();
  const [saved, setSaved] = useState(false);

  // Check if there's a reflection for today
  const today = new Date().toISOString().split("T")[0];
  const todayReflection = reflections.find((r) => r.date === today);

  useEffect(() => {
    if (todayReflection) {
      setReflectionText(todayReflection.content);
      setSelectedMood(todayReflection.mood);
    }
  }, [todayReflection]);

  const handleSaveReflection = () => {
    if (reflectionText.trim()) {
      const saved = saveReflection(reflectionText.trim(), selectedMood);
      setReflections(getReflections());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Motivational message based on overall progress
  const getProgressMessage = (): string => {
    const total =
      streakData.totalDetoxDays + completedChallenges + reflections.length;
    if (total === 0) return "Your wellness journey is just beginning 🌱";
    if (total < 10) return "You're making great progress! 🌿";
    if (total < 25) return "Your dedication is inspiring! ✨";
    if (total < 50) return "You're becoming a mindfulness pro! 🌟";
    return "You've achieved amazing things! 🏆";
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="px-5 pt-8 safe-top flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Your wellness journey at a glance
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => navigate("/settings")}
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Streak Display */}
      <div className="px-5 mt-6">
        <div className="bg-card rounded-3xl p-6 border border-border shadow-card animate-fade-in">
          <div className="flex flex-col items-center text-center">
            <StreakBadge streak={streakData.currentStreak} size="lg" />
            <p className="mt-4 font-display font-semibold text-lg text-foreground">
              {getProgressMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-5 mt-6 grid grid-cols-2 gap-4">
        <WellnessCard
          emoji="🔥"
          title="Longest Streak"
          value={`${streakData.longestStreak}`}
          subtitle="days"
          variant="muted"
        />
        <WellnessCard
          emoji="📅"
          title="Total Days"
          value={`${streakData.totalDetoxDays}`}
          subtitle="detox days"
          variant="muted"
        />
        <WellnessCard
          emoji="🎯"
          title="Challenges"
          value={`${completedChallenges}`}
          subtitle="completed"
          variant="muted"
        />
        <WellnessCard
          emoji="📝"
          title="Reflections"
          value={`${reflections.length}`}
          subtitle="entries"
          variant="muted"
        />
      </div>

      {/* Daily Reflection */}
      <div className="px-5 mt-8">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Daily Reflection</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            How did your break feel today?
          </p>

          {/* Mood Selection */}
          <div className="flex gap-2 mb-4">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 transition-all text-center",
                  selectedMood === mood.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30"
                )}
              >
                <span className="text-xl">{mood.emoji}</span>
                <p className="text-xs mt-1 text-muted-foreground">
                  {mood.label}
                </p>
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Write a few words about your day..."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="min-h-[100px] resize-none rounded-xl border-border"
          />

          <Button
            variant="calm"
            size="default"
            className="w-full mt-4"
            onClick={handleSaveReflection}
            disabled={!reflectionText.trim()}
          >
            {saved ? "Saved! ✓" : todayReflection ? "Update Reflection" : "Save Reflection"}
          </Button>
        </div>
      </div>

      {/* Past Reflections */}
      {reflections.length > 0 && (
        <div className="px-5 mt-8 pb-8">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Past Reflections
          </h3>
          <div className="space-y-3">
            {reflections.slice(0, 5).map((reflection) => (
              <div
                key={reflection.id}
                className="bg-muted/50 rounded-xl p-4 animate-fade-in"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {new Date(reflection.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {reflection.mood && (
                    <span className="text-lg">
                      {moodOptions.find((m) => m.value === reflection.mood)
                        ?.emoji}
                    </span>
                  )}
                </div>
                <p className="text-foreground text-sm">{reflection.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
