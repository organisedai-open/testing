// Firebase configuration - secure approach
import { config, validateConfig } from './env';

export const firebaseConfig = config.firebase;
export const recaptchaSiteKey = config.recaptcha.siteKey;

// Runtime validation function
export function validateFirebaseConfig() {
  return validateConfig();
}
