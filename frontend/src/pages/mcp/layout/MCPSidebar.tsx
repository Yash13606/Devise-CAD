import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  Activity,
  Clock,
  Bell,
  KeyRound,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Navigation items ────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  matchExact?: boolean;
}

interface NavSection {
  title: string | null;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [
      { label: "Overview", path: "/mcp", icon: LayoutDashboard, matchExact: true },
    ],
  },
  {
    title: "CONTROL",
    items: [
      { label: "MCP Registry", path: "/mcp/registry", icon: Server },
      { label: "Calls Log", path: "/mcp/calls", icon: Activity },
      { label: "Human Queue", path: "/mcp/calls?tab=queue", icon: Clock, badge: 3 },
    ],
  },
  {
    title: "SECURITY",
    items: [
      { label: "Threat Log", path: "/mcp/threats", icon: Shield },
      { label: "Alerts", path: "/mcp/alerts", icon: Bell, badge: 5 },
    ],
  },
  {
    title: "ACCESS",
    items: [
      { label: "Identity & SSO", path: "/mcp/identity", icon: KeyRound },
      { label: "Policies", path: "/mcp/policies", icon: FileText },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { label: "Analytics", path: "/mcp/analytics", icon: BarChart2 },
    ],
  },
];

const BOTTOM_NAV: NavItem = {
  label: "Settings",
  path: "/mcp/settings",
  icon: Settings,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function MCPSidebar() {
  const location = useLocation();

  const isActive = (item: NavItem): boolean => {
    // special case for the human queue link with query param
    if (item.path.includes("?tab=queue")) {
      return location.pathname === "/mcp/calls" && location.search.includes("tab=queue");
    }
    if (item.matchExact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path) && !location.search.includes("tab=queue");
  };

  return (
    <aside
      className="flex flex-col h-full select-none"
      style={{
        width: 260,
        minWidth: 260,
        backgroundColor: "#FAFBFC",
        borderRight: "1px solid #F0F2F5",
      }}
    >
      {/* ── Logo ────────────────────────────────────────────────── */}
      <div className="flex flex-col px-5 pt-6 pb-2">
        <Link to="/mcp" className="flex items-center gap-3 group">
          <img 
            src="/src/assets/logo.svg" 
            alt="Devise Logo" 
            className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" 
          />
          <div className="flex flex-col">
            <span
              className="font-display font-extrabold tracking-tight leading-none"
              style={{ fontSize: 16, color: "#FF5C1A" }}
            >
              DEVISE
            </span>
            <span
              className="leading-none"
              style={{ fontSize: 10, color: "#94A3B8", letterSpacing: "0.08em", fontWeight: 500 }}
            >
              MCP Control
            </span>
          </div>
        </Link>
      </div>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-3 flex flex-col gap-1">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={sectionIdx} className="flex flex-col">
            {/* Section divider */}
            {section.title && (
              <>
                <div className="mx-2 my-2" style={{ height: 1, backgroundColor: "#F0F2F5" }} />
                <span
                  className="px-3 pt-2 pb-1 uppercase font-semibold tracking-widest"
                  style={{ fontSize: 10, color: "#94A3B8", letterSpacing: "0.1em" }}
                >
                  {section.title}
                </span>
              </>
            )}

            {/* Items */}
            {section.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative group",
                    active
                      ? "text-[#FF5C1A] bg-[#FFF3EE]"
                      : "text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#F5F7FA]"
                  )}
                  style={{
                    borderLeft: active ? "3px solid #FF5C1A" : "3px solid transparent",
                    marginLeft: -3,
                    paddingLeft: 12,
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className="flex items-center justify-center rounded-full text-white text-[10px] font-bold"
                      style={{
                        minWidth: 20,
                        height: 20,
                        padding: "0 6px",
                        backgroundColor: "#FF5C1A",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="mx-2 my-2" style={{ height: 1, backgroundColor: "#F0F2F5" }} />

        {/* Settings */}
        {(() => {
          const active = location.pathname.startsWith(BOTTOM_NAV.path);
          const Icon = BOTTOM_NAV.icon;
          return (
            <Link
              to={BOTTOM_NAV.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "text-[#FF5C1A] bg-[#FFF3EE]"
                  : "text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#F5F7FA]"
              )}
              style={{
                borderLeft: active ? "3px solid #FF5C1A" : "3px solid transparent",
                marginLeft: -3,
                paddingLeft: 12,
              }}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span>{BOTTOM_NAV.label}</span>
            </Link>
          );
        })()}
      </nav>

      {/* ── Footer: Gateway status + User ───────────────────────── */}
      <div
        className="flex flex-col gap-3 px-4 pb-5 pt-3"
        style={{ borderTop: "1px solid #F0F2F5" }}
      >
        {/* Gateway status */}
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded-full"
            style={{ width: 8, height: 8, backgroundColor: "#16A34A", flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
            Gateway Online
          </span>
          <span
            className="ml-auto"
            style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}
          >
            8ms
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback
              className="text-white font-semibold text-xs"
              style={{ backgroundColor: "#FF5C1A" }}
            >
              YS
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span
              className="font-semibold truncate"
              style={{ fontSize: 13, color: "#1A1A2E", lineHeight: 1.2 }}
            >
              Yash Sharma
            </span>
            <span
              className="truncate"
              style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.2 }}
            >
              Admin
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex items-center justify-center rounded-md transition-colors hover:bg-red-50"
                style={{ width: 28, height: 28, color: "#94A3B8" }}
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Sign out
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
