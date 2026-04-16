import { Routes, Route, Navigate } from "react-router-dom";
import { MCPShell } from "./layout/MCPShell";
import {
  MCPOverviewPage,
  MCPRegistryPage,
  MCPCallsPage,
  MCPThreatLogPage,
  MCPIdentityPage,
  MCPAnalyticsPage,
  MCPPoliciesPage,
  MCPAlertsPage,
  MCPSettingsPage,
} from "./pages";

/**
 * MCPRouter — All routes for the Devise Gate MCP Dashboard.
 *
 * This is rendered as a child of the main App router at /mcp/*.
 * MCPShell provides the sidebar + topbar layout; each page
 * is rendered inside the <Outlet /> of MCPShell.
 */
export function MCPRouter() {
  return (
    <Routes>
      <Route element={<MCPShell />}>
        {/* Overview (index route) */}
        <Route index element={<MCPOverviewPage />} />

        {/* Control */}
        <Route path="registry" element={<MCPRegistryPage />} />
        <Route path="calls" element={<MCPCallsPage />} />

        {/* Security */}
        <Route path="threats" element={<MCPThreatLogPage />} />
        <Route path="alerts" element={<MCPAlertsPage />} />

        {/* Access */}
        <Route path="identity" element={<MCPIdentityPage />} />
        <Route path="policies" element={<MCPPoliciesPage />} />

        {/* Insights */}
        <Route path="analytics" element={<MCPAnalyticsPage />} />

        {/* Settings */}
        <Route path="settings" element={<MCPSettingsPage />} />

        {/* Catch-all → redirect to overview */}
        <Route path="*" element={<Navigate to="/mcp" replace />} />
      </Route>
    </Routes>
  );
}
