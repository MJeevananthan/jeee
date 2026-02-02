# Firebase Setup Instructions

## Firebase Console Configuration

### 1. Authentication Setup
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable the following providers:
   - **Email/Password**: Enable
   - **Google**: Enable (configure OAuth consent screen)

### 2. Firestore Database Setup
1. Go to Firebase Console → Firestore Database
2. Create database in **production mode**
3. Choose your preferred region
4. Deploy the security rules from `firestore.rules`

### 3. Security Rules Deployment
Copy the contents of `firestore.rules` to Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own trading signals
    match /tradingSignals/{signalId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Users can only access their own trade history
    match /tradeHistory/{tradeId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Users can only access their own price alerts
    match /priceAlerts/{alertId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Public market data (read-only for authenticated users)
    match /marketData/{document=**} {
      allow read: if request.auth != null;
    }
    
    // AI signals (read-only for authenticated users)
    match /aiSignals/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

### 4. Google OAuth Configuration
1. Go to Firebase Console → Authentication → Sign-in method → Google
2. Enable Google sign-in
3. Add your domain to authorized domains:
   - `localhost` (for development)
   - Your production domain

### 5. Web App Configuration
The Firebase configuration is already set up in `firebase-config.js` with your provided SDK details:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBLmis9YlRMTh81t3iDRXSUdFBETC2kU8A",
    authDomain: "ai-trade-1eb63.firebaseapp.com",
    projectId: "ai-trade-1eb63",
    storageBucket: "ai-trade-1eb63.firebasestorage.app",
    messagingSenderId: "598100431447",
    appId: "1:598100431447:web:ab0d837dff04e28b56c912",
    measurementId: "G-XTMQRF445K"
};
```

## Database Structure

### Users Collection (`/users/{userId}`)
```javascript
{
  displayName: "John Doe",
  email: "john@example.com",
  photoURL: "https://...",
  createdAt: timestamp,
  lastLoginAt: timestamp,
  portfolio: {
    balance: 25000.00,
    totalPnL: 1250.50,
    winRate: 73.2,
    totalTrades: 156
  },
  preferences: {
    riskLevel: "medium",
    notifications: true,
    newsletter: false
  }
}
```

### Trading Signals Collection (`/tradingSignals/{signalId}`)
```javascript
{
  userId: "user_uid",
  symbol: "AAPL",
  signalType: "BUY",
  entryPrice: 175.20,
  targetPrice: 182.50,
  stopLoss: 170.80,
  confidence: 92,
  reasoning: "Strong bullish momentum...",
  status: "active",
  createdAt: timestamp
}
```

### Trade History Collection (`/tradeHistory/{tradeId}`)
```javascript
{
  userId: "user_uid",
  signalId: "signal_id",
  symbol: "AAPL",
  tradeType: "BUY",
  entryPrice: 175.20,
  exitPrice: 180.50,
  quantity: 100,
  pnl: 530.00,
  status: "completed",
  executedAt: timestamp,
  createdAt: timestamp
}
```

### Price Alerts Collection (`/priceAlerts/{alertId}`)
```javascript
{
  userId: "user_uid",
  symbol: "AAPL",
  alertType: "price",
  condition: "above",
  targetPrice: 180.00,
  isActive: true,
  triggeredAt: null,
  createdAt: timestamp
}
```

## Security Features

1. **Authentication Required**: All database operations require user authentication
2. **User Isolation**: Users can only access their own data
3. **Data Validation**: Firestore rules validate data structure and ownership
4. **Secure Tokens**: Firebase handles JWT tokens automatically
5. **HTTPS Only**: All Firebase communications are encrypted

## Testing the Integration

1. **Sign Up**: Create a new account with email/password
2. **Google Sign In**: Test Google OAuth flow
3. **Data Persistence**: Verify user data is saved to Firestore
4. **Security**: Try accessing another user's data (should fail)
5. **Real-time Updates**: Test live data synchronization

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Add your domain to Firebase authorized domains
2. **Permission Denied**: Check Firestore security rules
3. **Google Sign-in Fails**: Verify OAuth configuration
4. **Module Import Errors**: Ensure Firebase SDK is properly installed

### Debug Steps:
1. Check browser console for errors
2. Verify Firebase project configuration
3. Test authentication state in browser dev tools
4. Check Firestore rules simulator in Firebase Console