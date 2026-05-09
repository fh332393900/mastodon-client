import { render, screen } from "@testing-library/react"
import type { mastodon } from "masto"
import { contentToReactNode } from "@/lib/mastodon/contentToReactNode"

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock("@/components/mastodon/AccountHoverWrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/mastodon/TagHoverWrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/mastodon/ContentCode", () => ({
  __esModule: true,
  default: ({ code, lang }: { code: string; lang?: string }) => (
    <pre data-lang={lang}>{decodeURIComponent(code)}</pre>
  ),
}))

describe("contentToReactNode", () => {
  it("renders plain paragraph content", () => {
    const node = contentToReactNode("<p>Hello world</p>")
    render(<>{node}</>)
    expect(screen.getByText("Hello world")).toBeInTheDocument()
  })

  it("renders markdown code block from paragraph", () => {
    const node = contentToReactNode("<p>```js\nconst a = 1\n```</p>")
    render(<>{node}</>)
    const pre = screen.getByText("const a = 1")
    expect(pre).toBeInTheDocument()
    expect(pre.closest("pre")).toHaveAttribute("data-lang", "js")
  })

  it("renders custom emojis from text", () => {
    const emojis: mastodon.v1.CustomEmoji[] = [
      {
        shortcode: "wave",
        url: "https://example.com/wave.png",
      } as mastodon.v1.CustomEmoji,
    ]

    const node = contentToReactNode("<p>Hi :wave:</p>", emojis)
    render(<>{node}</>)
    const img = screen.getByAltText("wave")
    expect(img).toBeInTheDocument()
  })
})
