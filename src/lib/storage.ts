/**
 * LocalStorage utilities for MindBreak app
 * All user data is stored locally on device - no cloud sync
 * 
 * STORAGE ARCHITECTURE:
 * - All data persists in localStorage with 'mindbreak_' prefix
 * - Data survives app restarts, updates, and browser sessions
 * - No cloud sync = complete privacy
 * - Auto-save on every user action
 */

// Storage keys - all prefixed to avoid conflicts
const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: 'mindbreak_onboarding_complete',
  REMINDER_SETTINGS: 'mindbreak_reminder_settings',
  STREAK_DATA: 'mindbreak_streak_data',
  CHALLENGES: 'mindbreak_challenges',
  REFLECTIONS: 'mindbreak_reflections',
  DETOX_SESSIONS: 'mindbreak_detox_sessions',
  FOCUS_SESSIONS: 'mindbreak_focus_sessions', // Focus timer sessions
  LAST_ACTIVE: 'mindbreak_last_active', // Track app usage
  APP_VERSION: 'mindbreak_app_version', // For future migrations
} as const;

// Current app version for data migrations
const CURRENT_APP_VERSION = '1.0.0';

// Types
export interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // 30, 60, 120, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  messages: string[];
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastBreakDate: string | null; // ISO date string
  totalDetoxDays: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  completed: boolean;
  completedDate?: string;
}

export interface Reflection {
  id: string;
  date: string; // ISO date string
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'tough';
}

export interface DetoxSession {
  id: string;
  date: string;
  confirmed: boolean;
}

export interface FocusSession {
  id: string;
  date: string;
  durationMinutes: number;
  completed: boolean;
  actualSeconds?: number; // If ended early, how long they lasted
}

// Default values
const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  intervalMinutes: 60,
  startTime: '09:00',
  endTime: '21:00',
  messages: [
    "Time to rest your eyes 👀",
    "Let's take a short break from the screen",
    "Your mind deserves a moment of peace 🧘",
    "Step away and breathe deeply 🌿",
    "A short break can boost your focus ✨",
  ],
};

const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastBreakDate: null,
  totalDetoxDays: 0,
};

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'no-phone-15',
    title: 'Phone-Free 15',
    description: 'Put your phone down for 15 minutes',
    duration: '15 min',
    icon: '📵',
    completed: false,
  },
  {
    id: 'meal-mindful',
    title: 'Mindful Meal',
    description: 'Enjoy a meal without your phone',
    duration: '30 min',
    icon: '🍽️',
    completed: false,
  },
  {
    id: 'stretch-break',
    title: 'Stretch & Breathe',
    description: 'Take a 10-minute stretch break',
    duration: '10 min',
    icon: '🧘',
    completed: false,
  },
  {
    id: 'read-offline',
    title: 'Offline Reading',
    description: 'Read a book or magazine for 20 minutes',
    duration: '20 min',
    icon: '📖',
    completed: false,
  },
  {
    id: 'nature-walk',
    title: 'Nature Walk',
    description: 'Take a walk outside without your phone',
    duration: '15 min',
    icon: '🌳',
    completed: false,
  },
  {
    id: 'morning-peace',
    title: 'Morning Peace',
    description: 'Start your day without checking your phone for 30 minutes',
    duration: '30 min',
    icon: '🌅',
    completed: false,
  },
];

// Storage functions
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

// Onboarding
export function isOnboardingComplete(): boolean {
  return getItem(STORAGE_KEYS.ONBOARDING_COMPLETE, false);
}

export function setOnboardingComplete(): void {
  setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
}

// Reminder settings
export function getReminderSettings(): ReminderSettings {
  return getItem(STORAGE_KEYS.REMINDER_SETTINGS, DEFAULT_REMINDER_SETTINGS);
}

export function saveReminderSettings(settings: ReminderSettings): void {
  setItem(STORAGE_KEYS.REMINDER_SETTINGS, settings);
}

// Streak data
export function getStreakData(): StreakData {
  return getItem(STORAGE_KEYS.STREAK_DATA, DEFAULT_STREAK_DATA);
}

export function saveStreakData(data: StreakData): void {
  setItem(STORAGE_KEYS.STREAK_DATA, data);
}

export function confirmBreak(): StreakData {
  const today = new Date().toISOString().split('T')[0];
  const data = getStreakData();
  
  // Check if already confirmed today
  if (data.lastBreakDate === today) {
    return data;
  }
  
  // Check if streak continues (yesterday or first time)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let newStreak = data.currentStreak;
  if (data.lastBreakDate === yesterdayStr || data.lastBreakDate === null) {
    newStreak = data.currentStreak + 1;
  } else {
    // Gap in streak, but we don't reset automatically - just add to it
    newStreak = data.currentStreak + 1;
  }
  
  const updatedData: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, data.longestStreak),
    lastBreakDate: today,
    totalDetoxDays: data.totalDetoxDays + 1,
  };
  
  saveStreakData(updatedData);
  
  // Also save detox session
  saveDetoxSession(today);
  
  return updatedData;
}

export function resetStreak(): void {
  const data = getStreakData();
  saveStreakData({
    ...data,
    currentStreak: 0,
    lastBreakDate: null,
  });
}

// Challenges
export function getChallenges(): Challenge[] {
  return getItem(STORAGE_KEYS.CHALLENGES, DEFAULT_CHALLENGES);
}

export function saveChallenges(challenges: Challenge[]): void {
  setItem(STORAGE_KEYS.CHALLENGES, challenges);
}

export function completeChallenge(challengeId: string): Challenge[] {
  const challenges = getChallenges();
  const today = new Date().toISOString().split('T')[0];
  
  const updated = challenges.map(c => 
    c.id === challengeId 
      ? { ...c, completed: true, completedDate: today }
      : c
  );
  
  saveChallenges(updated);
  return updated;
}

export function resetChallenges(): void {
  const challenges = getChallenges();
  const reset = challenges.map(c => ({ ...c, completed: false, completedDate: undefined }));
  saveChallenges(reset);
}

// Reflections
export function getReflections(): Reflection[] {
  return getItem(STORAGE_KEYS.REFLECTIONS, []);
}

export function saveReflection(content: string, mood?: Reflection['mood']): Reflection {
  const reflections = getReflections();
  const today = new Date().toISOString().split('T')[0];
  
  // Check if there's already a reflection for today
  const existingIndex = reflections.findIndex(r => r.date === today);
  
  const newReflection: Reflection = {
    id: existingIndex >= 0 ? reflections[existingIndex].id : Date.now().toString(),
    date: today,
    content,
    mood,
  };
  
  if (existingIndex >= 0) {
    reflections[existingIndex] = newReflection;
  } else {
    reflections.unshift(newReflection);
  }
  
  setItem(STORAGE_KEYS.REFLECTIONS, reflections);
  return newReflection;
}

// Detox sessions
export function getDetoxSessions(): DetoxSession[] {
  return getItem(STORAGE_KEYS.DETOX_SESSIONS, []);
}

export function saveDetoxSession(date: string): void {
  const sessions = getDetoxSessions();
  const existing = sessions.find(s => s.date === date);
  
  if (!existing) {
    sessions.unshift({
      id: Date.now().toString(),
      date,
      confirmed: true,
    });
    setItem(STORAGE_KEYS.DETOX_SESSIONS, sessions);
  }
}

// Focus sessions
export function getFocusSessions(): FocusSession[] {
  return getItem(STORAGE_KEYS.FOCUS_SESSIONS, []);
}

export function saveFocusSession(
  durationMinutes: number, 
  completed: boolean, 
  actualSeconds?: number
): FocusSession {
  const sessions = getFocusSessions();
  const newSession: FocusSession = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    durationMinutes,
    completed,
    actualSeconds,
  };
  
  sessions.unshift(newSession);
  setItem(STORAGE_KEYS.FOCUS_SESSIONS, sessions);
  return newSession;
}

export function getTotalFocusMinutes(): number {
  return getFocusSessions()
    .filter(s => s.completed)
    .reduce((acc, s) => acc + s.durationMinutes, 0);
}

// Get completed challenges count
export function getCompletedChallengesCount(): number {
  return getChallenges().filter(c => c.completed).length;
}

// Reset all data
export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key);
  });
}

/**
 * Update last active timestamp - called on app interactions
 * Useful for tracking engagement and potential future features
 */
export function updateLastActive(): void {
  setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());
}

export function getLastActive(): string | null {
  return getItem(STORAGE_KEYS.LAST_ACTIVE, null);
}

/**
 * Initialize storage - run on app start
 * Handles version migrations and ensures data integrity
 */
export function initializeStorage(): void {
  const storedVersion = getItem(STORAGE_KEYS.APP_VERSION, null);
  
  // Set current version
  setItem(STORAGE_KEYS.APP_VERSION, CURRENT_APP_VERSION);
  
  // Update last active
  updateLastActive();
  
  // Future: Add version migration logic here
  // if (storedVersion !== CURRENT_APP_VERSION) {
  //   migrateData(storedVersion, CURRENT_APP_VERSION);
  // }
}

/**
 * Get a summary of all stored data (for debugging/verification)
 */
export function getStorageSummary(): {
  hasOnboarded: boolean;
  reminderEnabled: boolean;
  currentStreak: number;
  totalDetoxDays: number;
  completedChallenges: number;
  totalReflections: number;
  lastActive: string | null;
} {
  const streak = getStreakData();
  const reminders = getReminderSettings();
  
  return {
    hasOnboarded: isOnboardingComplete(),
    reminderEnabled: reminders.enabled,
    currentStreak: streak.currentStreak,
    totalDetoxDays: streak.totalDetoxDays,
    completedChallenges: getCompletedChallengesCount(),
    totalReflections: getReflections().length,
    lastActive: getLastActive(),
  };
}

/**
 * Check if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = 'mindbreak_storage_test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Export storage keys for settings
export { STORAGE_KEYS };
