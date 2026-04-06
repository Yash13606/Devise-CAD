/**
 * Firebase stub - Devise now operates locally without cloud auth
 * These exports are retained for frontend compatibility but are no-ops
 */

// Stub auth object for LoginPage/AccountSettingsPanel compatibility
export const auth = {
  currentUser: null,
};

// Stub db object for AuthContext compatibility  
export const db = null;

// Re-export auth functions as no-ops for AccountSettingsPanel
export const updateProfile = async () => {};
export const sendPasswordResetEmail = async () => {};
