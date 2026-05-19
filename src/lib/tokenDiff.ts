export type DiffOp = "equal" | "insert" | "delete" | "replace";

export interface DiffSegment {
  op: DiffOp;
  left?: string;
  right?: string;
}

/**
 * Token-level diff via Wagner–Fischer edit distance with DP backtracking.
 * Tokens are aligned with unit cost for insert, delete, and substitute.
 */
export function diffTokens(leftTokens: string[], rightTokens: string[]): DiffSegment[] {
  const n = leftTokens.length;
  const m = rightTokens.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const left = leftTokens[i - 1];
      const right = rightTokens[j - 1];
      if (left === right) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const raw = backtrack(leftTokens, rightTokens, dp);
  return coalesceReplacements(raw);
}

function backtrack(leftTokens: string[], rightTokens: string[], dp: number[][]): DiffSegment[] {
  const raw: DiffSegment[] = [];
  let i = leftTokens.length;
  let j = rightTokens.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const left = leftTokens[i - 1];
      const right = rightTokens[j - 1];

      if (left === right && dp[i][j] === dp[i - 1][j - 1]) {
        raw.push({ op: "equal", left, right });
        i--;
        j--;
        continue;
      }
      if (dp[i][j] === dp[i - 1][j - 1] + 1) {
        raw.push({ op: "replace", left, right });
        i--;
        j--;
        continue;
      }
      if (dp[i][j] === dp[i - 1][j] + 1) {
        raw.push({ op: "delete", left });
        i--;
        continue;
      }
      if (dp[i][j] === dp[i][j - 1] + 1) {
        raw.push({ op: "insert", right });
        j--;
        continue;
      }
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      raw.push({ op: "delete", left: leftTokens[i - 1] });
      i--;
      continue;
    }
    if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      raw.push({ op: "insert", right: rightTokens[j - 1] });
      j--;
      continue;
    }

    // Should not happen with a valid DP table; avoid infinite loop.
    if (i > 0) {
      raw.push({ op: "delete", left: leftTokens[i - 1] });
      i--;
    } else if (j > 0) {
      raw.push({ op: "insert", right: rightTokens[j - 1] });
      j--;
    } else {
      break;
    }
  }

  raw.reverse();
  return raw;
}

function coalesceReplacements(segments: DiffSegment[]): DiffSegment[] {
  const out: DiffSegment[] = [];
  for (const seg of segments) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.op === "replace" &&
      seg.op === "replace" &&
      prev.left !== undefined &&
      seg.left !== undefined
    ) {
      prev.left += seg.left;
      prev.right = (prev.right ?? "") + (seg.right ?? "");
    } else {
      out.push({ ...seg });
    }
  }
  return out;
}

/** Time complexity: O(n * m) time, O(n * m) space for the DP table. */
export function diffComplexityNote(): string {
  return "O(n·m) time and space where n, m are token counts.";
}
