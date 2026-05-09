import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Switch } from "@/components/ui/switch"

describe("Switch", () => {
  it("renders as a switch role", () => {
    render(<Switch />)
    expect(screen.getByRole("switch")).toBeInTheDocument()
  })

  it("is unchecked by default", () => {
    render(<Switch />)
    expect(screen.getByRole("switch")).not.toBeChecked()
  })

  it("reflects checked state when defaultChecked is true", () => {
    render(<Switch defaultChecked />)
    expect(screen.getByRole("switch")).toBeChecked()
  })

  it("is disabled when disabled prop is set", () => {
    render(<Switch disabled />)
    expect(screen.getByRole("switch")).toBeDisabled()
  })

  it("calls onCheckedChange when toggled", async () => {
    const handleChange = vi.fn()
    render(<Switch onCheckedChange={handleChange} />)
    await userEvent.click(screen.getByRole("switch"))
    expect(handleChange).toHaveBeenCalledWith(true)
  })
})
