"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

type Props = {
  text: string;
  className?: string;
};

/**
 * LLM 추천 텍스트(굵게·링크·줄바꿈)를 화면에 맞게 렌더링합니다.
 */
const defaultBodyClass = [
  "text-sm leading-relaxed text-foreground",
  "[&_p]:mb-2 [&_p]:last:mb-0",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_a]:text-primary [&_a]:underline [&_a]:break-all",
  "[&_a]:decoration-primary/60",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1",
  "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1",
  "[&_li]:pl-0.5",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px]",
  "[&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:first:mt-0",
  "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:first:mt-0",
  "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:first:mt-0",
].join(" ");

export function SimilarSitesMarkdown({ text, className }: Props) {
  return (
    <div className={className ?? defaultBodyClass}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          a: ({ href, children, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
