import { useState, useEffect } from "react";
import { isOnboardingComplete } from "@/lib/storage";
import { Onboarding } from "@/components/Onboarding";
import { HomePage } from "@/pages/HomePage";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingComplete());

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return <HomePage />;
};

export default Index;
