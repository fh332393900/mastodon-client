import { render, screen } from "@testing-library/react"
import { Slider } from "@/components/ui/slider"

describe("Slider", () => {
  it("renders a slider", () => {
    render(<Slider defaultValue={[50]} min={0} max={100} />)
    expect(screen.getByRole("slider")).toBeInTheDocument()
  })

  it("reflects defaultValue as aria-valuenow", () => {
    render(<Slider defaultValue={[30]} min={0} max={100} />)
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "30")
  })

  it("exposes aria-valuemin and aria-valuemax", () => {
    render(<Slider defaultValue={[0]} min={10} max={90} />)
    const slider = screen.getByRole("slider")
    expect(slider).toHaveAttribute("aria-valuemin", "10")
    expect(slider).toHaveAttribute("aria-valuemax", "90")
  })
})
