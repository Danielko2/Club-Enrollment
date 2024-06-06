import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterLoginPage from "../src/pages/RegisterPage";
import React from "react";
import "@testing-library/jest-dom";

import { useAuth } from "../src/hooks/AuthContext";
jest.mock("../src/hooks/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("RegisterLoginPage", () => {
  beforeEach(() => {
    useAuth.mockImplementation(() => ({
      setNickname: jest.fn(),
    }));
  });

  test("renders register form by default", () => {
    render(
      <MemoryRouter>
        <RegisterLoginPage />
      </MemoryRouter>
    );
    const registerForms = screen.getAllByText("Register");
    expect(registerForms.length).toBeGreaterThan(0);
  });

  test("submits registration form successfully", () => {
    render(
      <MemoryRouter>
        <RegisterLoginPage />
      </MemoryRouter>
    );
    const registerButtons = screen.getAllByText("Register");
    const registerButton = registerButtons.find(
      (button) => button.tagName.toLowerCase() === "button"
    ); // find the button element
    const emailInput = screen.getByPlaceholderText("Enter email");
    const passwordInput = screen.getByPlaceholderText("Enter password");
    const nicknameInput = screen.getByPlaceholderText("Enter nickname");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.change(nicknameInput, { target: { value: "nickname" } });
    fireEvent.click(registerButton);

    // Add assertions to check if the form was submitted successfully
  });
});
