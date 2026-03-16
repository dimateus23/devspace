import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function MarkdownViewer({ content, compact = false, dimmed = false }) {
  const textColor = dimmed ? 'text-[#aaa]' : 'text-[#ccc]'
  const textSize = compact ? 'text-xs' : 'text-sm'

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p({ children }) {
          return <p className={`${textSize} ${textColor} leading-relaxed my-1 first:mt-0 last:mb-0`}>{children}</p>
        },
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          if (match) {
            return (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{ background: '#111', borderRadius: '0.5rem', fontSize: '0.75rem', margin: '0.5rem 0', border: '1px solid #1a1a1a' }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          }
          return (
            <code className="bg-[#111] text-[#e879f9] px-1.5 py-0.5 rounded text-[0.8em] font-mono border border-[#1a1a1a]" {...props}>
              {children}
            </code>
          )
        },
        pre({ children }) {
          return <div className="my-2">{children}</div>
        },
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#338ef7] hover:underline">{children}</a>
        },
        ul({ children }) {
          return <ul className={`list-disc list-inside my-1 space-y-0.5 ${textColor} ${textSize}`}>{children}</ul>
        },
        ol({ children }) {
          return <ol className={`list-decimal list-inside my-1 space-y-0.5 ${textColor} ${textSize}`}>{children}</ol>
        },
        li({ children }) {
          return <li className={textSize}>{children}</li>
        },
        h1({ children }) {
          return <h1 className="text-base font-bold text-white mt-3 mb-1">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-sm font-bold text-white mt-2 mb-1">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-xs font-semibold text-white mt-2 mb-0.5">{children}</h3>
        },
        blockquote({ children }) {
          return <blockquote className="border-l-2 border-[#333] pl-3 my-1 text-[#555] italic">{children}</blockquote>
        },
        hr() {
          return <hr className="border-[#1a1a1a] my-3" />
        },
        strong({ children }) {
          return <strong className="font-semibold text-white">{children}</strong>
        },
        em({ children }) {
          return <em className="italic text-[#bbb]">{children}</em>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
