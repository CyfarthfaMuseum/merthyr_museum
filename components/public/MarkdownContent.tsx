import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function MarkdownContent({
  children,
  className = "text-[16px] leading-8 text-neutral-800",
}: {
  children: string
  className?: string
}) {
  return (
    <div className={`space-y-4 break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="font-serif text-[22px] leading-tight text-neutral-950">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="font-serif text-[20px] leading-tight text-neutral-950">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="font-serif text-[18px] leading-tight text-neutral-950">{children}</h4>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-950">{children}</strong>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-1 underline-offset-2 hover:text-neutral-950"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-neutral-300 pl-4 italic text-neutral-600">
              {children}
            </blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
