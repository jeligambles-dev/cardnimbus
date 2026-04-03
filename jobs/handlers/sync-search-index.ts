import { Job } from "bullmq";
import {
  syncProductToIndex,
  syncCardToIndex,
  removeProductFromIndex,
  fullReindex,
} from "@/services/search.service";

export type SearchSyncJobData =
  | { action: "upsert"; entityType: "product"; id: string }
  | { action: "upsert"; entityType: "card"; id: string }
  | { action: "delete"; entityType: "product"; id: string }
  | { action: "full_reindex" };

export async function handleSyncSearchIndex(
  job: Job<SearchSyncJobData>
): Promise<void> {
  const data = job.data;

  switch (data.action) {
    case "upsert":
      if (data.entityType === "product") {
        await syncProductToIndex(data.id);
      } else {
        await syncCardToIndex(data.id);
      }
      break;

    case "delete":
      await removeProductFromIndex(data.id);
      break;

    case "full_reindex":
      await fullReindex();
      break;

    default: {
      const exhaustive: never = data;
      throw new Error(
        `Unknown search sync action: ${(exhaustive as SearchSyncJobData & { action: string }).action}`
      );
    }
  }
}
