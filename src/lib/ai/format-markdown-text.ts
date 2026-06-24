/** Échappe le HTML puis convertit un sous-ensemble Markdown (gras, listes) pour l'export HTML. */
export function markdownToHtml(text: string): string {
  const escaped = escapeHtml(text);
  const withBold = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  const lines = withBold.split("\n");
  const blocks: string[] = [];
  let listType: "ol" | "ul" | null = null;
  let listItems: string[] = [];

  function flushList() {
    if (!listType || !listItems.length) return;
    blocks.push(
      `<${listType}>${listItems.map((item) => `<li>${item}</li>`).join("")}</${listType}>`
    );
    listType = null;
    listItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    const numbered = /^(\d+)\.\s+(.+)$/.exec(trimmed);
    const bullet = /^[-*•]\s+(.+)$/.exec(trimmed);

    if (numbered) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(numbered[2]);
      continue;
    }

    if (bullet) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(bullet[1]);
      continue;
    }

    flushList();

    if (!trimmed) {
      blocks.push("<br />");
      continue;
    }

    blocks.push(`<p>${line}</p>`);
  }

  flushList();
  return blocks.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type MarkdownLine =
  | { type: "blank" }
  | { type: "paragraph"; text: string }
  | { type: "numbered"; index: string; text: string }
  | { type: "bullet"; text: string };

/** Découpe le texte en blocs pour le rendu React. */
export function parseMarkdownLines(text: string): MarkdownLine[] {
  const lines = text.split("\n");
  const blocks: MarkdownLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const numbered = /^(\d+)\.\s+(.+)$/.exec(trimmed);
    const bullet = /^[-*•]\s+(.+)$/.exec(trimmed);

    if (numbered) {
      blocks.push({ type: "numbered", index: numbered[1], text: numbered[2] });
      continue;
    }
    if (bullet) {
      blocks.push({ type: "bullet", text: bullet[1] });
      continue;
    }
    if (!trimmed) {
      blocks.push({ type: "blank" });
      continue;
    }
    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

/** Découpe une ligne en segments texte / gras (`**…**`). */
export function parseInlineMarkdown(
  text: string
): Array<{ kind: "text"; value: string } | { kind: "bold"; value: string }> {
  const segments: Array<
    { kind: "text"; value: string } | { kind: "bold"; value: string }
  > = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ kind: "text", value: text.slice(last, match.index) });
    }
    segments.push({ kind: "bold", value: match[1] });
    last = re.lastIndex;
  }

  if (last < text.length) {
    segments.push({ kind: "text", value: text.slice(last) });
  }

  return segments.length ? segments : [{ kind: "text", value: text }];
}
