import { render, screen, fireEvent } from "@testing-library/react";
import PromoteMemberForm from "../src/components/PromoteMemberForm";
import React from "react";
import "@testing-library/jest-dom";
describe("PromoteMemberForm", () => {
  const members = [
    { uid: "1", nickname: "John" },
    { uid: "2", nickname: "Jane" },
    { uid: "3", nickname: "Bob" },
  ];

  it("renders the form with member options", () => {
    render(<PromoteMemberForm members={members} />);

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(members.length + 1); // +1 for the default "Select a member" option
  });

  it("calls the onPromote function with the selected member UID", () => {
    const onPromote = jest.fn();
    render(<PromoteMemberForm members={members} onPromote={onPromote} />);

    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: "2" } });

    const promoteButton = screen.getByRole("button", {
      name: "Promote to Admin",
    });
    fireEvent.click(promoteButton);

    expect(onPromote).toHaveBeenCalledWith("2");
  });

  it("calls the onCancel function when cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<PromoteMemberForm members={members} onCancel={onCancel} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });
});
