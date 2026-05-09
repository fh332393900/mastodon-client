import { render, screen } from "@testing-library/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

describe("Avatar", () => {
  it("renders avatar root with data-slot", () => {
    const { container } = render(<Avatar />)
    expect(container.querySelector("[data-slot='avatar']")).toBeInTheDocument()
  })

  it("renders fallback text when image is absent", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText("AB")).toBeInTheDocument()
  })

  it("accepts custom className on root", () => {
    const { container } = render(<Avatar className="custom-avatar" />)
    expect(container.querySelector("[data-slot='avatar']")).toHaveClass("custom-avatar")
  })
})
