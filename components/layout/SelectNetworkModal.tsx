const showNetworkSelectionModal = (
    address: string,
    commandType: "verify" | "lookup",
    originalInput: string
  ) => {
    addMessage(
      "ai",
      undefined,
      <div className="bg-card text-card-foreground rounded-xl p-4 max-w-md mx-auto">
        <h3 className="font-semibold mb-4">🌐 Select Network</h3>
        <p className="mb-4">
          You didn’t specify a network. Please select which network to use for{" "}
          {commandType === "verify" ? "verification" : "lookup"}:
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => {
              const selectedNetwork: Network = "mainnet";
              addMessage("user", "Selected network: Mainnet");
              if (commandType === "verify") {
                startVerificationFlow(address, selectedNetwork);
              } else {
                performContractLookup(address, `on mainnet`); // append network to input
              }
            }}
            className="flex-1"
          >
            Mainnet
          </Button>
          <Button
            onClick={() => {
              const selectedNetwork: Network = "testnet";
              addMessage("user", "Selected network: Testnet");
              if (commandType === "verify") {
                startVerificationFlow(address, selectedNetwork);
              } else {
                performContractLookup(address, `on testnet`);
              }
            }}
            className="flex-1"
          >
            Testnet
          </Button>
        </div>
      </div>
    );
  };
  