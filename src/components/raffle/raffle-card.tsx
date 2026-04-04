import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "./progress-bar";
import { CountdownTimer } from "./countdown-timer";
import { RaffleStatus } from "@prisma/client";

interface RaffleCardProps {
  id: string;
  title: string;
  prizeImages: string[];
  prizeValue: number;
  ticketPrice: number;
  totalSlots: number;
  filledSlots: number;
  endsAt: Date | string;
  status: RaffleStatus;
}

function statusVariant(
  status: RaffleStatus
): "default" | "success" | "warning" | "nimbus" | "danger" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "SCHEDULED":
      return "nimbus";
    case "FROZEN":
    case "DRAWING":
      return "warning";
    case "COMPLETED":
      return "default";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

export function RaffleCard({
  id,
  title,
  prizeImages,
  prizeValue,
  ticketPrice,
  totalSlots,
  filledSlots,
  endsAt,
  status,
}: RaffleCardProps) {
  const image = prizeImages[0];

  return (
    <Link href={`/raffles/${id}`} className="block">
      <Card hover className="overflow-hidden">
        {/* Prize image */}
        <div className="relative aspect-video w-full bg-surface-overlay">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted text-xs">
              No image
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge variant={statusVariant(status)}>{status}</Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-text-primary line-clamp-2">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-text-muted">
              Prize value: {formatCurrency(prizeValue)}
            </p>
          </div>

          <ProgressBar filled={filledSlots} total={totalSlots} />

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-nimbus-600">
              {formatCurrency(ticketPrice)} / ticket
            </span>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <svg
                className="h-3.5 w-3.5 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <CountdownTimer endsAt={endsAt} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
