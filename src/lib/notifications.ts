/**
 * Local Notifications Service for MindBreak
 * Handles scheduling and managing break reminder notifications
 */

import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getReminderSettings, type ReminderSettings } from './storage';

// Check if we're running on a native platform
const isNative = Capacitor.isNativePlatform();

// Notification channel ID for Android
const CHANNEL_ID = 'mindbreak-reminders';

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNative) {
    console.log('Notifications only work on native platforms');
    return false;
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  if (!isNative) return false;

  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to check notification permissions:', error);
    return false;
  }
}

/**
 * Create notification channel for Android
 */
export async function createNotificationChannel(): Promise<void> {
  if (!isNative || Capacitor.getPlatform() !== 'android') return;

  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Break Reminders',
      description: 'Gentle reminders to take a break from your screen',
      importance: 4, // High importance
      visibility: 1, // Public
      sound: 'default',
      vibration: true,
    });
  } catch (error) {
    console.error('Failed to create notification channel:', error);
  }
}

/**
 * Get a random reminder message
 */
function getRandomMessage(messages: string[]): string {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

/**
 * Schedule recurring break reminders based on user settings
 */
export async function scheduleBreakReminders(): Promise<void> {
  if (!isNative) {
    console.log('Scheduling notifications only works on native platforms');
    return;
  }

  const settings = getReminderSettings();
  
  if (!settings.enabled) {
    await cancelAllReminders();
    return;
  }

  // First, cancel existing reminders
  await cancelAllReminders();

  // Request permissions if needed
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return;
  }

  // Create channel for Android
  await createNotificationChannel();

  // Schedule notifications for the next 24 hours
  const notifications = generateNotificationSchedule(settings);
  
  if (notifications.length === 0) return;

  try {
    await LocalNotifications.schedule({ notifications });
    console.log(`Scheduled ${notifications.length} break reminders`);
  } catch (error) {
    console.error('Failed to schedule notifications:', error);
  }
}

/**
 * Generate notification schedule for the next 24 hours
 */
function generateNotificationSchedule(settings: ReminderSettings): ScheduleOptions['notifications'] {
  const notifications: ScheduleOptions['notifications'] = [];
  const now = new Date();
  const [startHour, startMinute] = settings.startTime.split(':').map(Number);
  const [endHour, endMinute] = settings.endTime.split(':').map(Number);
  
  // Start from the next interval
  let nextTime = new Date(now);
  nextTime.setMinutes(nextTime.getMinutes() + settings.intervalMinutes);
  nextTime.setSeconds(0);
  nextTime.setMilliseconds(0);

  // Schedule for next 24 hours within active hours
  const endDate = new Date(now);
  endDate.setHours(endDate.getHours() + 24);

  let notificationId = 1;

  while (nextTime < endDate && notificationId <= 50) { // Limit to 50 notifications
    const hour = nextTime.getHours();
    const minute = nextTime.getMinutes();
    
    // Check if within active hours
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const currentMinutes = hour * 60 + minute;
    
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      notifications.push({
        id: notificationId,
        title: '🌿 MindBreak',
        body: getRandomMessage(settings.messages),
        schedule: { at: nextTime },
        channelId: CHANNEL_ID,
        smallIcon: 'ic_stat_icon_config_sample',
        largeIcon: 'ic_launcher',
        actionTypeId: 'BREAK_REMINDER',
        extra: {
          type: 'break_reminder',
          scheduledAt: nextTime.toISOString(),
        },
      });
      notificationId++;
    }
    
    // Move to next interval
    nextTime = new Date(nextTime);
    nextTime.setMinutes(nextTime.getMinutes() + settings.intervalMinutes);
  }

  return notifications;
}

/**
 * Cancel all scheduled reminders
 */
export async function cancelAllReminders(): Promise<void> {
  if (!isNative) return;

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id })),
      });
      console.log(`Cancelled ${pending.notifications.length} pending reminders`);
    }
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
  }
}

/**
 * Send an immediate test notification
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!isNative) {
    console.log('Test notifications only work on native platforms');
    return false;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return false;

  await createNotificationChannel();

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: '🌿 MindBreak',
          body: 'This is a test reminder. Your notifications are working!',
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
          channelId: CHANNEL_ID,
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Failed to send test notification:', error);
    return false;
  }
}

/**
 * Add notification action listeners
 */
export function addNotificationListeners(): void {
  if (!isNative) return;

  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('Notification received:', notification);
  });

  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    console.log('Notification action performed:', action);
    // Could navigate to break confirmation screen here
  });
}

/**
 * Remove notification listeners
 */
export async function removeNotificationListeners(): Promise<void> {
  if (!isNative) return;
  await LocalNotifications.removeAllListeners();
}

/**
 * Initialize notifications on app start
 */
export async function initializeNotifications(): Promise<void> {
  if (!isNative) return;

  addNotificationListeners();
  
  const settings = getReminderSettings();
  if (settings.enabled) {
    await scheduleBreakReminders();
  }
}
