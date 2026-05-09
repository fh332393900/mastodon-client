import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Input } from "@/components/ui/input"

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Type here" />)
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument()
  })

  it("forwards type prop", () => {
    render(<Input type="password" placeholder="pw" />)
    expect(screen.getByPlaceholderText("pw")).toHaveAttribute("type", "password")
  })

  it("is disabled when disabled prop is set", () => {
    render(<Input disabled placeholder="disabled" />)
    expect(screen.getByPlaceholderText("disabled")).toBeDisabled()
  })

  it("accepts user input", async () => {
    render(<Input placeholder="name" />)
    const input = screen.getByPlaceholderText("name")
    await userEvent.type(input, "Alice")
    expect(input).toHaveValue("Alice")
  })
})
