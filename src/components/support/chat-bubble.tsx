import { SupportSenderType } from "@prisma/client";

interface ChatBubbleProps {
  content: string;
  senderType: SupportSenderType;
  createdAt?: string;
  senderName?: string;
}

export function ChatBubble({ content, senderType, createdAt, senderName }: ChatBubbleProps) {
  if (senderType === SupportSenderType.SYSTEM || senderType === SupportSenderType.BOT) {
    return (
      <div className="flex justify-center my-2">
        <span className="rounded-full bg-surface-overlay px-3 py-1 text-xs text-text-muted">
          {content}
        </span>
      </div>
    );
  }

  const isCustomer = senderType === SupportSenderType.CUSTOMER;

  return (
    <div className={["flex flex-col gap-0.5 my-1", isCustomer ? "items-end" : "items-start"].join(" ")}>
      {senderName && (
        <span className="text-xs text-text-muted px-1">{senderName}</span>
      )}
      <div
        className={[
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed break-words",
          isCustomer
            ? "rounded-br-sm bg-nimbus-600 text-white"
            : "rounded-bl-sm bg-surface-raised text-text-primary",
        ].join(" ")}
      >
        {content}
      </div>
      {createdAt && (
        <span className="text-xs text-text-muted px-1">
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}
