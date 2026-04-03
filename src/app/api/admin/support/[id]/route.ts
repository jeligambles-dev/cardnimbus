import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  errorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import {
  assignAgent,
  resolveConversation,
  transferConversation,
  closeConversation,
  addInternalNote,
} from "@/services/support.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if ((session.user as any).role !== "ADMIN") throw new UnauthorizedError("Forbidden");
  return session;
}

// PUT: assign | resolve | transfer | close
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const { action, agentId, toAgentId, reason, closedReason } = body;

    switch (action) {
      case "assign": {
        if (!agentId) throw new ValidationError("agentId is required for assign");
        const result = await assignAgent(id, agentId);
        return Response.json(result);
      }
      case "resolve": {
        const result = await resolveConversation(id, session.user.id!, closedReason);
        return Response.json(result);
      }
      case "transfer": {
        if (!toAgentId) throw new ValidationError("toAgentId is required for transfer");
        const fromAgentId = agentId ?? session.user.id!;
        const result = await transferConversation(id, fromAgentId, toAgentId, reason);
        return Response.json(result);
      }
      case "close": {
        const result = await closeConversation(id);
        return Response.json(result);
      }
      default:
        throw new ValidationError("Unknown action. Use: assign | resolve | transfer | close");
    }
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: add internal note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) throw new ValidationError("content is required");

    const note = await addInternalNote(id, session.user.id!, content);
    return Response.json(note, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
