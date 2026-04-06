import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "primary";
}

export function StatsCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatsCardProps) {
  const isPrimary = variant === "primary";

  return (
    <Card className={isPrimary ? "bg-primary text-primary-foreground border-primary" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={`text-xs font-medium uppercase tracking-wide ${isPrimary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className={`text-xs ${isPrimary ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPrimary ? "bg-primary-foreground/20" : "bg-secondary"}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
