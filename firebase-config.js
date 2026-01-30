// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBLmis9YlRMTh81t3iDRXSUdFBETC2kU8A",
    authDomain: "ai-trade-1eb63.firebaseapp.com",
    projectId: "ai-trade-1eb63",
    storageBucket: "ai-trade-1eb63.firebasestorage.app",
    messagingSenderId: "598100431447",
    appId: "1:598100431447:web:ab0d837dff04e28b56c912",
    measurementId: "G-XTMQRF445K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Firebase Authentication Functions
export const firebaseAuth = {
    // Create user with email and password
    async createUser(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update user profile with display name
            await updateProfile(user, {
                displayName: displayName
            });
            
            // Create user document in Firestore
            await this.createUserDocument(user, { displayName });
            
            return { success: true, user };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign in with email and password
    async signInUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update last login time
            await this.updateUserDocument(user.uid, {
                lastLoginAt: serverTimestamp()
            });
            
            return { success: true, user };
        } catch (error) {
            console.error('Error signing in:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Create or update user document
            await this.createUserDocument(user);
            
            return { success: true, user };
        } catch (error) {
            console.error('Error with Google sign in:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign out user
    async signOutUser() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return { success: false, error: error.message };
        }
    },

    // Send password reset email
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Error sending password reset:', error);
            return { success: false, error: error.message };
        }
    },

    // Create user document in Firestore
    async createUserDocument(user, additionalData = {}) {
        if (!user) return;
        
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            const { displayName, email, photoURL } = user;
            const createdAt = serverTimestamp();
            
            try {
                await setDoc(userRef, {
                    displayName: displayName || additionalData.displayName || email.split('@')[0],
                    email,
                    photoURL: photoURL || null,
                    createdAt,
                    lastLoginAt: createdAt,
                    portfolio: {
                        balance: 25000.00,
                        totalPnL: 0,
                        winRate: 0,
                        totalTrades: 0
                    },
                    preferences: {
                        riskLevel: 'medium',
                        notifications: true,
                        newsletter: additionalData.newsletter || false
                    },
                    ...additionalData
                });
            } catch (error) {
                console.error('Error creating user document:', error);
            }
        }
        
        return userRef;
    },

    // Update user document
    async updateUserDocument(userId, data) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user document:', error);
            return { success: false, error: error.message };
        }
    },

    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    },

    // Listen to auth state changes
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, callback);
    }
};

// Firestore Database Functions
export const firebaseDB = {
    // Get user data
    async getUserData(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                return { success: true, data: userSnap.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user data:', error);
            return { success: false, error: error.message };
        }
    },

    // Add trading signal
    async addTradingSignal(userId, signalData) {
        try {
            const signalsRef = collection(db, 'tradingSignals');
            const docRef = await addDoc(signalsRef, {
                userId,
                ...signalData,
                createdAt: serverTimestamp()
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding trading signal:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user's trading signals
    async getUserSignals(userId) {
        try {
            const signalsRef = collection(db, 'tradingSignals');
            const q = query(
                signalsRef, 
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const signals = [];
            
            querySnapshot.forEach((doc) => {
                signals.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: signals };
        } catch (error) {
            console.error('Error getting user signals:', error);
            return { success: false, error: error.message };
        }
    },

    // Add trade history
    async addTradeHistory(userId, tradeData) {
        try {
            const tradesRef = collection(db, 'tradeHistory');
            const docRef = await addDoc(tradesRef, {
                userId,
                ...tradeData,
                createdAt: serverTimestamp()
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding trade history:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user's trade history
    async getUserTradeHistory(userId) {
        try {
            const tradesRef = collection(db, 'tradeHistory');
            const q = query(
                tradesRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const trades = [];
            
            querySnapshot.forEach((doc) => {
                trades.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: trades };
        } catch (error) {
            console.error('Error getting trade history:', error);
            return { success: false, error: error.message };
        }
    },

    // Add price alert
    async addPriceAlert(userId, alertData) {
        try {
            const alertsRef = collection(db, 'priceAlerts');
            const docRef = await addDoc(alertsRef, {
                userId,
                ...alertData,
                isActive: true,
                createdAt: serverTimestamp()
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding price alert:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user's price alerts
    async getUserAlerts(userId) {
        try {
            const alertsRef = collection(db, 'priceAlerts');
            const q = query(
                alertsRef,
                where('userId', '==', userId),
                where('isActive', '==', true),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const alerts = [];
            
            querySnapshot.forEach((doc) => {
                alerts.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: alerts };
        } catch (error) {
            console.error('Error getting user alerts:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export Firebase instances
export { auth, db, analytics };
export default app;