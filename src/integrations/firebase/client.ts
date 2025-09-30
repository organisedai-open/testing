// Firebase initialization for the web app
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, getToken, type AppCheck } from "firebase/app-check";

// Get environment variables with fallbacks for build time
const envVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Function to validate environment variables at runtime (only when actually needed)
function validateEnvironmentVariables() {
  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
      'Please check your environment variables and ensure all VITE_FIREBASE_* variables are set.'
    );
  }
}

const firebaseConfig = {
  apiKey: envVars.apiKey,
  authDomain: envVars.authDomain,
  projectId: envVars.projectId,
  storageBucket: envVars.storageBucket,
  messagingSenderId: envVars.messagingSenderId,
  appId: envVars.appId,
  measurementId: envVars.measurementId,
};

export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const appCheck: AppCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(recaptchaSiteKey),
  isTokenAutoRefreshEnabled: true
});

// App Check verification function
export const verifyAppCheckToken = async (): Promise<boolean> => {
  // Validate environment variables at runtime
  validateEnvironmentVariables();
  
  if (!recaptchaSiteKey) {
    throw new Error('Missing required environment variable: VITE_RECAPTCHA_SITE_KEY');
  }
  
  try {
    const token = await getToken(appCheck);
    return !!token.token;
  } catch (error) {
    return false;
  }
};

// App Check enforcement function for Firestore operations
export const enforceAppCheck = async (): Promise<void> => {
  const isValid = await verifyAppCheckToken();
  if (!isValid) {
    throw new Error('App Check verification failed. Unauthorized access blocked.');
  }
};

// Export App Check for use in other components
export { appCheck, getToken };

export const db: Firestore = getFirestore(app);


