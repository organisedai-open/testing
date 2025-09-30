// Firebase initialization for the web app
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, getToken, type AppCheck } from "firebase/app-check";


// Validate that all required environment variables are present
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check for missing environment variables (blocking)
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
    'Please check your environment variables and ensure all VITE_FIREBASE_* variables are set.'
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId,
  measurementId: requiredEnvVars.measurementId,
};

export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3
const appCheck: AppCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true
});

// App Check verification function
export const verifyAppCheckToken = async (): Promise<boolean> => {
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


