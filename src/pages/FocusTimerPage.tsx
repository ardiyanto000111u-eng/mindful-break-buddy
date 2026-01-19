import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Check, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WellnessCard } from "@/components/WellnessCard";
import { cn } from "@/lib/utils";
import { 
  saveFocusSession, 
  getFocusSessions, 
  updateLastActive,
  type FocusSession 
} from "@/lib/storage";
import { toast } from "sonner";

const PRESET_DURATIONS = [
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
];

type TimerState = "idle" | "running" | "paused" | "completed";

export function FocusTimerPage() {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // in seconds
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  // Load sessions on mount
  useEffect(() => {
    setSessions(getFocusSessions());
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState === "running" && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerState("completed");
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, timeRemaining]);

  const handleSessionComplete = useCallback(() => {
    const session = saveFocusSession(selectedMinutes, true);
    setSessions(getFocusSessions());
    updateLastActive();
    toast.success("🎉 Amazing! You completed your focus session!", {
      description: `${selectedMinutes} minutes of phone-free time!`,
    });
  }, [selectedMinutes]);

  const handleStart = () => {
    setTimerState("running");
    updateLastActive();
  };

  const handlePause = () => {
    setTimerState("paused");
  };

  const handleResume = () => {
    setTimerState("running");
  };

  const handleReset = () => {
    setTimerState("idle");
    setTimeRemaining(selectedMinutes * 60);
  };

  const handleSelectDuration = (minutes: number) => {
    if (timerState === "idle") {
      setSelectedMinutes(minutes);
      setTimeRemaining(minutes * 60);
    }
  };

  const handleGiveUp = () => {
    saveFocusSession(selectedMinutes, false, selectedMinutes * 60 - timeRemaining);
    setSessions(getFocusSessions());
    toast("Session ended early", {
      description: "That's okay! Try again when you're ready.",
    });
    handleReset();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercent = timerState === "idle" 
    ? 0 
    : ((selectedMinutes * 60 - timeRemaining) / (selectedMinutes * 60)) * 100;

  // Stats
  const completedSessions = sessions.filter(s => s.completed).length;
  const totalMinutes = sessions
    .filter(s => s.completed)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="min-h-screen bg-background pb-24 safe-top">
      <div className="px-5 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Timer className="w-6 h-6 text-primary" />
            Focus Timer
          </h1>
          <p className="text-muted-foreground mt-1">
            Set a phone-free session and stay focused
          </p>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          <div 
            className={cn(
              "aspect-square max-w-[280px] mx-auto rounded-full flex items-center justify-center transition-all duration-500",
              timerState === "completed" 
                ? "bg-success/20 border-4 border-success"
                : "bg-card border-4 border-primary/20"
            )}
            style={{
              background: timerState !== "completed" && timerState !== "idle"
                ? `conic-gradient(hsl(var(--primary)) ${progressPercent}%, hsl(var(--muted)) ${progressPercent}%)`
                : undefined,
            }}
          >
            <div 
              className={cn(
                "aspect-square rounded-full flex flex-col items-center justify-center bg-card",
                timerState === "completed" ? "w-[85%]" : "w-[90%]"
              )}
            >
              {timerState === "completed" ? (
                <>
                  <Check className="w-16 h-16 text-success mb-2" />
                  <span className="text-xl font-semibold text-success">Complete!</span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-display font-bold text-foreground tracking-tight">
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-sm text-muted-foreground mt-2">
                    {timerState === "idle" ? "Ready to focus" : 
                     timerState === "paused" ? "Paused" : "Stay focused..."}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Duration Presets */}
        {timerState === "idle" && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Select duration
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.minutes}
                  onClick={() => handleSelectDuration(preset.minutes)}
                  className={cn(
                    "py-3 px-4 rounded-xl font-medium transition-all duration-200",
                    selectedMinutes === preset.minutes
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          {timerState === "idle" && (
            <Button 
              onClick={handleStart} 
              size="lg" 
              className="gap-2 px-8 h-14 text-lg rounded-2xl"
            >
              <Play className="w-5 h-5" />
              Start Focus
            </Button>
          )}

          {timerState === "running" && (
            <>
              <Button 
                onClick={handlePause} 
                variant="outline" 
                size="lg"
                className="gap-2 h-14 rounded-2xl"
              >
                <Pause className="w-5 h-5" />
                Pause
              </Button>
              <Button 
                onClick={handleGiveUp} 
                variant="destructive" 
                size="lg"
                className="gap-2 h-14 rounded-2xl"
              >
                End Early
              </Button>
            </>
          )}

          {timerState === "paused" && (
            <>
              <Button 
                onClick={handleResume} 
                size="lg"
                className="gap-2 h-14 rounded-2xl"
              >
                <Play className="w-5 h-5" />
                Resume
              </Button>
              <Button 
                onClick={handleGiveUp} 
                variant="outline" 
                size="lg"
                className="gap-2 h-14 rounded-2xl"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>
            </>
          )}

          {timerState === "completed" && (
            <Button 
              onClick={handleReset} 
              size="lg"
              className="gap-2 px-8 h-14 text-lg rounded-2xl"
            >
              <RotateCcw className="w-5 h-5" />
              Start New Session
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <WellnessCard
            emoji="🎯"
            title="Sessions"
            value={completedSessions}
            subtitle="Completed"
          />
          <WellnessCard
            emoji="⏱️"
            title="Focus Time"
            value={`${totalMinutes}m`}
            subtitle="Total"
          />
        </div>

        {/* Tips */}
        <div className="mt-6">
          <WellnessCard
            emoji="💡"
            title="Focus Tips"
            variant="muted"
          >
            <ul className="text-sm text-muted-foreground space-y-2 mt-2">
              <li>• Put your phone face down or in another room</li>
              <li>• Close unnecessary browser tabs</li>
              <li>• Take a deep breath before starting</li>
            </ul>
          </WellnessCard>
        </div>
      </div>
    </div>
  );
}
