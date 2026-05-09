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

  describe("@mention parsing", () => {
    it("renders a cross-server mention as full handle link", () => {
      const html = `<p><a href="https://other.social/@alice" class="mention">@alice@other.social</a></p>`
      const node = contentToReactNode(html, [], "mastodon.social")
      render(<>{node}</>)
      const link = screen.getByRole("link", { name: /@alice@other\.social/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "/mastodon.social/@alice@other.social")
    })

    it("renders a same-server mention with short handle", () => {
      const html = `<p><a href="https://mastodon.social/@bob" class="mention">@bob</a></p>`
      const node = contentToReactNode(html, [], "mastodon.social")
      render(<>{node}</>)
      const link = screen.getByRole("link", { name: "@bob" })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "/mastodon.social/@bob")
    })

    it("renders mention without currentServer using mention server as route", () => {
      const html = `<p><a href="https://fosstodon.org/@carol" class="mention">@carol@fosstodon.org</a></p>`
      const node = contentToReactNode(html)
      render(<>{node}</>)
      const link = screen.getByRole("link", { name: /@carol@fosstodon\.org/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "/fosstodon.org/@carol@fosstodon.org")
    })
  })

  describe("#hashtag parsing", () => {
    it("renders a hashtag as a link to the tag page", () => {
      const html = `<p><a href="/tags/typescript" class="mention hashtag">#<span>TypeScript</span></a></p>`
      const node = contentToReactNode(html, [], "mastodon.social")
      render(<>{node}</>)
      const link = screen.getByRole("link", { name: /TypeScript/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "/mastodon.social/tags/typescript")
    })

    it("renders multiple hashtags in one paragraph", () => {
      const html = `<p>
        <a href="/tags/react" class="mention hashtag">#<span>React</span></a>
        <a href="/tags/nextjs" class="mention hashtag">#<span>NextJS</span></a>
      </p>`
      const node = contentToReactNode(html, [], "mastodon.social")
      render(<>{node}</>)
      expect(screen.getByRole("link", { name: /React/ })).toHaveAttribute(
        "href",
        "/mastodon.social/tags/react",
      )
      expect(screen.getByRole("link", { name: /NextJS/ })).toHaveAttribute(
        "href",
        "/mastodon.social/tags/nextjs",
      )
    })
  })

  describe("complex mixed content", () => {
    it("renders emojis, code block, text, @mention and #hashtag all together", () => {
      const emojis: mastodon.v1.CustomEmoji[] = [
        { shortcode: "tada", url: "https://example.com/tada.png" } as mastodon.v1.CustomEmoji,
        { shortcode: "rocket", url: "https://example.com/rocket.png" } as mastodon.v1.CustomEmoji,
      ]

      // Simulate a realistic Mastodon status with all content types interleaved
      const html = [
        `<p>Hello :tada: world! Check this out:</p>`,
        `<p>\`\`\`ts\nconst greet = (name: string) => \`Hi \${name}\`\n\`\`\`</p>`,
        `<p>Thanks to <a href="https://mastodon.social/@alice" class="mention">@alice</a> for the tip :rocket:</p>`,
        `<p>Discussion at <a href="/tags/typescript" class="mention hashtag">#<span>TypeScript</span></a> and <a href="/tags/react" class="mention hashtag">#<span>React</span></a></p>`,
      ].join("\n")

      const node = contentToReactNode(html, emojis, "mastodon.social")
      const { container } = render(<>{node}</>)

      // Plain text present
      expect(screen.getByText(/Hello/)).toBeInTheDocument()
      expect(screen.getByText(/Check this out/)).toBeInTheDocument()

      // Emojis rendered as images
      expect(screen.getByAltText("tada")).toBeInTheDocument()
      expect(screen.getByAltText("rocket")).toBeInTheDocument()

      // Code block rendered with language
      const pre = container.querySelector("pre[data-lang='ts']")
      expect(pre).toBeInTheDocument()
      expect(pre?.textContent).toContain("greet")

      // @mention link
      const mentionLink = screen.getByRole("link", { name: "@alice" })
      expect(mentionLink).toBeInTheDocument()
      expect(mentionLink).toHaveAttribute("href", "/mastodon.social/@alice")

      // #hashtag links
      expect(screen.getByRole("link", { name: /TypeScript/ })).toHaveAttribute(
        "href",
        "/mastodon.social/tags/typescript",
      )
      expect(screen.getByRole("link", { name: /React/ })).toHaveAttribute(
        "href",
        "/mastodon.social/tags/react",
      )
    })
  })
})
