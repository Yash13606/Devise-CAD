import { Outlet } from "react-router-dom";
import { MCPSidebar } from "./MCPSidebar";
import { MCPTopBar } from "./MCPTopBar";

/**
 * MCPShell — Root layout wrapper for the Devise Gate MCP Dashboard.
 * Mirrors the DashboardLayout pattern from Devise Eye with:
 *   • Gray outer background with rounded white card container
 *   • Left sidebar (MCPSidebar) — 260px wide
 *   • Top bar (MCPTopBar)
 *   • Main content area rendered via <Outlet />
 */
export function MCPShell() {
  return (
    <div
      className="min-h-screen w-full flex items-stretch"
      style={{ backgroundColor: "#F0F2F5", padding: 24 }}
    >
      {/* White card — the entire app container */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          minHeight: "calc(100vh - 48px)",
        }}
      >
        {/* Left sidebar */}
        <MCPSidebar />

        {/* Right column: TopBar + Main content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top bar */}
          <MCPTopBar />

          {/* Main content — routed pages rendered here */}
          <main
            className="flex-1 overflow-auto"
            style={{ padding: 24, backgroundColor: "#FAFBFC" }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
