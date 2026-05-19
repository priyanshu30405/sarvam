/** Split text into word-level tokens while preserving whitespace as separate tokens. */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text.match(/\S+|\s+/g) ?? [];
}

export function isWhitespaceToken(token: string): boolean {
  return /^\s+$/.test(token);
}
