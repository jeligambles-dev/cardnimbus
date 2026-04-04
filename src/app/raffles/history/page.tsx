import Link from "next/link";
import { getRaffleHistory } from "@/services/raffle.service";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Raffle History — Card Nimbus",
  description: "Past winners and completed raffles on Card Nimbus.",
};

interface SearchParams {
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function RaffleHistoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const { raffles, total, totalPages } = await getRaffleHistory(page, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Past Winners
        </h1>
        <p className="mt-2 text-text-secondary">
          {total.toLocaleString()} completed raffle{total !== 1 ? "s" : ""}
        </p>
      </div>

      {raffles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface-raised py-20">
          <p className="text-xl font-semibold text-text-primary">
            No completed raffles yet
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Winners will appear here after each draw.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {raffles.map((raffle) => {
              const image = raffle.prizeImages[0];
              return (
                <Link key={raffle.id} href={`/raffles/${raffle.id}`}>
                  <Card hover className="overflow-hidden">
                    <div className="aspect-video w-full bg-surface-overlay">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={raffle.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-text-muted">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-text-primary line-clamp-2">
                        {raffle.title}
                      </h3>
                      <p className="text-sm text-nimbus-600 font-medium">
                        {formatCurrency(raffle.prizeValue)}
                      </p>

                      {raffle.winner && (
                        <div className="flex items-center gap-2 rounded-lg bg-surface-overlay px-3 py-2">
                          <svg
                            className="h-4 w-4 text-amber-400 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-xs text-text-primary truncate">
                            {raffle.winner.name ?? "Anonymous"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>
                          {raffle._count.tickets.toLocaleString()} tickets
                        </span>
                        <span>
                          {raffle.drawnAt
                            ? new Date(raffle.drawnAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/raffles/history?page=${page - 1}`}
                  className="rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-overlay"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/raffles/history?page=${page + 1}`}
                  className="rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-overlay"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
