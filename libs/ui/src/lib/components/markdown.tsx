import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import {cn} from '../utils/cn';

export function Markdown({children, className}: {children: string; className?: string}) {
  return (
    <div
      className={cn(
        'grid gap-3 text-body [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_code]:rounded-sm [&_code]:bg-surface-sunken [&_code]:px-1 [&_h1]:text-title-md [&_h2]:text-title-sm [&_h3]:text-label [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:w-full [&_td]:border-b [&_td]:border-line [&_td]:py-1 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({node: _node, children: text, ...props}) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
