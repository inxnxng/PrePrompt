/**
 * Remove Markdown bold spans (ASCII double-asterisk pairs wrapping a phrase) from copy
 * shipped to agents or bundled in ZIP. Unclosed pairs (e.g. Cursor rule globs) stay unchanged.
 */
export function stripMarkdownBoldMarkers(text: string): string {
  let out = text;
  let prev = "";
  const pair = /\*\*((?:[^*]|\*(?!\*))+?)\*\*/g;
  while (out !== prev) {
    prev = out;
    out = out.replace(pair, "$1");
  }
  return out;
}
