import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalComponent = ({ amount }) => {
  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "AaXGJYN5rDvypOMCv3kJtbohno_OkRMWegaYpLnHiNM7OMrZX97mU1lqUNSMjA6dPCEUVPzjkxQ6mzjQ",
      }}
    >
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount, // Use the amount passed in as a prop
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            // The transaction is successful. You can add the logic for successful transaction here
            alert("Transaction completed by " + details.payer.name.given_name);
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalComponent;
