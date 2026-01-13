import { useState, useEffect } from "react";
import { Bell, Clock, MessageCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  getReminderSettings,
  saveReminderSettings,
  type ReminderSettings,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const intervalOptions = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export function RemindersPage() {
  const [settings, setSettings] = useState<ReminderSettings>(getReminderSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveReminderSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = (enabled: boolean) => {
    setSettings({ ...settings, enabled });
  };

  const handleIntervalChange = (value: number) => {
    setSettings({ ...settings, intervalMinutes: value });
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="px-5 pt-8 safe-top">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Reminders
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your break reminders
        </p>
      </div>

      {/* Enable Toggle */}
      <div className="px-5 mt-8">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-card animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  settings.enabled ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Bell
                  className={cn(
                    "w-6 h-6 transition-colors",
                    settings.enabled ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <div>
                <Label className="text-base font-semibold">
                  Break Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  {settings.enabled ? "Active" : "Disabled"}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </div>

      {/* Interval Selection */}
      <div className="px-5 mt-6">
        <div
          className={cn(
            "bg-card rounded-2xl p-5 border border-border shadow-card transition-opacity",
            !settings.enabled && "opacity-50 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Reminder Interval</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {intervalOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleIntervalChange(option.value)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-center font-medium",
                  settings.intervalMinutes === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/30 text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Messages */}
      <div className="px-5 mt-6">
        <div
          className={cn(
            "bg-card rounded-2xl p-5 border border-border shadow-card transition-opacity",
            !settings.enabled && "opacity-50 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Reminder Messages</h3>
          </div>

          <div className="space-y-3">
            {settings.messages.slice(0, 3).map((message, index) => (
              <div
                key={index}
                className="bg-muted/50 rounded-xl p-4 text-sm text-foreground"
              >
                "{message}"
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Messages rotate with each reminder
          </p>
        </div>
      </div>

      {/* Active Hours Info */}
      <div className="px-5 mt-6">
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <h3 className="font-display font-semibold text-foreground mb-2">
            📱 How Reminders Work
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set your phone's notification settings to allow MindBreak reminders. 
            Reminders will gently notify you to take breaks at your chosen interval.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="px-5 mt-8 pb-8">
        <Button
          variant="calm"
          size="lg"
          className="w-full"
          onClick={handleSave}
        >
          <Save className="w-5 h-5 mr-2" />
          {saved ? "Saved! ✓" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
