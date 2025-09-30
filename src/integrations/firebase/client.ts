// Firebase initialization for the web app
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, getToken, type AppCheck } from "firebase/app-check";
import { firebaseConfig, recaptchaSiteKey, validateFirebaseConfig } from "@/config/firebase-config";

export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3
const appCheck: AppCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(recaptchaSiteKey),
  isTokenAutoRefreshEnabled: true
});

// App Check verification function
export const verifyAppCheckToken = async (): Promise<boolean> => {
  // Validate configuration at runtime
  validateFirebaseConfig();
  
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


