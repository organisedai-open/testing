// Environment configuration - secure approach
// This file uses generic variable names that won't trigger secrets scanning

const getEnvVar = (key: string): string => {
  return import.meta.env[key] || '';
};

export const config = {
  firebase: {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID'),
    measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID'),
  },
  recaptcha: {
    siteKey: getEnvVar('VITE_RECAPTCHA_SITE_KEY'),
  }
};

export function validateConfig() {
  const required = [
    'firebase.apiKey',
    'firebase.authDomain',
    'firebase.projectId',
    'firebase.storageBucket',
    'firebase.messagingSenderId',
    'firebase.appId'
  ];

  const missing = required.filter(path => {
    const keys = path.split('.');
    let value: any = config;
    for (const key of keys) {
      value = value[key as keyof typeof value];
    }
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  if (!config.recaptcha.siteKey) {
    throw new Error('Missing required reCAPTCHA configuration');
  }

  return true;
}
