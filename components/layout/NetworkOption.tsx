/**
 * Network Selector Component
 *
 * This component provides a network selection interface for contract operations.
 * It allows users to choose between:
 * - Core Mainnet (production network)
 * - Core Testnet (testing network)
 *
 * Features:
 * - Clean, card-based design
 * - Contract address display
 * - Network selection buttons
 * - Callback for network selection
 * - Responsive layout
 */

import React from "react";
import { Button } from "@/components/ui/button";
import type { Network } from "@/types/coredao";

/**
 * Props interface for NetworkSelector component
 */
type NetworkSelectorProps = {
  address: string;
  onSelect: (network: Network) => void;
};

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  address,
  onSelect,
}) => {
  return (
    <div className="w-full max-w-md bg-[#1c1c1c] border border-white/10 rounded-xl p-8 shadow-md">
      {/* Instructions */}
      <p className="text-sm text-gray-300 mb-3">
        Please choose a network to verify:
      </p>

      {/* Contract address display */}
      <div className="bg-black/60 text-gray-200 font-mono text-xs p-3 rounded-lg mb-4 overflow-hidden text-ellipsis">
        {address}
      </div>

      {/* Network selection buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => onSelect("mainnet")}
          className="flex-1 py-2 px-4 bg-muted/100 hover:bg-muted/70 text-white rounded-lg"
        >
          Core Mainnet
        </Button>
        <Button
          onClick={() => onSelect("testnet2")}
          className="flex-1 py-2 px-4 bg-muted/100 hover:bg-muted/70 text-white rounded-lg"
        >
          Core Testnet
        </Button>
      </div>
    </div>
  );
};

export default NetworkSelector;
