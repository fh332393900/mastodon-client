"use client"

import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs"

// react-syntax-highlighter / highlight.js 体积极大（含全部语言包），
// 改成懒加载，仅当帖子里出现代码块时才下载，避免拖垮全站首屏与路由切换。
const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <CodeBlockSkeleton />,
  },
)

function CodeBlockSkeleton() {
  return (
    <div className="my-3 space-y-1.5 rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="h-3 w-24 rounded bg-border/60 dark:bg-muted-foreground/40" />
      <div className="h-3 w-11/12 rounded bg-border/50 dark:bg-muted-foreground/30" />
      <div className="h-3 w-3/4 rounded bg-border/50 dark:bg-muted-foreground/30" />
    </div>
  )
}

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