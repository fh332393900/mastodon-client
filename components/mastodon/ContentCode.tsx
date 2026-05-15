"use client"

import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs"
import SyntaxHighlighter from 'react-syntax-highlighter'

// const SyntaxHighlighter = dynamic(
//   () => import("react-syntax-highlighter").then((mod) => mod.default),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="flex items-center justify-between px-3.5 py-1.5 bg-muted/60 border-b border-border/50">
//         <span className="text-[11px] font-mono text-muted-foreground/70 tracking-wide"></span>
//         <div className="flex gap-1">
//           <span className="h-2 w-2 rounded-full bg-red-400/70" />
//           <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
//           <span className="h-2 w-2 rounded-full bg-green-400/70" />
//         </div>
//       </div>
//     ),
//   },
// )

export default function ContentCode({
  code,
  lang,
}: {
  code: string
  lang?: string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const decoded = decodeURIComponent(code)

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-border/60 text-[13px]">
      {/* title bar */}
      {lang ? (
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-muted/60 border-b border-border/50">
          <span className="text-[11px] font-mono text-muted-foreground/70 tracking-wide">{lang}</span>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
            <span className="h-2 w-2 rounded-full bg-green-400/70" />
          </div>
        </div>
      ) : null}
      <SyntaxHighlighter
        language={lang || "text"}
        style={isDark ? atomOneDark : atomOneLight}
        customStyle={{
          margin: 0,
          padding: "0.85rem 1rem",
          background: isDark ? "oklch(0.105 0.010 280)" : "oklch(0.975 0.003 270)",
          fontSize: "13px",
          lineHeight: "1.6",
          borderRadius: 0,
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono), ui-monospace, monospace" } }}
        wrapLongLines={false}
      >
        {decoded}
      </SyntaxHighlighter>
    </div>
  )
}