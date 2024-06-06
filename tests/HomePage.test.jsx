import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import HomePage from "../src/pages/HomePage";
import React from "react";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(() => jest.fn()),
}));

describe("HomePage", () => {
  let navigate;
  beforeEach(() => {
    navigate = jest.fn();
    useNavigate.mockImplementation(() => navigate);
  });

  test("renders welcome message", () => {
    render(<HomePage />);
    const welcomeMessage = screen.getByText("Welcome to the Dungeon Connect");
    expect(welcomeMessage).toBeInTheDocument();
  });

  test("renders join button", () => {
    render(<HomePage />);
    const joinButton = screen.getByRole("button", { name: "Join Now" });
    expect(joinButton).toBeInTheDocument();
  });

  test("navigates to register page when join button is clicked", () => {
    render(<HomePage />);
    const joinButton = screen.getByRole("button", { name: "Join Now" });
    fireEvent.click(joinButton);
    expect(navigate).toHaveBeenCalledWith("/register");
  });
});
