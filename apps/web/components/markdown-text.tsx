import type { ReactNode } from "react";

type MarkdownTextProps = {
  className?: string;
  content: string;
};

export function MarkdownText({ className, content }: MarkdownTextProps) {
  return <div className={className}>{renderMarkdownContent(content)}</div>;
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function isMarkdownDivider(line: string) {
  return /^-{3,}$/.test(line.trim());
}

function isMarkdownHeading(line: string) {
  return /^#{1,6}\s+/.test(line.trim());
}

function isMarkdownListItem(line: string) {
  return /^[-*]\s+/.test(line.trim()) || /^\d+\.\s+/.test(line.trim());
}

function renderParagraph(text: string, key: string) {
  const lines = text.split("\n").filter((line) => line.trim());

  return (
    <p key={key}>
      {lines.map((line, index) => (
        <span key={`${key}-${index}`}>
          {index > 0 ? <br /> : null}
          {renderInlineMarkdown(line.trim())}
        </span>
      ))}
    </p>
  );
}

function renderMarkdownContent(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (isMarkdownDivider(trimmed)) {
      blocks.push(<hr key={`hr-${index}`} />);
      index += 1;
      continue;
    }

    if (isMarkdownHeading(trimmed)) {
      const headingText = trimmed.replace(/^#{1,6}\s+/, "");
      blocks.push(<h3 key={`heading-${index}`}>{renderInlineMarkdown(headingText)}</h3>);
      index += 1;
      continue;
    }

    if (isMarkdownListItem(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];

      while (index < lines.length) {
        const item = lines[index].trim();
        if (!item || !isMarkdownListItem(item) || /^\d+\.\s+/.test(item) !== ordered) {
          break;
        }

        items.push(item.replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ""));
        index += 1;
      }

      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        isMarkdownDivider(current) ||
        isMarkdownHeading(current) ||
        isMarkdownListItem(current)
      ) {
        break;
      }

      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push(renderParagraph(paragraphLines.join("\n"), `paragraph-${index}`));
  }

  return blocks;
}
