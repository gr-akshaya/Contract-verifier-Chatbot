import React from "react";
import { Button } from "@/components/ui/button";
import type { Network } from "@/types/coredao";

type NetworkSelectorProps = {
  address: string;
  onSelect: (network: Network) => void;
};

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ address, onSelect }) => {
  return (
    <div className="flex flex-col gap-4">
    {/* Heading */}
    <p className="text-gray-300 text-sm leading-[140%] px-4 py-2">
      Please choose a network to proceed with verification:
    </p>
    <div className="w-full max-w-md bg-transparent p-6 flex flex-col gap-6">
      {/* Address display */}
      <div className="bg-transparent text-gray-200 font-mono text-xs px-4 py-3 rounded-lg border border-white/10 overflow-hidden text-ellipsis">
        {address} :
      </div>

      {/* Network buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => onSelect("mainnet")}
          className="flex-1 h-12 bg-muted/100 hover:bg-muted/70 text-white rounded-lg font-medium"
        >
          Core Mainnet
        </Button>
        <Button
          onClick={() => onSelect("testnet2")}
          className="flex-1 h-12 bg-muted/100 hover:bg-muted/70 text-white rounded-lg font-medium"
        >
          Core Testnet
        </Button>
      </div>
    </div>
    </div>
  );
};

export default NetworkSelector;
