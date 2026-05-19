import { useMemo } from "react";
import { diffTokens, type DiffSegment } from "@/lib/tokenDiff";
import { tokenize } from "@/lib/tokenize";
import DiffTokenSpan from "./DiffTokenSpan";

interface DiffPanelProps {
  leftText: string;
  rightText: string;
  leftLabel: string;
  rightLabel: string;
}

function renderSide(segments: DiffSegment[], side: "left" | "right") {
  return segments.map((seg, idx) => {
    const token = side === "left" ? seg.left : seg.right;
    if (!token) return null;
    const visibleOp =
      seg.op === "equal" || (side === "left" && seg.op === "delete") || (side === "right" && seg.op === "insert")
        ? seg.op
        : seg.op === "replace"
          ? "replace"
          : "equal";
    const hide =
      (side === "left" && seg.op === "insert") || (side === "right" && seg.op === "delete");
    if (hide) return null;
    return <DiffTokenSpan key={`${idx}-${side}`} op={visibleOp} token={token} side={side} />;
  });
}

export default function DiffPanel({ leftText, rightText, leftLabel, rightLabel }: DiffPanelProps) {
  const segments = useMemo(() => {
    const left = tokenize(leftText);
    const right = tokenize(rightText);
    return diffTokens(left, right);
  }, [leftText, rightText]);

  const stats = useMemo(() => {
    let changed = 0;
    for (const s of segments) {
      if (s.op !== "equal") changed++;
    }
    return { changed, total: segments.length };
  }, [segments]);

  return (
    <div className="diff-container">
      <p className="diff-stats" aria-live="polite">
        {stats.changed} token-level change{stats.changed === 1 ? "" : "s"} detected
      </p>
      <div className="diff-panels">
        <section className="diff-side" aria-label={leftLabel}>
          <h3>{leftLabel}</h3>
          <div className="diff-body" role="document">
            {renderSide(segments, "left")}
          </div>
        </section>
        <section className="diff-side" aria-label={rightLabel}>
          <h3>{rightLabel}</h3>
          <div className="diff-body" role="document">
            {renderSide(segments, "right")}
          </div>
        </section>
      </div>
    </div>
  );
}
