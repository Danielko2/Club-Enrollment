import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { auth } from "../src/config/firebase-config";
import RegisterLoginPage from "../src/pages/RegisterLoginPage";
import { useAuth } from "../src/hooks/AuthContext";

jest.mock("../src/hooks/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    setNickname: jest.fn(),
  })),
}));

jest.mock("../src/config/firebase-config", () => ({
  auth: {
    currentUser: {
      uid: "user-123",
      email: "test@example.com",
    },
  },
}));

describe("RegisterLoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders register form by default", () => {
    render(<RegisterLoginPage />);
    const registerForm = screen.getByText("Register");
    expect(registerForm).toBeInTheDocument();
  });

  test("renders login form when toggle button is clicked", () => {
    render(<RegisterLoginPage />);
    const toggleButton = screen.getByText("Need an account? Register");
    fireEvent.click(toggleButton);
    const loginForm = screen.getByText("Login");
    expect(loginForm).toBeInTheDocument();
  });

  test("calls register function when register form is submitted", () => {
    render(<RegisterLoginPage />);
    const registerButton = screen.getByText("Register");
    fireEvent.click(registerButton);
    // Add your assertions here
  });

  test("calls login function when login form is submitted", () => {
    render(<RegisterLoginPage />);
    const toggleButton = screen.getByText("Need an account? Register");
    fireEvent.click(toggleButton);
    const loginButton = screen.getByText("Login");
    fireEvent.click(loginButton);
    // Add your assertions here
  });

  test("calls signInWithGoogle function when sign in with Google button is clicked", () => {
    render(<RegisterLoginPage />);
    const signInWithGoogleButton = screen.getByText("Sign in with Google");
    fireEvent.click(signInWithGoogleButton);
    // Add your assertions here
  });

  test("calls handleNicknameSubmission function when nickname form is submitted", () => {
    render(<RegisterLoginPage />);
    const toggleButton = screen.getByText("Need an account? Register");
    fireEvent.click(toggleButton);
    const nicknameInput = screen.getByPlaceholderText("Enter nickname");
    fireEvent.change(nicknameInput, { target: { value: "testNickname" } });
    const submitButton = screen.getByText("Submit Nickname");
    fireEvent.click(submitButton);
    // Add your assertions here
  });

  // Add more tests as needed
});
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { auth } from "../src/config/firebase-config";
import RegisterLoginPage from "../src/pages/RegisterLoginPage";
import { useAuth } from "../src/hooks/AuthContext";

jest.mock("../src/hooks/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    setNickname: jest.fn(),
  })),
}));

jest.mock("../src/config/firebase-config", () => ({
  auth: {
    currentUser: {
      uid: "test-uid",
      email: "test@example.com",
    },
  },
}));

describe("RegisterLoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders register form", () => {
    render(<RegisterLoginPage />);
    const registerForm = screen.getByText("Register");
    expect(registerForm).toBeInTheDocument();
  });

  test("renders login form", () => {
    render(<RegisterLoginPage />);
    const loginForm = screen.getByText("Login");
    expect(loginForm).toBeInTheDocument();
  });

  test("renders nickname input when registering", () => {
    render(<RegisterLoginPage />);
    const nicknameInput = screen.getByPlaceholderText("Enter nickname");
    expect(nicknameInput).toBeInTheDocument();
  });

  test("does not render nickname input when logging in", () => {
    render(<RegisterLoginPage />);
    const nicknameInput = screen.queryByPlaceholderText("Enter nickname");
    expect(nicknameInput).toBeNull();
  });

  test("calls register function when register button is clicked", () => {
    render(<RegisterLoginPage />);
    const registerButton = screen.getByRole("button", { name: "Register" });
    fireEvent.click(registerButton);
    // Add your assertions here
  });

  test("calls login function when login button is clicked", () => {
    render(<RegisterLoginPage />);
    const loginButton = screen.getByRole("button", { name: "Login" });
    fireEvent.click(loginButton);
    // Add your assertions here
  });

  test("calls toggleForm function when toggle button is clicked", () => {
    render(<RegisterLoginPage />);
    const toggleButton = screen.getByRole("button", {
      name: "Already have an account? Login",
    });
    fireEvent.click(toggleButton);
    // Add your assertions here
  });

  test("calls signInWithGoogle function when sign in with Google button is clicked", () => {
    render(<RegisterLoginPage />);
    const signInWithGoogleButton = screen.getByRole("button", {
      name: "Sign in with Google",
    });
    fireEvent.click(signInWithGoogleButton);
    // Add your assertions here
  });

  test("calls handleNicknameSubmission function when submit nickname button is clicked", () => {
    render(<RegisterLoginPage />);
    const submitNicknameButton = screen.getByRole("button", {
      name: "Submit Nickname",
    });
    fireEvent.click(submitNicknameButton);
    // Add your assertions here
  });

  test("navigates to clubs page after successful registration", () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <RegisterLoginPage />
      </Router>
    );
    const registerButton = screen.getByRole("button", { name: "Register" });
    fireEvent.click(registerButton);
    // Add your assertions here
  });

  test("navigates to clubs page after successful login", () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <RegisterLoginPage />
      </Router>
    );
    const loginButton = screen.getByRole("button", { name: "Login" });
    fireEvent.click(loginButton);
    // Add your assertions here
  });
});
