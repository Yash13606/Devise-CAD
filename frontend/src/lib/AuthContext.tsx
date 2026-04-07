import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthUser | null;
  loading: boolean;
  signIn: () => void;
  signUp: () => void;
  signOut: () => Promise<void>;
  isDemoMode: false;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user: auth0User,
    isLoading,
    loginWithRedirect,
    logout,
  } = useAuth0();

  // Map Auth0 user to the shape the rest of the app expects
  const user: AuthUser | null = auth0User
    ? {
        uid: auth0User.sub ?? "",
        email: auth0User.email ?? null,
        displayName: auth0User.name ?? auth0User.nickname ?? null,
        photoURL: auth0User.picture ?? null,
      }
    : null;

  const signIn = () => {
    loginWithRedirect();
  };

  const signUp = () => {
    loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });
  };

  const signOut = async () => {
    logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user,
        loading: isLoading,
        signIn,
        signUp,
        signOut,
        isDemoMode: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
