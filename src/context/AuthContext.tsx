import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  reload,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import { UserProfile, DualWallet, ActiveWorkspace } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  wallet: DualWallet | null;
  loading: boolean;
  isAdmin: boolean;
  activeRole: ActiveWorkspace;
  switchActiveRole: (role: ActiveWorkspace) => Promise<void>;
  refreshUser: () => Promise<void>;
  sendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  wallet: null,
  loading: true,
  isAdmin: false,
  activeRole: 'freelancer',
  switchActiveRole: async () => {},
  refreshUser: async () => {},
  sendVerification: async () => {},
  logout: async () => {},
  refreshWallet: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<DualWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<ActiveWorkspace>('freelancer');

  const adminUid = 'YG8glv1gg4XXYUkSUMZtyBcT1fu2';
  const adminEmail = 'mrs.engineers.bd26@gmail.com';
  const isAdmin =
    currentUser?.uid === adminUid ||
    currentUser?.email?.toLowerCase() === adminEmail.toLowerCase() ||
    profile?.role === 'admin';

  // Initialize or fetch user profile & dual-wallet
  const syncUserData = useCallback(async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const now = new Date().toISOString();
      const isOwnerAdmin =
        user.uid === adminUid || user.email?.toLowerCase() === adminEmail.toLowerCase();

      if (!userSnap.exists()) {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || '',
          role: isOwnerAdmin ? 'admin' : 'user',
          activeRole: isOwnerAdmin ? 'admin' : 'freelancer',
          isVerified: user.emailVerified || isOwnerAdmin,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
        setActiveRole(newProfile.activeRole);
      } else {
        const data = userSnap.data() as UserProfile;
        // Update isVerified if Firebase Auth shows verified
        if (user.emailVerified && !data.isVerified) {
          await updateDoc(userRef, { isVerified: true, updatedAt: now });
          data.isVerified = true;
        }
        setProfile(data);
        setActiveRole(data.activeRole || 'freelancer');
      }

      // Sync Dual Wallet
      const walletRef = doc(db, 'wallets', user.uid);
      const walletSnap = await getDoc(walletRef);
      if (!walletSnap.exists()) {
        const newWallet: DualWallet = {
          userId: user.uid,
          clientDepositBalance: 0,
          clientReservedBalance: 0,
          totalDeposited: 0,
          totalSpent: 0,
          freelancerEarningsBalance: 0,
          freelancerPendingWithdrawal: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          updatedAt: now,
        };
        await setDoc(walletRef, newWallet);
        setWallet(newWallet);
      } else {
        setWallet(walletSnap.data() as DualWallet);
      }
    } catch (err) {
      console.error('Failed to sync user data in Firestore:', err);
    }
  }, [adminEmail]);

  // Auth listener
  useEffect(() => {
    // Run connection test once
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserData(user);
      } else {
        setProfile(null);
        setWallet(null);
        setActiveRole('freelancer');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserData]);

  // Real-time wallet updates listener
  useEffect(() => {
    if (!currentUser) return;
    const walletRef = doc(db, 'wallets', currentUser.uid);
    const unsub = onSnapshot(
      walletRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setWallet(docSnap.data() as DualWallet);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `wallets/${currentUser.uid}`);
      }
    );
    return () => unsub();
  }, [currentUser]);

  const switchActiveRole = async (role: ActiveWorkspace) => {
    setActiveRole(role);
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { activeRole: role, updatedAt: new Date().toISOString() });
        setProfile(prev => prev ? { ...prev, activeRole: role } : null);
      } catch (e) {
        console.warn('Could not update activeRole in Firestore:', e);
      }
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setCurrentUser(auth.currentUser);
      await syncUserData(auth.currentUser);
    }
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setProfile(null);
    setWallet(null);
    setActiveRole('freelancer');
  };

  const refreshWallet = async () => {
    if (currentUser) {
      const walletRef = doc(db, 'wallets', currentUser.uid);
      const snap = await getDoc(walletRef);
      if (snap.exists()) {
        setWallet(snap.data() as DualWallet);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        wallet,
        loading,
        isAdmin,
        activeRole,
        switchActiveRole,
        refreshUser,
        sendVerification,
        logout,
        refreshWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
