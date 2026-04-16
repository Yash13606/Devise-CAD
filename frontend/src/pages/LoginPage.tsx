import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Loader2, LogIn, ShieldCheck, Globe } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn();
    } catch (err) {
      console.error("Login redirect failed", err);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT PANEL */}
      <div className="hidden lg:block relative overflow-hidden bg-[#0A0E1A]">
        {/* Background Image */}
        <img
          src="/src/assets/login-image.png"
          alt="Premium background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        {/* TOP LEFT RECTANGLE LOGO */}
        <div className="absolute top-0 left-0 p-8 z-10">
          <img 
            src="/src/assets/logo.svg" 
            alt="Devise Logo" 
            className="h-12 w-auto object-contain drop-shadow-lg" 
          />
        </div>

        {/* Branding Message */}
        <div className="absolute bottom-20 left-12 right-12 z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Secure your AI-powered workspace.
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white/70">
              <ShieldCheck className="text-[#F04E23]" size={20} />
              <span className="text-sm font-medium">Enterprise-grade identity protection</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <Globe className="text-[#F04E23]" size={20} />
              <span className="text-sm font-medium">Centralized oversight for global teams</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-white flex flex-col items-center justify-center px-8 md:px-16 lg:px-20 relative">
        {/* BACK TO HOME (MOBILE) */}
        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 z-10 lg:ml-0"
        >
          <ChevronLeft className="w-3 h-3" />
          Back to home
        </Link>

        {/* FORM CONTAINER */}
        <div className="max-w-md w-full flex flex-col items-center">
          {/* MOBILE LOGO */}
          <img 
            src="/src/assets/logo.svg" 
            alt="Devise Logo" 
            className="h-10 w-auto object-contain mb-12" 
          />

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight">Welcome to Devise</h1>
            <p className="text-gray-500 max-w-xs mx-auto">
              Please sign in to access your secure AI dashboard.
            </p>
          </div>

          <div className="w-full space-y-6">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#F04E23] text-white rounded-2xl py-4 font-semibold text-base shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-orange-500/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? "Redirecting..." : "Sign In to Portal"}
            </button>

            <div className="flex flex-col gap-4">
              <p className="text-center text-xs text-gray-400 leading-relaxed px-8 font-medium">
                Identity and access management is securely handled via Auth0 for enterprise compliance.
              </p>
              <div className="flex items-center gap-4 justify-center pt-2">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  <ShieldCheck size={10} className="text-green-500" />
                  SOC2
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  <ShieldCheck size={10} className="text-blue-500" />
                  GDPR
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account yet?
              <Link to="/signup" className="text-[#F04E23] font-semibold hover:underline ml-1">
                Get Started
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 text-[10px] text-gray-300 font-medium">
          Powered by Devise Shield&trade; Technology
        </div>
      </div>
    </div>
  );
}
