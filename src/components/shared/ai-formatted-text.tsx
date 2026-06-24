import {
  parseInlineMarkdown,
  parseMarkdownLines,
} from "@/lib/ai/format-markdown-text";
import { cn } from "@/lib/utils/cn";

function InlineMarkdown({ text }: { text: string }) {
  const segments = parseInlineMarkdown(text);

  return (
    <>
      {segments.map((segment, i) =>
        segment.kind === "bold" ? (
          <strong key={i} className="font-semibold text-foreground">
            {segment.value}
          </strong>
        ) : (
          <span key={i}>{segment.value}</span>
        )
      )}
    </>
  );
}

export function AiFormattedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = parseMarkdownLines(text);

  return (
    <div className={cn("space-y-1.5", className)}>
      {lines.map((line, i) => {
        if (line.type === "blank") {
          return <div key={i} className="h-1" aria-hidden />;
        }

        if (line.type === "numbered") {
          return (
            <p key={i} className="flex gap-2 pl-0.5">
              <span className="shrink-0 font-medium tabular-nums">{line.index}.</span>
              <span>
                <InlineMarkdown text={line.text} />
              </span>
            </p>
          );
        }

        if (line.type === "bullet") {
          return (
            <p key={i} className="flex gap-2 pl-0.5">
              <span className="shrink-0 text-muted-foreground">•</span>
              <span>
                <InlineMarkdown text={line.text} />
              </span>
            </p>
          );
        }

        return (
          <p key={i}>
            <InlineMarkdown text={line.text} />
          </p>
        );
      })}
    </div>
  );
}
