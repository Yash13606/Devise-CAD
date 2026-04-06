import { AlertTriangle } from "lucide-react";

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div 
        className="bg-white flex flex-col relative items-center text-center p-8"
        style={{ width: "100%", maxWidth: 400, borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}
      >
        <div 
          className="flex items-center justify-center rounded-full mb-4"
          style={{ width: 48, height: 48, backgroundColor: "#FEF2F2" }}
        >
          <AlertTriangle size={24} color="#DC2626" />
        </div>
        
        <h2 className="mb-2" style={{ fontSize: 18, fontWeight: 600, color: "#1A1A2E", fontFamily: "Inter, sans-serif" }}>
          Are you sure you want to sign out?
        </h2>
        <p className="mb-8" style={{ fontSize: 14, color: "#64748B", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
          You will be returned to the login screen and will need to enter your credentials to access the dashboard again.
        </p>

        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose}
            className="flex-1 transition-colors hover:bg-[#F8FAFC]"
            style={{ 
              padding: "10px 16px", borderRadius: 8, fontSize: 14, 
              fontWeight: 500, color: "#475569", fontFamily: "Inter, sans-serif",
              backgroundColor: "#F1F5F9",
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 transition-all hover:-translate-y-[1px]"
            style={{ 
              backgroundColor: "#DC2626", color: "white", padding: "10px 16px", borderRadius: 8, 
              fontSize: 14, fontWeight: 500, fontFamily: "Inter, sans-serif",
              boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#B91C1C"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#DC2626"}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
