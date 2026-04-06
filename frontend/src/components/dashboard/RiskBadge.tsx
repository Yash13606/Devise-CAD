import { Badge } from "@/components/ui/badge";

interface RiskBadgeProps {
  level: "low" | "medium" | "high";
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const styles = {
    low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
    medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15",
    high: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/15",
  };

  return (
    <Badge variant="outline" className={`text-[11px] font-medium capitalize ${styles[level]}`}>
      {level}
    </Badge>
  );
}
