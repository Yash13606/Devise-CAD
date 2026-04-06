import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ShieldAlert, Bell, Activity, Monitor } from "lucide-react";

import { NotificationItem } from "./TopBar";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNotificationClick: (id: number) => void;
  unreadCount?: number;
}

export function NotificationDropdown({
  isOpen, 
  onClose,
  notifications,
  onMarkAllRead,
  onNotificationClick,
  unreadCount = 0
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", `Unread (${unreadCount})`, "Alerts", "System"];

  const filteredNotifs = notifications.filter((notif) => {
    if (activeTab.startsWith("Unread")) return notif.unread;
    if (activeTab === "Alerts") return notif.category === "Alerts";
    if (activeTab === "System") return notif.category === "System";
    return true; // "All"
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white flex flex-col z-50 overflow-hidden"
      style={{
        top: 56,
        right: 0,
        width: 380,
        borderRadius: 16,
        border: "1px solid #F0F2F5",
        boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 16,
            color: "#1A1A2E",
          }}
        >
          Notifications
        </span>
        <button
          onClick={onMarkAllRead}
          style={{
            background: "none",
            border: "none",
            color: "#FF5C1A",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Mark all read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 px-4 border-b border-[#F0F2F5]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-2 transition-colors relative"
              style={{
                background: "none",
                border: "none",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#1A1A2E" : "#94A3B8",
                cursor: "pointer",
              }}
            >
              {tab}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t"
                  style={{ height: 2, backgroundColor: "#FF5C1A" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Notification Items */}
      <div 
        className="flex flex-col overflow-y-auto" 
        style={{ 
          maxHeight: 400,
          // Custom scrollbar styles
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent" 
        }}
      >
        {filteredNotifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <span style={{ fontSize: 13 }}>No notifications here</span>
          </div>
        )}
        {filteredNotifs.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onNotificationClick(notif.id)}
            className="flex items-start transition-colors cursor-pointer"
            style={{
              padding: "12px 16px",
              gap: 12,
              opacity: notif.unread ? 1 : 0.7,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {/* Left Icon Block */}
            <div className="relative shrink-0 mt-0.5">
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 36, height: 36, backgroundColor: notif.iconBg }}
              >
                <notif.icon size={16} color="#ffffff" strokeWidth={2} />
              </div>
              {notif.unread && (
                <div
                  className="absolute"
                  style={{
                    top: 0,
                    right: 0,
                    width: 6,
                    height: 6,
                    backgroundColor: "#FF5C1A",
                    borderRadius: "50%",
                  }}
                />
              )}
            </div>

            {/* Right Content Block & Time */}
            <div className="flex flex-col flex-1 min-w-0 pr-2 pb-0.5">
              <div className="flex justify-between items-start gap-2">
                <span
                  className="truncate"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#1A1A2E",
                    lineHeight: 1.4,
                  }}
                >
                  {notif.title}
                </span>
                <span
                  className="shrink-0"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: "#C0C8D4",
                    lineHeight: 1.4,
                  }}
                >
                  {notif.time}
                </span>
              </div>
              <span
                className="truncate w-full mt-0.5"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#94A3B8",
                  lineHeight: 1.4,
                }}
              >
                {notif.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-center border-t border-[#F0F2F5]"
        style={{ padding: "12px 16px" }}
      >
        <button
          className="flex items-center justify-center"
          style={{
            background: "none",
            border: "none",
            color: "#FF5C1A",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          View all alerts &rarr;
        </button>
      </div>
    </div>
  );
}
