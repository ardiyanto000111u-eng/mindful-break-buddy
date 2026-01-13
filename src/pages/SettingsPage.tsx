import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Bell,
  Trash2,
  Info,
  Shield,
  Heart,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getReminderSettings,
  saveReminderSettings,
  resetAllData,
  resetStreak,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const APP_VERSION = "1.0.0";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive";
}

function SettingItem({
  icon,
  title,
  subtitle,
  action,
  onClick,
  variant = "default",
}: SettingItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-colors",
        onClick && "cursor-pointer hover:bg-muted/50",
        variant === "destructive" && "text-destructive"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          variant === "destructive" ? "bg-destructive/10" : "bg-muted"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [reminderSettings, setReminderSettings] = useState(
    getReminderSettings()
  );

  const handleToggleReminders = (enabled: boolean) => {
    const updated = { ...reminderSettings, enabled };
    setReminderSettings(updated);
    saveReminderSettings(updated);
  };

  const handleResetAll = () => {
    resetAllData();
    navigate("/");
    window.location.reload();
  };

  const handleResetStreak = () => {
    resetStreak();
    navigate("/");
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="px-5 pt-8 safe-top flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Settings
        </h1>
      </div>

      {/* Reminders Section */}
      <div className="px-5 mt-8">
        <p className="text-sm font-medium text-muted-foreground mb-3 px-1">
          REMINDERS
        </p>
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <SettingItem
            icon={<Bell className="w-5 h-5 text-primary" />}
            title="Break Reminders"
            subtitle={reminderSettings.enabled ? "On" : "Off"}
            action={
              <Switch
                checked={reminderSettings.enabled}
                onCheckedChange={handleToggleReminders}
              />
            }
          />
        </div>
      </div>

      {/* Data Section */}
      <div className="px-5 mt-8">
        <p className="text-sm font-medium text-muted-foreground mb-3 px-1">
          DATA
        </p>
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden divide-y divide-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div>
                <SettingItem
                  icon={<AlertTriangle className="w-5 h-5 text-warning" />}
                  title="Reset Streak"
                  subtitle="Start your streak over"
                  onClick={() => {}}
                />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset your streak?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset your current streak to 0. Your total detox
                  days and other data will be preserved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetStreak}
                  className="rounded-xl bg-warning text-warning-foreground hover:bg-warning/90"
                >
                  Reset Streak
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div>
                <SettingItem
                  icon={<Trash2 className="w-5 h-5 text-destructive" />}
                  title="Reset All Data"
                  subtitle="Clear everything and start fresh"
                  variant="destructive"
                  onClick={() => {}}
                />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your data including streaks,
                  challenges, reflections, and settings. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetAll}
                  className="rounded-xl bg-destructive hover:bg-destructive/90"
                >
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* About Section */}
      <div className="px-5 mt-8">
        <p className="text-sm font-medium text-muted-foreground mb-3 px-1">
          ABOUT
        </p>
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden divide-y divide-border">
          <SettingItem
            icon={<Shield className="w-5 h-5 text-success" />}
            title="Privacy"
            subtitle="All data stays on your device"
          />
          <SettingItem
            icon={<Info className="w-5 h-5 text-primary" />}
            title="Version"
            subtitle={`MindBreak v${APP_VERSION}`}
          />
        </div>
      </div>

      {/* About App */}
      <div className="px-5 mt-8 pb-8">
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">
              About MindBreak
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MindBreak is your gentle companion for building healthier digital
            habits. We believe in supporting your wellness journey without
            judgment – just calm, encouraging guidance to help you disconnect
            and recharge.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Your privacy matters. All your data is stored locally on your device
            – no accounts, no cloud, no tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
