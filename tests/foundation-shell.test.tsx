import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("foundation shell", () => {
  it("renders only the Phase 0 placeholder", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Mission Treasure Hunt" })
    ).toBeInTheDocument();
    expect(screen.getByText("Foundation app shell is ready.")).toBeInTheDocument();
    expect(screen.queryByText(/quest|team|admin|map|reveal/i)).not.toBeInTheDocument();
  });
});
