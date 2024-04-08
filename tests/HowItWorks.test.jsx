import { render, screen } from "@testing-library/react";
import HowItWorks from "../src/components/HowItWorks";
import React from "react";
import "@testing-library/jest-dom";
test("renders How It Works section", () => {
  render(<HowItWorks />);

  // Assert that the section heading is rendered
  const headingElement = screen.getByText(/How It Works/i);
  expect(headingElement).toBeInTheDocument();

  // Assert that all three steps are rendered
  const registerElement = screen.getByText(/Register/i);
  expect(registerElement).toBeInTheDocument();

  const findClubsElement = screen.getByText(/Find Clubs/i);
  expect(findClubsElement).toBeInTheDocument();

  const joinSessionsElement = screen.getByText(/Join Sessions/i);
  expect(joinSessionsElement).toBeInTheDocument();
});
