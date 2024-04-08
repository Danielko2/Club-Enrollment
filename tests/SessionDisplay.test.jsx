import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SessionDisplay from "../src/components/SessionDisplay";
import "@testing-library/jest-dom";

// Mock for GoogleMapReact to prevent it from trying to render in a test environment
jest.mock("google-map-react", () => (props) => (
  <div data-testid="mock-google-map">{props.children}</div>
));

// Mocks for the auth and PayPal component

jest.mock("../src/hooks/AuthContext", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../src/components/PayPalComponent", () => (props) => (
  <button onClick={props.onPaymentSuccess} data-testid="mock-paypal-component">
    Mock PayPal Button
  </button>
));

describe("SessionDisplay", () => {
  const mockSession = {
    id: "session-id",
    name: "Test Session",
    date: "2021-08-01",
    time: "18:00",
    location: "Virtual Location",
    description: "Session description",
    participants: [{ uid: "test-uid", nickname: "Test User", paid: false }],
    fee: "10",
  };

  const defaultProps = {
    session: mockSession,
    onClose: jest.fn(),
    onJoin: jest.fn(),
    canJoin: true,
    onLeave: jest.fn(),
    clubId: "club-id",
  };

  it("renders session details correctly", () => {
    render(<SessionDisplay {...defaultProps} />);

    expect(screen.getByText(mockSession.name)).toBeInTheDocument();
    expect(screen.getByText(mockSession.date)).toBeInTheDocument();
    expect(screen.getByText(mockSession.time)).toBeInTheDocument();
    expect(screen.getByText(mockSession.description)).toBeInTheDocument();
  });

  it("renders the join button if user can join", () => {
    render(<SessionDisplay {...defaultProps} />);

    const joinButton = screen.getByRole("button", { name: "Join Session" });
    expect(joinButton).toBeInTheDocument();

    fireEvent.click(joinButton);
    expect(defaultProps.onJoin).toHaveBeenCalledWith(mockSession);
  });

  // More tests can be added for other functionalities like leaving a session, payment success, etc.
});
