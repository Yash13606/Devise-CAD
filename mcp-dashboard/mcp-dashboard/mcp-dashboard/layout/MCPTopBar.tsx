import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// ─── Component ───────────────────────────────────────────────────────────────

export function MCPTopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // TODO: Replace with TanStack query hook → GET /api/mcp/alerts/unread-count
  const unreadAlertCount = 5;

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: 64,
        borderBottom: "1px solid #F0F2F5",
        backgroundColor: "#ffffff",
      }}
    >
      {/* ── Left: Page context / Breadcrumb area ───────────────── */}
      <div className="flex flex-col justify-center min-w-[200px]">
        <span
          className="font-display font-bold leading-tight"
          style={{ fontSize: 20, color: "#1A1A2E" }}
        >
          Devise Gate
        </span>
        <span
          className="leading-tight mt-0.5"
          style={{ fontSize: 12, color: "#94A3B8" }}
        >
          Enterprise MCP Gateway Governance
        </span>
      </div>

      {/* ── Right: Search + Alerts + Profile ───────────────────── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        {searchOpen ? (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#94A3B8" }}
              />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search calls, servers, users…"
                className="pl-9 pr-3 py-1.5 w-[280px] text-sm rounded-lg"
                style={{
                  height: 36,
                  backgroundColor: "#F5F7FA",
                  border: "1px solid #E5E7EB",
                }}
                autoFocus
              />
            </div>
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchValue("");
              }}
              className="flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              style={{ width: 32, height: 32, color: "#94A3B8" }}
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-[#F5F7FA]"
            style={{ width: 36, height: 36, color: "#94A3B8" }}
            aria-label="Open search"
          >
            <Search size={18} strokeWidth={2} />
          </button>
        )}

        {/* Alerts bell */}
        <button
          className="relative flex items-center justify-center rounded-lg transition-colors hover:bg-[#F5F7FA]"
          style={{ width: 36, height: 36, color: "#94A3B8" }}
          aria-label="Alerts"
        >
          <Bell size={18} strokeWidth={2} />
          {unreadAlertCount > 0 && (
            <span
              className="absolute flex items-center justify-center rounded-full text-white font-bold"
              style={{
                top: 4,
                right: 3,
                minWidth: 16,
                height: 16,
                fontSize: 9,
                padding: "0 4px",
                backgroundColor: "#DC2626",
              }}
            >
              {unreadAlertCount}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            height: 28,
            backgroundColor: "#F0F2F5",
            margin: "0 4px",
          }}
        />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F8FAFC] outline-none"
              style={{ cursor: "pointer" }}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-white font-semibold text-xs"
                  style={{ backgroundColor: "#FF5C1A" }}
                >
                  YS
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span
                  className="font-semibold"
                  style={{ fontSize: 13, color: "#1A1A2E", lineHeight: 1.2 }}
                >
                  Yash Sharma
                </span>
                <span style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.2 }}>
                  Admin
                </span>
              </div>
              <ChevronDown size={14} style={{ color: "#94A3B8", marginLeft: 2 }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>My Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
