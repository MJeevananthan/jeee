// Firebase Configuration using compat SDK
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
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Configure Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Firebase Authentication Functions
window.firebaseAuth = {
    // Create user with email and password
    async createUser(email, password, displayName) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update user profile with display name
            await user.updateProfile({
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
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update last login time
            await this.updateUserDocument(user.uid, {
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
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
            const result = await auth.signInWithPopup(googleProvider);
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
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return { success: false, error: error.message };
        }
    },

    // Send password reset email
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Error sending password reset:', error);
            return { success: false, error: error.message };
        }
    },

    // Create user document in Firestore
    async createUserDocument(user, additionalData = {}) {
        if (!user) return;
        
        const userRef = db.collection('users').doc(user.uid);
        const userSnap = await userRef.get();
        
        if (!userSnap.exists) {
            const { displayName, email, photoURL } = user;
            const createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            try {
                await userRef.set({
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
            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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
        return auth.onAuthStateChanged(callback);
    }
};

// Firestore Database Functions
window.firebaseDB = {
    // Get user data
    async getUserData(userId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const userSnap = await userRef.get();
            
            if (userSnap.exists) {
                return { success: true, data: userSnap.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user data:', error);
            return { success: false, error: error.message };
        }
    }
};

console.log('Firebase initialized successfully!');