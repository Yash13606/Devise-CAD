import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  type User 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { updateLastActive } from "@/services/api";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | MockUser | null;
  session: User | MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

// Mock user for demo mode
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isMock: true;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode flag - enable to bypass Firebase
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

interface AuthProviderProps {
  children: ReactNode;
}

// Demo user for when Firebase is not available
const DEMO_USER: MockUser = {
  uid: "demo-user-123",
  email: "demo@company.com",
  displayName: "Demo User",
  photoURL: null,
  emailVerified: true,
  isMock: true,
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // Demo mode - auto-login with mock user
      console.log("[Demo Mode] Using mock authentication");
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    // Real Firebase auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await updateLastActive();
        if (db) {
          const profileRef = doc(db, "profiles", firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            if (data.dark_mode !== undefined) {
              document.documentElement.classList.toggle("dark", data.dark_mode);
              localStorage.setItem("theme", data.dark_mode ? "dark" : "light");
            }
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return { error: null };
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (DEMO_MODE) {
      setUser({ ...DEMO_USER, email, displayName: fullName || email.split('@')[0] });
      return { error: null };
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (fullName && user) {
        await updateProfile(user, { displayName: fullName });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null);
      return;
    }
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session: user,
      loading, 
      signIn, 
      signUp, 
      signOut,
      isDemoMode: DEMO_MODE 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
