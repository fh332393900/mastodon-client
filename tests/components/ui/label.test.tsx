import { render, screen } from "@testing-library/react"
import { Label } from "@/components/ui/label"

describe("Label", () => {
  it("renders label text", () => {
    render(<Label>Username</Label>)
    expect(screen.getByText("Username")).toBeInTheDocument()
  })

  it("associates with an input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    )
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })
})
