import type { DiffOp } from "@/lib/tokenDiff";

interface DiffTokenSpanProps {
  op: DiffOp;
  token: string;
  side: "left" | "right";
}

export default function DiffTokenSpan({ op, token, side }: DiffTokenSpanProps) {
  if (!token) return null;

  const className = [
    "diff-token",
    op === "equal" ? "equal" : "",
    op === "delete" && side === "left" ? "removed" : "",
    op === "insert" && side === "right" ? "added" : "",
    op === "replace" && side === "left" ? "removed" : "",
    op === "replace" && side === "right" ? "added" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const ariaLabel =
    op === "equal"
      ? undefined
      : op === "delete"
        ? `Removed: ${token.trim()}`
        : op === "insert"
          ? `Added: ${token.trim()}`
          : side === "left"
            ? `Changed from: ${token.trim()}`
            : `Changed to: ${token.trim()}`;

  return (
    <span className={className} aria-label={ariaLabel}>
      {token}
    </span>
  );
}
