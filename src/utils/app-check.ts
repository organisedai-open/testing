// App Check utility functions for security verification
import { getToken } from 'firebase/app-check';
import { appCheck } from '../integrations/firebase/client';

/**
 * Get a valid App Check token
 * @returns Promise<string> - The App Check token
 */
export async function getAppCheckToken(): Promise<string> {
  try {
    const token = await getToken(appCheck);
    return token.token;
  } catch (error) {
    console.error('Failed to get App Check token:', error);
    throw new Error('App Check token verification failed');
  }
}

/**
 * Verify App Check token is valid
 * @param token - The token to verify
 * @returns boolean - Whether the token is valid
 */
export function verifyAppCheckToken(token: string): boolean {
  // Basic token format validation
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // App Check tokens are JWT format, should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  return true;
}

/**
 * Log App Check verification events for security monitoring
 * @param event - The event type
 * @param details - Additional details about the event
 */
export function logAppCheckEvent(event: string, details: Record<string, unknown> = {}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    origin: window.location.origin
  };
  
  console.log('App Check Security Event:', logEntry);
  
  // In production, you might want to send this to a logging service
  // For now, we'll store in localStorage for verification
  const logs = JSON.parse(localStorage.getItem('appCheckLogs') || '[]');
  logs.push(logEntry);
  localStorage.setItem('appCheckLogs', JSON.stringify(logs.slice(-100))); // Keep last 100 logs
}

/**
 * Get App Check verification logs
 * @returns Array of log entries
 */
export function getAppCheckLogs(): Record<string, unknown>[] {
  return JSON.parse(localStorage.getItem('appCheckLogs') || '[]');
}

/**
 * Clear App Check logs
 */
export function clearAppCheckLogs(): void {
  localStorage.removeItem('appCheckLogs');
}
