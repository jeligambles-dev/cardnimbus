import { Job } from "bullmq";
import {
  evaluateAllDynamicBadges,
  evaluateBadgesForUser,
} from "@/services/badge.service";

export interface BadgeEvaluationJobData {
  type: "evaluate_dynamic" | "evaluate_user";
  /** Required when type === "evaluate_user" */
  userId?: string;
}

export async function handleBadgeEvaluation(
  job: Job<BadgeEvaluationJobData>
): Promise<void> {
  const { type, userId } = job.data;

  switch (type) {
    case "evaluate_dynamic": {
      console.log("[badge-evaluation] Running full dynamic badge evaluation…");
      await evaluateAllDynamicBadges();
      console.log("[badge-evaluation] Dynamic badge evaluation complete");
      break;
    }

    case "evaluate_user": {
      if (!userId) {
        throw new Error("evaluate_user job requires a userId");
      }
      console.log(`[badge-evaluation] Evaluating badges for user ${userId}…`);
      await evaluateBadgesForUser(userId);
      console.log(`[badge-evaluation] Badge evaluation complete for user ${userId}`);
      break;
    }

    default: {
      throw new Error(`Unknown badge evaluation job type: ${String(type)}`);
    }
  }
}
