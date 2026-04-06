import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  category: string;
}

const categoryColors: Record<string, string> = {
  chat: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  coding: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  api: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  image: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/20",
  audio: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  video: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  search: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20",
  productivity: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`text-[11px] font-medium capitalize ${categoryColors[category] || "bg-secondary text-secondary-foreground"} hover:bg-opacity-100`}
    >
      {category}
    </Badge>
  );
}
