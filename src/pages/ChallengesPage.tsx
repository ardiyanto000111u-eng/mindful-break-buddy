import { useState, useEffect } from "react";
import { Target, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChallengeCard } from "@/components/ChallengeCard";
import {
  getChallenges,
  completeChallenge,
  resetChallenges,
  type Challenge,
} from "@/lib/storage";

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(getChallenges());

  const completedCount = challenges.filter((c) => c.completed).length;
  const allCompleted = completedCount === challenges.length;

  const handleComplete = (id: string) => {
    const updated = completeChallenge(id);
    setChallenges(updated);
  };

  const handleReset = () => {
    resetChallenges();
    setChallenges(getChallenges());
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="px-5 pt-8 safe-top">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Challenges
        </h1>
        <p className="text-muted-foreground mt-1">
          Simple ways to disconnect and recharge
        </p>
      </div>

      {/* Progress */}
      <div className="px-5 mt-6">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">
                  Progress
                </p>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {challenges.length} completed
                </p>
              </div>
            </div>
            {completedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-calm rounded-full transition-all duration-500"
              style={{
                width: `${(completedCount / challenges.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* All Completed Celebration */}
      {allCompleted && (
        <div className="px-5 mt-6 animate-scale-in">
          <div className="bg-success/10 rounded-2xl p-6 border border-success/20 text-center">
            <Trophy className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="text-xl font-display font-bold text-success mb-2">
              Amazing Work! 🎉
            </h3>
            <p className="text-success/80">
              You've completed all challenges. Reset to try them again!
            </p>
          </div>
        </div>
      )}

      {/* Challenge List */}
      <div className="px-5 mt-6 space-y-4 pb-8">
        {challenges.map((challenge, index) => (
          <div
            key={challenge.id}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-slide-up"
          >
            <ChallengeCard
              challenge={challenge}
              onComplete={handleComplete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
