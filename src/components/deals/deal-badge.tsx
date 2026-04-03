import { Badge } from "@/components/ui/badge";
import type { DealScoreBand } from "@/services/deal-score.service";

interface DealBadgeProps {
  dealScoreBand: DealScoreBand;
  dealScore: number;
  className?: string;
}

export function DealBadge({ dealScoreBand, dealScore, className }: DealBadgeProps) {
  if (!dealScoreBand) return null;

  const percent = Math.round(dealScore);

  const config: Record<
    NonNullable<DealScoreBand>,
    { variant: "danger" | "nimbus" | "success"; label: string }
  > = {
    FIRE: { variant: "danger", label: `🔥 ${percent}% below market` },
    GREAT: { variant: "nimbus", label: `🔥 ${percent}% below market` },
    GOOD: { variant: "success", label: `🔥 ${percent}% below market` },
  };

  const { variant, label } = config[dealScoreBand];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
