import { useState } from "react";
import { ChevronRight, Shield, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setOnboardingComplete } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  emoji: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <Sparkles className="w-12 h-12" />,
    title: "Welcome to MindBreak",
    description:
      "Your gentle companion for building healthier digital habits. No judgment, just support.",
    emoji: "🌿",
  },
  {
    icon: <Heart className="w-12 h-12" />,
    title: "Take Mindful Breaks",
    description:
      "Set gentle reminders to step away from your screen. Small breaks lead to big changes.",
    emoji: "🧘",
  },
  {
    icon: <Shield className="w-12 h-12" />,
    title: "Your Privacy Matters",
    description:
      "All your data stays on your device. No accounts, no cloud, no tracking. Just you and your wellness journey.",
    emoji: "🔒",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setOnboardingComplete();
      onComplete();
    }
  };

  const handleSkip = () => {
    setOnboardingComplete();
    onComplete();
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-[100]">
      {/* Skip button */}
      <div className="flex justify-end p-4 safe-top">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <div key={currentSlide} className="animate-fade-in text-center max-w-sm">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-28 h-28 rounded-full gradient-calm flex items-center justify-center text-primary-foreground shadow-soft animate-breathe">
              <span className="text-5xl">{slide.emoji}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            {slide.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Indicators and button */}
      <div className="px-8 pb-12 safe-bottom">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-primary/20"
              )}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          variant="calm"
          size="xl"
          className="w-full"
          onClick={handleNext}
        >
          {isLastSlide ? (
            "Get Started"
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
