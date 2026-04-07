import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Loader2, UserPlus, ShieldIcon, Activity, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

export function SignupPage() {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      await signUp();
    } catch (err) {
      console.error("Signup redirect failed", err);
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
        <div className="absolute top-0 left-0 p-8 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-lg bg-[#FF5C1A] flex items-center justify-center p-1.5 shadow-lg shadow-orange-500/20">
            <ShieldIcon className="text-white fill-white" size={16} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Devise</span>
        </div>

        {/* Branding Message */}
        <div className="absolute bottom-20 left-12 right-12 z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Stop Shadow AI before it starts.
          </h2>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <Activity className="text-[#FF5C1A]" size={24} />
              <div>
                <p className="text-sm font-bold text-white">Real-time Visibility</p>
                <p className="text-xs text-white/50">Continuous monitoring of all LLM usage across your workforce.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <Sparkles className="text-[#FF5C1A]" size={24} />
              <div>
                <p className="text-sm font-bold text-white">Advanced Risk Detection</p>
                <p className="text-xs text-white/50">Automatically identify sensitive data exposure and financial leaks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-white flex flex-col items-center justify-center px-8 md:px-16 lg:px-20 relative overflow-y-auto">
        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 z-10"
        >
          <ChevronLeft className="w-3 h-3" />
          Back to home
        </Link>

        {/* FORM CONTAINER */}
        <div className="max-w-md w-full flex flex-col items-center">
          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-[#FF5C1A] flex items-center justify-center p-1.5">
              <ShieldIcon className="text-white fill-white" size={16} />
            </div>
            <span className="text-[#1A1A1A] font-bold text-lg">Devise</span>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight">Create your domain</h1>
            <p className="text-gray-500 max-w-xs mx-auto">
              Join 500+ enterprises securing their AI operations with Devise.
            </p>
          </div>

          <div className="w-full space-y-6">
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-[#FF5C1A] text-white rounded-2xl py-4 font-semibold text-base shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-orange-500/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {loading ? "Preparing your account..." : "Start Free with Auth0"}
            </button>

            <div className="flex flex-col gap-4">
              <p className="text-center text-[11px] text-gray-400 leading-relaxed px-6 font-medium">
                By clicking "Start Free", you will be redirected to our secure Auth0 registration portal.
              </p>
              <div className="flex items-center gap-3 justify-center pt-2">
                <span className="h-px w-8 bg-gray-100" />
                <span className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">Certified Operations</span>
                <span className="h-px w-8 bg-gray-100" />
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Already have a Devise account?
              <Link to="/login" className="text-[#FF5C1A] font-semibold hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 flex items-center gap-6 text-[10px] text-gray-300 font-bold uppercase tracking-wider">
          <span>Enterprise Protocol</span>
          <span className="h-1 w-1 rounded-full bg-gray-200" />
          <span>Infinite Scale</span>
          <span className="h-1 w-1 rounded-full bg-gray-200" />
          <span>Zero-Trust</span>
        </div>
      </div>
    </div>
  );
}
